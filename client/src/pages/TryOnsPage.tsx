import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { tryonAPI } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Download, Trash2, Loader2, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import DashboardLayout from './DashboardLayout';

export default function TryOnsPage() {
  const { toast } = useToast();
  const [humanImage, setHumanImage] = useState<File | null>(null);
  const [garmentImage, setGarmentImage] = useState<File | null>(null);
  const [humanImagePreview, setHumanImagePreview] = useState<string | null>(null);
  const [garmentImagePreview, setGarmentImagePreview] = useState<string | null>(null);
  const [garmentUrl, setGarmentUrl] = useState('');
  const [productId, setProductId] = useState('');

  const { data: tryonsData, isLoading } = useQuery({
    queryKey: ['/api/tryon'],
    queryFn: () => tryonAPI.list(50),
    refetchInterval: 3000, // Poll every 3 seconds for status updates
  });

  // Check if there are any processing try-ons and log them
  useEffect(() => {
    if (tryonsData?.tryons) {
      const processing = tryonsData.tryons.filter((t: any) => 
        t.status === 'processing' || t.status === 'queued'
      );
      if (processing.length > 0) {
        console.log('Try-ons still processing:', processing);
      }
      
      // Log all try-ons with their status and output_url
      tryonsData.tryons.forEach((t: any) => {
        console.log(`Try-on ${t.id.substring(0, 8)}: status=${t.status}, output_url=${t.output_url}`);
      });
    }
  }, [tryonsData]);

  const createMutation = useMutation({
    mutationFn: () => tryonAPI.create(humanImage!, garmentImage || undefined, garmentUrl || undefined, productId || undefined),
    onSuccess: () => {
      toast({
        title: 'Try-on created!',
        description: 'Your virtual try-on is being processed',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tryon'] });
      setHumanImage(null);
      setGarmentImage(null);
      setHumanImagePreview(null);
      setGarmentImagePreview(null);
      setGarmentUrl('');
      setProductId('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tryonAPI.delete(id),
    onSuccess: () => {
      toast({
        title: 'Try-on deleted',
        description: 'Successfully removed from your history',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tryon'] });
    },
  });

  const handleHumanImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHumanImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setHumanImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleGarmentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGarmentImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setGarmentImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const clearHumanImage = () => {
    setHumanImage(null);
    setHumanImagePreview(null);
  };

  const clearGarmentImage = () => {
    setGarmentImage(null);
    setGarmentImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!humanImage) {
      toast({
        title: 'Missing image',
        description: 'Please upload your photo',
        variant: 'destructive',
      });
      return;
    }
    if (!garmentImage && !garmentUrl) {
      toast({
        title: 'Missing garment',
        description: 'Please upload a dress image or provide a URL',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate();
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 max-w-7xl mx-auto p-8">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl gradient-bg-primary flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-5xl font-bold gradient-text">
              AI Virtual Try-On
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how clothes look on you with photorealistic AI-powered virtual try-on
          </p>
        </div>

        {/* Upload Form - Modern Elegant layout */}
        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold">Try On Any Outfit</CardTitle>
            <CardDescription className="text-base mt-2">
              Upload your photo and a dress image to see photorealistic results
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Your Photo */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">Your Photo</label>
                    {humanImagePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearHumanImage}
                        className="h-7"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="human-image"
                      type="file"
                      accept="image/*"
                      onChange={handleHumanImageChange}
                      className="hidden"
                      data-testid="input-human-image"
                    />
                    {humanImagePreview ? (
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-primary">
                        <img
                          src={humanImagePreview}
                          alt="Your photo"
                          className="w-full h-full object-cover"
                        />
                        <label
                          htmlFor="human-image"
                          className="absolute inset-0 bg-black/40 hover:bg-black/60 transition-colors cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100"
                        >
                          <div className="text-white text-center">
                            <Upload className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm font-medium">Change Photo</p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <label
                        htmlFor="human-image"
                        className="block aspect-[3/4] border-2 border-dashed rounded-xl hover-elevate cursor-pointer transition-all"
                      >
                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Upload className="h-8 w-8 text-primary" />
                          </div>
                          <p className="text-sm font-medium mb-1">Upload Your Photo</p>
                          <p className="text-xs text-muted-foreground">
                            Full body photo works best
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {/* Dress Image */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">Dress Image</label>
                    {garmentImagePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearGarmentImage}
                        className="h-7"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                      </Button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="garment-image"
                      type="file"
                      accept="image/*"
                      onChange={handleGarmentImageChange}
                      className="hidden"
                      data-testid="input-garment-image"
                    />
                    {garmentImagePreview ? (
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-foreground/20">
                        <img
                          src={garmentImagePreview}
                          alt="Dress"
                          className="w-full h-full object-cover"
                        />
                        <label
                          htmlFor="garment-image"
                          className="absolute inset-0 bg-black/40 hover:bg-black/60 transition-colors cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100"
                        >
                          <div className="text-white text-center">
                            <Upload className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm font-medium">Change Image</p>
                          </div>
                        </label>
                      </div>
                    ) : (
                      <label
                        htmlFor="garment-image"
                        className="block aspect-[3/4] border-2 border-dashed rounded-xl hover-elevate cursor-pointer transition-all"
                      >
                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                          <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
                            <ImageIcon className="h-8 w-8 text-foreground/70" />
                          </div>
                          <p className="text-sm font-medium mb-1">Upload Dress Image</p>
                          <p className="text-xs text-muted-foreground">
                            Any clothing item or outfit
                          </p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-8">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                size="lg"
                className="w-full text-lg h-14 gradient-bg-primary"
                data-testid="button-create-tryon"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating Your Try-On...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Try It On
                  </>
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Powered by Google Gemini 2.5 Flash • Results in ~10 seconds
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Results Gallery */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Your Virtual Try-Ons</h2>
            {tryonsData?.tryons && tryonsData.tryons.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {tryonsData.tryons.length} {tryonsData.tryons.length === 1 ? 'result' : 'results'}
              </p>
            )}
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="aspect-[3/4] bg-muted" />
                  <CardFooter className="pt-4">
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : tryonsData?.tryons.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No try-ons yet</h3>
                <p className="text-muted-foreground mb-6">
                  Upload your photo and a dress image to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tryonsData?.tryons.map((tryon: any) => (
                <Card key={tryon.id} className="overflow-hidden hover:border-primary/40 transition-all group" data-testid={`card-tryon-${tryon.id}`}>
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-muted to-muted/50">
                    {tryon.status === 'done' && tryon.output_url ? (
                      <img
                        src={tryon.output_url}
                        alt="Try-on result"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', tryon.output_url);
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : tryon.status === 'processing' ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-3" />
                        <p className="text-sm font-medium">Generating...</p>
                        <p className="text-xs text-muted-foreground">This may take 10-15 seconds</p>
                      </div>
                    ) : tryon.status === 'failed' ? (
                      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
                          <X className="h-6 w-6 text-destructive" />
                        </div>
                        <p className="text-sm font-medium text-destructive">Processing failed</p>
                        <p className="text-xs text-muted-foreground mt-1">Please try again</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Queued...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <CardFooter className="flex justify-between items-center gap-2 pt-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tryon.product_id || `Try-on ${tryon.id.substring(0, 8)}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tryon.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {tryon.status === 'done' && tryon.output_url && (
                        <Button
                          size="icon"
                          variant="ghost"
                          asChild
                          data-testid={`button-download-${tryon.id}`}
                        >
                          <a href={tryon.output_url} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(tryon.id)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-${tryon.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
