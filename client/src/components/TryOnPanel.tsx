import { X, ChevronDown, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ImageUploadZone from "./ImageUploadZone";
import TryOnResultsGallery, { TryOnResult } from "./TryOnResultsGallery";
import { useState } from "react";

interface TryOnPanelProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productImageUrl: string;
  isAuthenticated: boolean;
}

export default function TryOnPanel({
  isOpen,
  onClose,
  productId,
  productName,
  productImageUrl,
}: TryOnPanelProps) {
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResult, setCurrentResult] = useState<string | null>(null);
  const [results, setResults] = useState<TryOnResult[]>([]);
  const [activeSection, setActiveSection] = useState<string>("upload");

  const handleImageUpload = (file: File) => {
    setIsValidating(true);
    setValidationError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setTimeout(() => {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          if (aspectRatio < 0.4 || aspectRatio > 0.8) {
            setValidationError('Image aspect ratio must be between 2:3 and 1:2');
            setIsValidating(false);
            return;
          }
          setModelImage(e.target?.result as string);
          setIsValidating(false);
        };
        img.src = e.target?.result as string;
      }, 800);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setModelImage(null);
    setCurrentResult(null);
    setValidationError(null);
  };

  const handleTryOn = () => {
    if (!modelImage) return;
    
    setIsProcessing(true);
    setCurrentResult(null);
    
    setTimeout(() => {
      const resultUrl = `https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop&q=80&sig=${Date.now()}`;
      setCurrentResult(resultUrl);
      
      const newResult: TryOnResult = {
        id: `result-${Date.now()}`,
        productId,
        productName,
        resultImageUrl: resultUrl,
        timestamp: Date.now(),
      };
      setResults([newResult, ...results]);
      setIsProcessing(false);
      setActiveSection("result");
    }, 3000);
  };

  const handleDeleteResult = (id: string) => {
    setResults(results.filter((r: TryOnResult) => r.id !== id));
    if (currentResult && results.find((r: TryOnResult) => r.id === id)?.resultImageUrl === currentResult) {
      setCurrentResult(null);
    }
  };

  const handleClearAll = () => {
    setResults([]);
    setCurrentResult(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
        onClick={onClose}
        data-testid="overlay-tryon-panel"
      />
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-card border-l border-card-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300"
        data-testid="panel-tryon"
      >
        <div className="sticky top-0 bg-card border-b border-card-border p-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold">Virtual Try-On</h2>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            data-testid="button-close-panel"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="p-4 bg-muted rounded-lg border border-muted-border">
            <div className="flex gap-3">
              <img
                src={productImageUrl}
                alt={productName}
                className="w-16 h-20 object-cover rounded border border-border"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium truncate">{productName}</h3>
                <p className="text-xs text-muted-foreground mt-1">Selected Item</p>
              </div>
            </div>
          </div>

          <Accordion
            type="single"
            collapsible
            value={activeSection}
            onValueChange={setActiveSection}
            className="space-y-2"
          >
            <AccordionItem value="upload" className="border border-card-border rounded-lg px-4">
              <AccordionTrigger data-testid="accordion-upload">
                <span className="text-sm font-medium">Your Photo</span>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <ImageUploadZone
                  modelImage={modelImage}
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  isValidating={isValidating}
                  validationError={validationError}
                />
                {modelImage && !isValidating && (
                  <Button
                    onClick={handleTryOn}
                    disabled={isProcessing}
                    data-testid="button-start-tryon"
                    className="w-full mt-4"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Try On This Item'
                    )}
                  </Button>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="result" className="border border-card-border rounded-lg px-4">
              <AccordionTrigger data-testid="accordion-result">
                <span className="text-sm font-medium">Current Result</span>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                {currentResult ? (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden border border-card-border">
                      <img
                        src={currentResult}
                        alt="Try-on result"
                        className="w-full aspect-[3/4] object-cover"
                        data-testid="img-current-result"
                      />
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Ready
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Result saved to history
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No result yet. Upload a photo and try on the item.
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="history" className="border border-card-border rounded-lg px-4">
              <AccordionTrigger data-testid="accordion-history">
                <span className="text-sm font-medium">
                  History ({results.length})
                </span>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <TryOnResultsGallery
                  results={results}
                  onDelete={handleDeleteResult}
                  onClearAll={handleClearAll}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
}
