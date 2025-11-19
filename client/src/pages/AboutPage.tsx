import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Heart, Lightbulb, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            About <span className="gradient-text">GlamAR</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            We're on a mission to revolutionize online shopping with AI-powered virtual try-on technology
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <p className="text-lg text-muted-foreground mb-6">
            GlamAR was born from a simple observation: online shopping has a fundamental problem. 
            Customers can't try before they buy, leading to high return rates and low confidence in purchases.
          </p>
          <p className="text-lg text-muted-foreground mb-6">
            We set out to solve this with cutting-edge AI technology. By leveraging Google's Gemini 2.5 Flash model, 
            we created the world's first plug-and-play virtual try-on solution that works with any e-commerce platform.
          </p>
          <p className="text-lg text-muted-foreground">
            Today, GlamAR helps thousands of brands increase conversions, reduce returns, and create delightful 
            shopping experiences for their customers.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground">
              What drives us every day
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Target,
                title: 'Innovation First',
                description: 'We push the boundaries of AI to create breakthrough experiences.',
              },
              {
                icon: Heart,
                title: 'Customer Focus',
                description: 'Every decision is made with our customers and their users in mind.',
              },
              {
                icon: Lightbulb,
                title: 'Simplicity',
                description: 'Complex technology should be simple to use. One line of code proves it.',
              },
              {
                icon: Globe,
                title: 'Accessibility',
                description: 'Premium technology should be accessible to businesses of all sizes.',
              },
            ].map((value) => (
              <Card key={value.title}>
                <CardHeader>
                  <value.icon className="w-12 h-12 text-primary mb-4" />
                  <CardTitle>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
          <p className="text-2xl text-muted-foreground leading-relaxed">
            To empower every e-commerce business with AI-powered virtual try-on technology, 
            making online shopping as confident and delightful as shopping in person.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powered by Innovation</h2>
            <p className="text-xl text-muted-foreground">
              Built by a team passionate about AI and e-commerce
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                name: 'Advanced AI Technology',
                role: 'Google Gemini 2.5 Flash',
                description: 'State-of-the-art AI model for photorealistic results',
              },
              {
                name: 'E-Commerce Expertise',
                role: 'Industry Veterans',
                description: 'Deep understanding of online retail challenges',
              },
              {
                name: 'Developer-First',
                role: 'Simple Integration',
                description: 'Built by developers, for developers',
              },
            ].map((member) => (
              <Card key={member.name} className="text-center">
                <CardHeader>
                  <div className="w-20 h-20 rounded-full gradient-bg-primary mx-auto mb-4" />
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
