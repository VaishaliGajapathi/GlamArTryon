import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Zap, Code, Shield, TrendingUp, Users, Play, ArrowRight, Check } from 'lucide-react';
import HomeTryOnWidget from '@/components/HomeTryOnWidget';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg-soft opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-24 sm:pb-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-white shadow-sm mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">First-Ever E-Commerce Virtual Try-On Plugin</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Transform Your
              <span className="block gradient-text">E-Commerce Experience</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10">
              Add photorealistic AI virtual try-on to any e-commerce site with just one line of code. 
              Powered by Google's Gemini 2.5 Flash for commercial-grade results.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/signup">
                <Button size="lg" className="gradient-bg-primary text-lg px-8 h-14" data-testid="button-get-started">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 h-14" data-testid="button-watch-demo">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Demo Image/Video Placeholder */}
            <div className="relative max-w-5xl mx-auto">
              <div className="rounded-2xl overflow-hidden border-2 border-primary/10 shadow-2xl bg-white">
                <div className="aspect-video gradient-bg-soft flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-4">
                      <Play className="w-12 h-12 text-primary" />
                    </div>
                    <p className="text-lg font-medium text-foreground">Watch Demo</p>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-x-20 -inset-y-10 gradient-bg-primary opacity-10 blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Users', value: '10K+' },
              { label: 'Try-Ons Generated', value: '500K+' },
              { label: 'E-Commerce Sites', value: '1,200+' },
              { label: 'Conversion Increase', value: '47%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose <span className="gradient-text">GlamAR?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The most advanced virtual try-on technology, designed for modern e-commerce
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'One-Line Integration',
                description: 'Add virtual try-on to your site with a single script tag. No complex setup, no training required.',
              },
              {
                icon: Sparkles,
                title: 'Photorealistic AI',
                description: 'Powered by Google Gemini 2.5 Flash for ultra-realistic, commercial-grade try-on results.',
              },
              {
                icon: Code,
                title: 'Auto-Detection',
                description: 'Automatically detects product images on your pages. Works with any e-commerce platform.',
              },
              {
                icon: Shield,
                title: 'Commercial License',
                description: 'Full commercial rights included. Use in production without licensing worries.',
              },
              {
                icon: TrendingUp,
                title: 'Boost Conversions',
                description: 'Increase sales by 47% on average. Reduce returns with confident purchases.',
              },
              {
                icon: Users,
                title: 'Customer Delight',
                description: 'Give customers the confidence to buy with instant virtual try-on experiences.',
              },
            ].map((feature) => (
              <Card key={feature.title} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes, not days
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Add One Line of Code',
                description: 'Copy the embed code from your dashboard and paste it into your website.',
              },
              {
                step: '02',
                title: 'Auto-Detection',
                description: 'Our plugin automatically finds product images and adds the "Try On" button.',
              },
              {
                step: '03',
                title: 'Customer Tries On',
                description: 'Customers upload their photo and see photorealistic try-on results in seconds.',
              },
            ].map((step) => (
              <div key={step.step} className="relative">
                <div className="text-6xl font-bold gradient-text opacity-20 mb-4">{step.step}</div>
                <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Virtual Try-On Demo - FUNCTIONAL */}
      <section className="py-16 gradient-bg-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3">
              Try It <span className="gradient-text">Yourself</span>
            </h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto">
              Upload your photo and clothing to see the magic. Sign up free to generate!
            </p>
          </div>

          <HomeTryOnWidget />
        </div>
      </section>

      {/* Plugin Showcase */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-6">
                <Code className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Revolutionary Plugin</span>
              </div>
              <h2 className="text-4xl font-bold mb-6">
                First-Ever E-Commerce
                <span className="block gradient-text">Virtual Try-On Plugin</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Unlike traditional integrations that require complex SDKs and backend changes, 
                GlamAR works instantly with just one line of code. Our intelligent plugin:
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Automatically detects product images',
                  'Seamlessly integrates with any platform',
                  'Requires zero backend changes',
                  'Updates in real-time automatically',
                  'Works on mobile and desktop',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/plugin-demo">
                <Button size="lg" variant="outline" data-testid="button-see-demo">
                  See Live Demo
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <Card className="p-6 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Embed Code</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs sm:text-sm bg-secondary/50 p-4 rounded-lg overflow-x-auto">
                    <code className="text-primary">{`<!-- Just add this one line -->
<script src="https://glamar.app/plugin.js" 
        data-glamar-token="YOUR_TOKEN">
</script>`}</code>
                  </pre>
                </CardContent>
              </Card>
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-pink-500/20 blur-2xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden gradient-bg-soft">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Transform Your
            <span className="block gradient-text">E-Commerce Experience?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of brands already using GlamAR to increase conversions and delight customers
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="gradient-bg-primary text-lg px-8 h-14" data-testid="button-start-free">
                Start Free Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline" className="text-lg px-8 h-14" data-testid="button-view-pricing">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
