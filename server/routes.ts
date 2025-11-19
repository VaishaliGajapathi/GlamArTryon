import type { Express } from "express";
import { createServer, type Server } from "http";
import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { storage } from "./storage";
import { authenticateJWT } from "./auth";
import authRoutes from "./auth";
import googleOAuthRoutes from "./google-oauth";
import subscriptionRoutes from "./subscription-routes";
import notificationRoutes from "./notification-routes";
import { replicateAdapter } from "./replicate-adapter";

// Configure multer for file uploads (in-memory storage for MVP)
const upload = multer({ 
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.random().toString(36).substring(2, 15);
      const ext = file.originalname.split('.').pop();
      cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Request schemas
const tryonRequestSchema = z.object({
  productId: z.string().optional(),
  garmentUrl: z.string().url().optional(),
});

const sdkTryonSchema = z.object({
  garmentUrl: z.string().url(),
  productId: z.string().optional(),
  siteToken: z.string(),
});

// Middleware: Rate limiting (simple in-memory implementation for MVP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(maxRequests: number = 20, windowMs: number = 60000) {
  return (req: any, res: any, next: any) => {
    const identifier = req.user?.id || req.ip;
    const now = Date.now();
    
    const userLimit = rateLimitMap.get(identifier);
    
    if (!userLimit || now > userLimit.resetAt) {
      // Reset window
      rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs });
      return next();
    }
    
    if (userLimit.count >= maxRequests) {
      return res.status(429).json({ 
        error: "Rate limit exceeded",
        retryAfter: Math.ceil((userLimit.resetAt - now) / 1000)
      });
    }
    
    userLimit.count++;
    next();
  };
}

