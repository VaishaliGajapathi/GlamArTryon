import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { User } from "@shared/schema";

// Environment variables for JWT secrets
export const JWT_SECRET = process.env.JWT_SECRET || "dev-jwt-secret-only-for-development-min32chars";
export const JWT_REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || "dev-refresh-secret-only-for-development-min32";

export const JWT_EXPIRY = "15m"; // 15 minutes for access token
export const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days for refresh token

// JWT payload type
export interface JWTPayload {
  userId: string;
  email: string;
}

// Generate access token
export function generateAccessToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// Generate refresh token
export function generateRefreshToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

// Hash token for storage
export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

// Verify access token
export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

// Verify refresh token
export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
}
