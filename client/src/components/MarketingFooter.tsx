import { Link } from 'wouter';
import { Sparkles } from 'lucide-react';

export default function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">GlamAR</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              First-ever e-commerce virtual try-on plugin. Transform your online shopping experience with AI.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/pricing">
                  <a className="hover:text-primary transition-colors">Pricing</a>
                </Link>
              </li>
              <li>
                <Link href="/plugin-demo">
                  <a className="hover:text-primary transition-colors">Demo</a>
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">API Docs</a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about">
                  <a className="hover:text-primary transition-colors">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="hover:text-primary transition-colors">Contact</a>
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Terms</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} GlamAR. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
