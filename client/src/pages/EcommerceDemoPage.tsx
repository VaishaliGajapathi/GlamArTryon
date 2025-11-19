import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Heart, Star, Sparkles, Upload, X, Loader2, MoreVertical, RefreshCw, Trash2 } from 'lucide-react';

interface GeneratedImage {
  id: string;
  url: string;
  timestamp: number;
}

export default function EcommerceDemoPage() {
  const [showTryOnPanel, setShowTryOnPanel] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedGeneratedImage, setSelectedGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowPhotoOptions(false);
      }
    };

    if (showPhotoOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPhotoOptions]);

  const productImages = [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500',
    'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500',
  ];

  const [selectedImage, setSelectedImage] = useState(productImages[0]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserPhoto(reader.result as string);
        setResultImage(null);
        setSelectedGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleReplaceImage = () => {
    setShowPhotoOptions(false);
    setUserPhoto(null);
    setResultImage(null);
    setError(null);
    // Clear file input value and trigger click
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleDeleteImage = () => {
    setShowPhotoOptions(false);
    setUserPhoto(null);
    setResultImage(null);
    setError(null);
    // Auto-select the most recent generated image if available
    if (generatedImages.length > 0) {
      setSelectedGeneratedImage(generatedImages[generatedImages.length - 1].url);
    }
  };

  const removeGeneratedImage = (id: string) => {
    setGeneratedImages(prev => prev.filter(img => img.id !== id));
    // Clear selection if the removed image was selected
    const removedImage = generatedImages.find(img => img.id === id);
    if (removedImage && selectedGeneratedImage === removedImage.url) {
      setSelectedGeneratedImage(null);
    }
  };

  const clearAllGeneratedImages = () => {
    setGeneratedImages([]);
    setSelectedGeneratedImage(null);
  };

  const handleSelectGeneratedImage = (url: string) => {
    setSelectedGeneratedImage(url);
  };

  const handleGenerate = async () => {
    if (!userPhoto) return;

    setIsGenerating(true);
    setError(null);
    setResultImage(null);

    try {
      // Convert base64 to blob
      const humanBlob = await fetch(userPhoto).then(r => r.blob());
      const garmentBlob = await fetch(selectedImage).then(r => r.blob());

      const formData = new FormData();
      formData.append('humanImage', humanBlob, 'human.jpg');
      formData.append('garmentImage', garmentBlob, 'garment.jpg');

      // Call the public plugin API (simulated with demo site token)
      const response = await fetch('/api/plugin/try-on', {
        method: 'POST',
        headers: {
          'x-site-token': 'demo-ecommerce-site-token',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate try-on');
      }

      const data = await response.json();
      
      // Poll for result
      let attempts = 0;
      const maxAttempts = 30;
      
      const pollResult = async () => {
        attempts++;
        
        const statusResponse = await fetch(`/api/plugin/try-on/${data.id}`, {
          headers: {
            'x-site-token': 'demo-ecommerce-site-token',
          },
        });

        if (!statusResponse.ok) {
          throw new Error('Failed to check try-on status');
        }

        const statusData = await statusResponse.json();
        console.log(`[Try-on ${data.id.substring(0, 8)}] Status poll #${attempts}:`, statusData.status, statusData.outputUrl ? '✓ has output' : '✗ no output');

        if (statusData.status === 'done' && statusData.outputUrl) {
          console.log(`[Try-on ${data.id.substring(0, 8)}] ✓ Complete! Output URL:`, statusData.outputUrl);
          setResultImage(statusData.outputUrl);
          // Add to generated images gallery
          setGeneratedImages(prev => [...prev, {
            id: data.id,
            url: statusData.outputUrl,
            timestamp: Date.now()
          }]);
          setIsGenerating(false);
        } else if (statusData.status === 'failed') {
          throw new Error('Try-on generation failed');
        } else if (attempts < maxAttempts) {
          setTimeout(pollResult, 3000);
        } else {
          console.error(`[Try-on ${data.id.substring(0, 8)}] ✗ Timeout after ${attempts} attempts. Last status:`, statusData.status);
          throw new Error('Timeout waiting for result');
        }
      };

      pollResult();

    } catch (err: any) {
      console.error('Try-on generation error:', err);
      setError(err.message || 'Failed to generate virtual try-on');
      setIsGenerating(false);
    }
  };

  const resetPanel = () => {
    setShowTryOnPanel(false);
    setUserPhoto(null);
    setResultImage(null);
    setError(null);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Header */}
      <header className="border-b bg-white sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold">Fashion Store</div>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Demo</span>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">Back to GlamAR</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="gradient-bg-primary text-white rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Live E-Commerce Demo - Google Try-On Style</h2>
          </div>
          <p className="text-white/90 mb-4">
            This simulates a real e-commerce product page with GlamAR plugin installed. 
            Click "Try On with AI" to see the side panel experience - just like Google Try-On!
          </p>
          <div className="bg-black/20 rounded-lg p-4">
            <pre className="text-xs sm:text-sm text-white/95 overflow-x-auto">
              <code>{`<!-- Just one line of code -->
<script src="https://glamar.app/plugin.js" data-glamar-token="YOUR_TOKEN"></script>`}</code>
            </pre>
          </div>
        </div>

        {/* Mock Product Page with Side Panel */}
        <div className="relative">
          <div className={`grid gap-12 transition-all duration-300 ${
            showTryOnPanel ? 'lg:grid-cols-[1fr,400px]' : 'lg:grid-cols-2'
          }`}>
            {/* Product Images */}
            <div className="space-y-4">
              <Card className="overflow-hidden border-2">
                <CardContent className="p-0 relative">
                  <img
                    src={selectedImage}
                    alt="Product"
                    className="w-full aspect-square object-cover"
                  />
                  {/* GlamAR Plugin Try-On Button */}
                  <div className="absolute bottom-4 right-4">
                    <Button
                      size="lg"
                      className="gradient-bg-primary shadow-xl"
                      onClick={() => setShowTryOnPanel(true)}
                      data-testid="button-try-on-plugin"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Try On with AI
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((img, i) => (
                  <Card
                    key={i}
                    className={`cursor-pointer transition-all hover:border-primary ${
                      selectedImage === img ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <CardContent className="p-0">
                      <img
                        src={img}
                        alt={`View ${i + 1}`}
                        className="w-full aspect-square object-cover"
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Product Details (collapses when panel opens on mobile) */}
            {!showTryOnPanel && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-bold mb-3">Premium Summer Dress</h1>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="text-muted-foreground">(127 reviews)</span>
                  </div>
                  <p className="text-4xl font-bold gradient-text mb-4">$129.99</p>
                  <p className="text-muted-foreground text-lg">
                    Elegant design perfect for any occasion. Premium fabric ensures comfort and style.
                  </p>
                </div>

                {/* Size Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Select Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-2">
                      {['XS', 'S', 'M', 'L'].map((size) => (
                        <Button key={size} variant="outline" className="h-12">
                          {size}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button size="lg" className="w-full h-14 text-lg">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                  <Button size="lg" variant="outline" className="w-full h-14">
                    <Heart className="w-5 h-5 mr-2" />
                    Add to Wishlist
                  </Button>
                </div>

                {/* Features */}
                <Card className="gradient-bg-soft border-primary/20">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <span className="font-medium">Try before you buy with AI Virtual Try-On</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-primary">✓</span>
                        <span>Free shipping on orders over $50</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-primary">✓</span>
                        <span>30-day return policy</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Try-On Side Panel - Google Try-On Style */}
            {showTryOnPanel && (
              <div className="lg:sticky lg:top-20 h-fit">
                <Card className="border-2 border-primary/20 shadow-xl">
                  <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-pink-500/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg gradient-bg-primary flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Virtual Try-On</CardTitle>
                          <p className="text-xs text-muted-foreground">Powered by GlamAR AI</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetPanel}
                        disabled={isGenerating}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4 space-y-4">
                    {/* Your Photo / Result Section */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        {(selectedGeneratedImage || resultImage) ? 'Your Result' : 'Your Photo'}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="user-photo-panel"
                        ref={fileInputRef}
                        disabled={isGenerating}
                      />
                      {(userPhoto || selectedGeneratedImage) ? (
                        <div className="relative aspect-[3/4] rounded-lg overflow-visible border-2">
                          {/* Show selected generated image, or result, or user photo */}
                          <img 
                            src={selectedGeneratedImage || resultImage || userPhoto} 
                            alt={(selectedGeneratedImage || resultImage) ? "Try-on result" : "Your photo"} 
                            className="w-full h-full object-cover rounded-lg" 
                          />
                          
                          {/* Generating overlay on user photo */}
                          {isGenerating && (
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-pink-500/5 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
                              <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
                              <p className="font-semibold text-sm">Generating...</p>
                              <p className="text-xs text-muted-foreground mt-1">~10 seconds</p>
                            </div>
                          )}
                          
                          {/* Result badge - only show on latest generated image */}
                          {(selectedGeneratedImage || resultImage) && !isGenerating && (
                            <>
                              {/* Only show badge if this is the latest generated image */}
                              {generatedImages.length > 0 && 
                               generatedImages[generatedImages.length - 1].url === (selectedGeneratedImage || resultImage) && (
                                <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                                  ✓ Generated
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* Photo options menu - shown when any image is displayed */}
                          {!isGenerating && (
                            <div className="absolute top-2 right-2" ref={optionsMenuRef}>
                              <button
                                onClick={() => setShowPhotoOptions(!showPhotoOptions)}
                                className="bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80 transition-colors"
                                data-testid="button-photo-options"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              {/* Options dropdown */}
                              {showPhotoOptions && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                                  {userPhoto ? (
                                    <>
                                      <button
                                        onClick={handleReplaceImage}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        data-testid="option-replace-image"
                                      >
                                        <RefreshCw className="w-4 h-4 text-primary" />
                                        <span>Replace Image</span>
                                      </button>
                                      <button
                                        onClick={handleDeleteImage}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-600 dark:text-red-400"
                                        data-testid="option-delete-image"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete Image</span>
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setShowPhotoOptions(false);
                                        fileInputRef.current?.click();
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                      data-testid="option-upload-new"
                                    >
                                      <Upload className="w-4 h-4 text-primary" />
                                      <span>Upload New Photo</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <label
                          htmlFor="user-photo-panel"
                          className="block aspect-[3/4] border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-all"
                          data-testid="label-upload-photo"
                        >
                          <div className="h-full flex flex-col items-center justify-center p-4">
                            <div className="w-12 h-12 rounded-full gradient-bg-soft flex items-center justify-center mb-2">
                              <Upload className="w-6 h-6 text-primary" />
                            </div>
                            <p className="text-sm font-medium">Upload photo</p>
                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG</p>
                          </div>
                        </label>
                      )}
                    </div>

                    {/* Product thumbnail - always shown in try-on panel */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Product</label>
                      <div className="flex gap-2">
                        <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-primary/30">
                          <img 
                            src={selectedImage} 
                            alt="Product thumbnail" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1 flex items-center">
                          <p className="text-xs text-muted-foreground">
                            {resultImage ? 'Wearing this outfit' : 'Ready to try on'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Generated Images Gallery */}
                    {generatedImages.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-semibold">Generated ({generatedImages.length})</label>
                          <button
                            onClick={clearAllGeneratedImages}
                            className="text-xs text-red-600 dark:text-red-400 hover:underline"
                            data-testid="button-clear-all"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {generatedImages.map((img, index) => (
                            <div 
                              key={img.id} 
                              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 group cursor-pointer transition-all ${
                                selectedGeneratedImage === img.url 
                                  ? 'border-primary ring-2 ring-primary/50' 
                                  : 'border-primary/30 hover:border-primary/50'
                              }`}
                              onClick={() => handleSelectGeneratedImage(img.url)}
                              data-testid={`thumbnail-generated-${img.id}`}
                            >
                              <img 
                                src={img.url} 
                                alt="Generated result" 
                                className="w-full h-full object-cover" 
                              />
                              {/* Show "generated" badge on latest image only */}
                              {index === generatedImages.length - 1 && (
                                <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-[9px] font-medium py-0.5 text-center">
                                  Generated
                                </div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeGeneratedImage(img.id);
                                }}
                                className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                data-testid={`button-remove-${img.id}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-xs">{error}</p>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="border-t p-4 flex-col gap-2">
                    <Button
                      size="lg"
                      className="w-full gradient-bg-primary"
                      disabled={!userPhoto || isGenerating}
                      onClick={handleGenerate}
                      data-testid="button-generate-tryon"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          {resultImage ? 'Try Another Product' : 'Generate Try-On'}
                        </>
                      )}
                    </Button>
                    {!userPhoto && (
                      <p className="text-xs text-center text-muted-foreground">
                        Upload your photo first
                      </p>
                    )}
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