// Middleware: Site token validation
async function validateSiteToken(req: any, res: any, next: any) {
  const siteToken = req.headers['x-site-token'] || req.body.siteToken;
  
  if (!siteToken) {
    return res.status(401).json({ error: "Site token required" });
  }
  
  const integration = await storage.getSiteIntegrationByToken(siteToken);
  if (!integration) {
    return res.status(401).json({ error: "Invalid site token" });
  }
  
  // Validate origin/referer against allowed domains
  const origin = req.headers.origin || req.headers.referer;
  if (origin && integration.allowedDomains.length > 0) {
    const isAllowed = integration.allowedDomains.some(domain => 
      origin.includes(domain)
    );
    
    if (!isAllowed) {
      return res.status(403).json({ error: "Domain not authorized" });
    }
  }
  
  req.siteIntegration = integration;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = Router();
  
  // Auth routes (no /api prefix)
  app.use("/auth", authRoutes);
  app.use("/auth", googleOAuthRoutes);
  
  // Subscription routes
  apiRouter.use("/subscriptions", subscriptionRoutes);
  
  // Notification routes
  apiRouter.use("/notifications", notificationRoutes);
  
  // POST /api/tryon - Create try-on request with image upload
  apiRouter.post(
    "/tryon",
    authenticateJWT,
    rateLimit(20),
    upload.fields([
      { name: 'humanImage', maxCount: 1 },
      { name: 'garmentImage', maxCount: 1 }
    ]),
    async (req: any, res) => {
      try {
        const body = tryonRequestSchema.parse(req.body);
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        if (!files?.humanImage?.[0]) {
          return res.status(400).json({ error: "Human image required" });
        }
        
        // Garment can be either uploaded or URL
        let garmentUrl = body.garmentUrl;
        if (!garmentUrl && !files?.garmentImage?.[0]) {
          return res.status(400).json({ error: "Garment image or URL required" });
        }
        
        // Check user credits
        const user = req.user;
        if (user.credits < 1) {
          return res.status(402).json({ error: "Insufficient credits" });
        }
        
        // Store human image
        const humanImageFile = files.humanImage[0];
        const humanImageKey = humanImageFile.filename;
        const humanImageUrl = `${req.protocol}://${req.get('host')}/uploads/${humanImageFile.filename}`;
        
        // If garment was uploaded, store it
        if (files?.garmentImage?.[0] && !garmentUrl) {
          const garmentImageFile = files.garmentImage[0];
          garmentUrl = `${req.protocol}://${req.get('host')}/uploads/${garmentImageFile.filename}`;
        }
        
        // Create try-on record with 24-hour expiry
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        const tryon = await storage.createTryon({
          userId: user.id,
          productId: body.productId,
          garmentUrl: garmentUrl!,
          humanImageKey,
          expiresAt,
          status: "queued",
        });
        
        // Deduct credit
        await storage.updateUserCredits(user.id, user.credits - 1);
        
        // Audit log
        await storage.createAuditLog({
          userId: user.id,
          action: "tryon_created",
          detail: { tryonId: tryon.id, productId: body.productId },
        });
        
        // Process try-on asynchronously (in production: add to Redis queue)
        processTryonAsync(tryon.id, humanImageUrl, garmentUrl!);
        
        res.status(201).json({
          id: tryon.id,
          status: tryon.status,
          created_at: tryon.createdAt,
          expires_at: tryon.expiresAt,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: "Invalid input", details: error.issues });
        }
        console.error("Try-on error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );
  
  // POST /api/sdk/tryon - SDK endpoint for plugin (uses site token)
  apiRouter.post(
    "/sdk/tryon",
    validateSiteToken,
    rateLimit(50), // Higher limit for SDK
    upload.single('humanImage'),
    async (req: any, res) => {
      try {
        const body = sdkTryonSchema.parse(req.body);
        const humanImage = req.file;
        
        if (!humanImage) {
          return res.status(400).json({ error: "Human image required" });
        }
        
        // Get site owner to charge credits
        const integration = req.siteIntegration;
        const owner = await storage.getUser(integration.ownerUserId);
        
        if (!owner) {
          return res.status(500).json({ error: "Site owner not found" });
        }
        
        if (owner.credits < 1) {
          return res.status(402).json({ 
            error: "Site owner has insufficient credits",
            message: "Please contact the site administrator"
          });
        }
        
        // Store human image
        const humanImageKey = humanImage.filename;
        const humanImageUrl = `${req.protocol}://${req.get('host')}/uploads/${humanImage.filename}`;
        
        // Create try-on with 24-hour expiry
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        const tryon = await storage.createTryon({
          userId: owner.id,
          productId: body.productId,
          garmentUrl: body.garmentUrl,
          humanImageKey,
          expiresAt,
          status: "queued",
        });
        
        // Deduct credit from site owner
        await storage.updateUserCredits(owner.id, owner.credits - 1);
        
        // Audit log
        await storage.createAuditLog({
          userId: owner.id,
          action: "sdk_tryon_created",
          detail: { 
            tryonId: tryon.id, 
            siteId: integration.siteId,
            productId: body.productId 
          },
        });
        
        // Process async
        processTryonAsync(tryon.id, humanImageUrl, body.garmentUrl);
        
        res.status(201).json({
          id: tryon.id,
          status: tryon.status,
          created_at: tryon.createdAt,
          expires_at: tryon.expiresAt,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ error: "Invalid input", details: error.issues });
        }
        console.error("SDK try-on error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );
  
  // GET /api/tryon/:id - Get try-on result
  apiRouter.get("/tryon/:id", authenticateJWT, async (req: any, res) => {
    try {
      const tryon = await storage.getTryon(req.params.id);
      
      if (!tryon) {
        return res.status(404).json({ error: "Try-on not found" });
      }
      
      // Verify ownership
      if (tryon.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json({
        id: tryon.id,
        status: tryon.status,
        output_url: tryon.outputImageKey,
        garment_url: tryon.garmentUrl,
        product_id: tryon.productId,
        created_at: tryon.createdAt,
        expires_at: tryon.expiresAt,
      });
    } catch (error) {
      console.error("Get try-on error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // GET /api/tryon - Get user's try-on history
  apiRouter.get("/tryon", authenticateJWT, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const tryons = await storage.getTryonsByUser(req.user.id, limit);
      
      res.json({
        tryons: tryons.map(t => ({
          id: t.id,
          status: t.status,
          output_url: t.outputImageKey,
          garment_url: t.garmentUrl,
          product_id: t.productId,
          created_at: t.createdAt,
          expires_at: t.expiresAt,
        })),
        total: tryons.length,
      });
    } catch (error) {
      console.error("Get try-ons error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // DELETE /api/tryon/:id - Delete try-on
  apiRouter.delete("/tryon/:id", authenticateJWT, async (req: any, res) => {
    try {
      const tryon = await storage.getTryon(req.params.id);
      
      if (!tryon) {
        return res.status(404).json({ error: "Try-on not found" });
      }
      
      // Verify ownership
      if (tryon.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      await storage.deleteTryon(req.params.id);
      
      // Audit log
      await storage.createAuditLog({
        userId: req.user.id,
        action: "tryon_deleted",
        detail: { tryonId: req.params.id },
      });
      
      res.json({ message: "Try-on deleted successfully" });
    } catch (error) {
      console.error("Delete try-on error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Admin routes (require admin auth - simplified for MVP)
  apiRouter.get("/admin/metrics", authenticateJWT, async (req: any, res) => {
    // In production: check if user is admin
    try {
      const auditLogs = await storage.getAuditLogs(100);
      const allUsers = Array.from((storage as any).users.values());
      const allTryons = Array.from((storage as any).tryons.values());
      
      res.json({
        total_users: allUsers.length,
        total_tryons: allTryons.length,
        active_tryons: allTryons.filter((t: any) => t.status === "done").length,
        failed_tryons: allTryons.filter((t: any) => t.status === "failed").length,
        recent_activity: auditLogs.slice(0, 20),
      });
    } catch (error) {
      console.error("Admin metrics error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  apiRouter.post("/admin/purge-cache", authenticateJWT, async (req: any, res) => {
    try {
      const deleted = await storage.deleteExpiredTryons();
      
      await storage.createAuditLog({
        userId: req.user.id,
        action: "admin_purge_cache",
        detail: { deleted_count: deleted },
      });
      
      res.json({ 
        message: "Cache purged successfully",
        deleted_count: deleted 
      });
    } catch (error) {
      console.error("Purge cache error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Site integration management
  apiRouter.post("/integrations", authenticateJWT, async (req: any, res) => {
    try {
      const { allowedDomains } = req.body;
      
      if (!Array.isArray(allowedDomains)) {
        return res.status(400).json({ error: "allowedDomains must be an array" });
      }
      
      // Generate site token
      const siteToken = `glamar_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      const integration = await storage.createSiteIntegration({
        siteToken,
        ownerUserId: req.user.id,
        allowedDomains,
      });
      
      await storage.createAuditLog({
        userId: req.user.id,
        action: "integration_created",
        detail: { siteId: integration.siteId },
      });
      
      res.status(201).json({
        site_id: integration.siteId,
        site_token: integration.siteToken,
        allowed_domains: integration.allowedDomains,
      });
    } catch (error) {
      console.error("Create integration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  apiRouter.get("/integrations", authenticateJWT, async (req: any, res) => {
    try {
      const integrations = await storage.getSiteIntegrationsByOwner(req.user.id);
      
      res.json({
        integrations: integrations.map(i => ({
          site_id: i.siteId,
          site_token: i.siteToken,
          allowed_domains: i.allowedDomains,
          created_at: i.createdAt,
        })),
      });
    } catch (error) {
      console.error("Get integrations error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Health check
  apiRouter.get("/health", (req, res) => {
    res.json({ status: "ok", service: "glamar-api" });
  });
  
  // Public API routes (for plugin - uses site token authentication)
  const publicRouter = Router();
  
  // POST /api/public/tryon - Create try-on from plugin (site token auth)
  publicRouter.post(
    "/tryon",
    validateSiteToken,
    upload.fields([{ name: 'humanImage', maxCount: 1 }]),
    rateLimit(30, 60000),
    async (req: any, res) => {
      try {
        const integration = req.integration;
        const owner = await storage.getUser(integration.ownerId);
        
        if (!owner) {
          return res.status(404).json({ error: "Integration owner not found" });
        }
        
        // Check credits
        if (owner.credits < 1) {
          return res.status(402).json({ 
            error: "Insufficient credits", 
            message: "The site owner has run out of credits" 
          });
        }
        
        // Get uploaded file
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        if (!files?.humanImage?.[0]) {
          return res.status(400).json({ error: "humanImage file required" });
        }
        
        const garmentUrl = req.body.garmentUrl;
        if (!garmentUrl) {
          return res.status(400).json({ error: "garmentUrl required" });
        }
        
        const humanFile = files.humanImage[0];
        const humanImageUrl = `http://${req.get('host')}/uploads/${humanFile.filename}`;
        const humanImageKey = humanFile.filename;
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        // Create try-on record
        const tryon = await storage.createTryon({
          userId: owner.id,
          siteId: integration.siteId,
          garmentUrl,
          humanImageKey,
          expiresAt,
          status: "queued",
        });
        
        // Deduct credit
        await storage.updateUserCredits(owner.id, owner.credits - 1);
        
        // Audit log
        await storage.createAuditLog({
          userId: owner.id,
          action: "plugin_tryon_created",
          detail: { 
            tryonId: tryon.id, 
            siteId: integration.siteId,
          },
        });
        
        // Process async
        processTryonAsync(tryon.id, humanImageUrl, garmentUrl);
        
        res.status(201).json({
          id: tryon.id,
          status: tryon.status,
          created_at: tryon.createdAt,
        });
      } catch (error) {
        console.error("Plugin try-on error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );
  
  // GET /api/public/tryon/:id - Get try-on result (site token auth)
  publicRouter.get("/tryon/:id", validateSiteToken, async (req: any, res) => {
    try {
      const tryon = await storage.getTryon(req.params.id);
      
      if (!tryon) {
        return res.status(404).json({ error: "Try-on not found" });
      }
      
      // Verify this try-on belongs to this site
      if (tryon.siteId !== req.integration.siteId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json({
        id: tryon.id,
        status: tryon.status,
        output_url: tryon.outputImageKey,
        garment_url: tryon.garmentUrl,
        created_at: tryon.createdAt,
      });
    } catch (error) {
      console.error("Get public try-on error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Plugin API routes (for demo e-commerce integration - no auth required, uses site token)
  const pluginRouter = Router();
  
  // POST /api/plugin/try-on - Plugin try-on endpoint (simplified for demo)
  pluginRouter.post(
    "/try-on",
    upload.fields([
      { name: 'humanImage', maxCount: 1 },
      { name: 'garmentImage', maxCount: 1 }
    ]),
    async (req: any, res) => {
      try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        const siteToken = req.headers['x-site-token'];
        
        if (!files?.humanImage?.[0] || !files?.garmentImage?.[0]) {
          return res.status(400).json({ error: "Both images required" });
        }
        
        // For demo, create anonymous try-on without strict validation
        const humanImageFile = files.humanImage[0];
        const garmentImageFile = files.garmentImage[0];
        
        const humanImageKey = humanImageFile.filename;
        const humanImageUrl = `${req.protocol}://${req.get('host')}/uploads/${humanImageFile.filename}`;
        const garmentUrl = `${req.protocol}://${req.get('host')}/uploads/${garmentImageFile.filename}`;
        
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        // Create demo try-on (no user required for demo)
        const tryon = await storage.createTryon({
          userId: 'demo-user', // Demo user
          garmentUrl,
          humanImageKey,
          expiresAt,
          status: "queued",
        });
        
        // Process async
        processTryonAsync(tryon.id, humanImageUrl, garmentUrl);
        
        res.status(201).json({
          id: tryon.id,
          status: tryon.status,
          created_at: tryon.createdAt,
          expires_at: tryon.expiresAt,
        });
      } catch (error) {
        console.error("Plugin try-on error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }
  );
  
  // GET /api/plugin/try-on/:id - Get plugin try-on status/result
  pluginRouter.get("/try-on/:id", async (req: any, res) => {
    try {
      const tryon = await storage.getTryon(req.params.id);
      
      if (!tryon) {
        return res.status(404).json({ error: "Try-on not found" });
      }
      
      res.json({
        id: tryon.id,
        status: tryon.status,
        outputUrl: tryon.outputImageKey,
        garmentUrl: tryon.garmentUrl,
        created_at: tryon.createdAt,
        expires_at: tryon.expiresAt,
      });
    } catch (error) {
      console.error("Get plugin try-on error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Mount API routes
  app.use("/api/plugin", pluginRouter);
  app.use("/api/public", publicRouter);
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}

// Async try-on processing (in production: Redis queue worker)
async function processTryonAsync(tryonId: string, humanImageUrl: string, garmentUrl: string) {
  try {
    // Update status to processing
    await storage.updateTryonStatus(tryonId, "processing");
    
    // Call Replicate API
    const result = await replicateAdapter.processTryOn({
      humanImageUrl,
      garmentImageUrl: garmentUrl,
    });
    
    if (result.success && result.outputUrl) {
      // Update with output
      await storage.updateTryonStatus(
        tryonId,
        "done",
        result.outputUrl,
        result.replicateData
      );
    } else {
      await storage.updateTryonStatus(tryonId, "failed");
    }
  } catch (error) {
    console.error("Process try-on error:", error);
    await storage.updateTryonStatus(tryonId, "failed");
  }
}
