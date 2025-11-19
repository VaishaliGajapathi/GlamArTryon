import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Sparkles, ArrowRight, X } from 'lucide-react';

export default function HomeTryOnWidget() {
  const [humanPreview, setHumanPreview] = useState<string | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreview: (url: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start max-w-5xl mx-auto">
      {/* Upload Areas */}
      <div className="grid grid-cols-2 gap-4">
        {/* Human Photo Upload */}
        <Card className="border hover:border-primary/40 transition-colors">
          <CardHeader className="p-4">
            <CardTitle className="text-sm">1. Your Photo</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="relative">
              <input
                id="demo-human"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setHumanPreview)}
                className="hidden"
                data-testid="input-demo-human"
              />
              {humanPreview ? (
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                  <img
                    src={humanPreview}
                    alt="Your photo"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setHumanPreview(null)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="demo-human"
                  className="block aspect-[3/4] border-2 border-dashed rounded-lg hover:bg-accent/50 cursor-pointer transition-all"
                >
                  <div className="h-full flex flex-col items-center justify-center p-3 text-center">
                    <div className="w-10 h-10 rounded-full gradient-bg-soft flex items-center justify-center mb-2">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs font-medium">Upload</p>
                  </div>
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Garment Photo Upload */}
        <Card className="border hover:border-primary/40 transition-colors">
          <CardHeader className="p-4">
            <CardTitle className="text-sm">2. Clothing</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="relative">
              <input
                id="demo-garment"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, setGarmentPreview)}
                className="hidden"
                data-testid="input-demo-garment"
              />
              {garmentPreview ? (
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                  <img
                    src={garmentPreview}
                    alt="Clothing item"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setGarmentPreview(null)}
                    className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="demo-garment"
                  className="block aspect-[3/4] border-2 border-dashed rounded-lg hover:bg-accent/50 cursor-pointer transition-all"
                >
                  <div className="h-full flex flex-col items-center justify-center p-3 text-center">
                    <div className="w-10 h-10 rounded-full gradient-bg-soft flex items-center justify-center mb-2">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs font-medium">Upload</p>
                  </div>
                </label>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview & CTA */}
      <div>
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader className="text-center p-4">
            <CardTitle className="text-lg">Sign Up to Generate</CardTitle>
            <CardDescription className="text-sm">
              Upload both images, then sign up free
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            {/* CTA */}
            <Link href="/signup">
              <Button
                size="lg"
                className="w-full gradient-bg-primary"
                disabled={!humanPreview || !garmentPreview}
                data-testid="button-signup-tryon"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Try It Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            {(!humanPreview || !garmentPreview) && (
              <p className="text-xs text-center text-muted-foreground">
                Upload both images to continue
              </p>
            )}
            
            <div className="text-xs text-center text-muted-foreground space-y-1">
              <p>✓ No credit card • ✓ Results in 10s</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
