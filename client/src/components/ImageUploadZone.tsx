import { Upload, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import emptyStateImg from "@assets/generated_images/Upload_person_empty_state_40394257.png";
import sampleGuideImg from "@assets/generated_images/Sample_acceptable_photo_guide_97407cde.png";

interface ImageUploadZoneProps {
  modelImage: string | null;
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
  isValidating?: boolean;
  validationError?: string | null;
}

export default function ImageUploadZone({ 
  modelImage, 
  onImageUpload, 
  onImageRemove,
  isValidating = false,
  validationError = null
}: ImageUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className="space-y-3">
      {modelImage ? (
        <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-card-border">
          <img src={modelImage} alt="Model" className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-replace-image"
              className="backdrop-blur-md bg-background/80"
            >
              <Camera className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="destructive"
              onClick={onImageRemove}
              data-testid="button-remove-image"
              className="backdrop-blur-md"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative aspect-[3/4] rounded-lg border-2 border-dashed transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border bg-card'
          }`}
          data-testid="dropzone-upload"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <img src={emptyStateImg} alt="Upload" className="w-24 h-24 mb-4 opacity-60" />
            <h3 className="text-sm font-medium mb-2">Upload Your Photo</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Full body photo, plain background, good lighting
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-upload-image"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Photo
            </Button>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="text-xs text-primary mt-3 underline hover-elevate rounded px-2 py-1"
              data-testid="button-toggle-guide"
            >
              {showGuide ? 'Hide' : 'View'} Example
            </button>
          </div>
        </div>
      )}

      {showGuide && !modelImage && (
        <div className="p-4 bg-muted rounded-lg border border-muted-border">
          <h4 className="text-xs font-medium mb-2">Good Photo Example:</h4>
          <img src={sampleGuideImg} alt="Example" className="w-full rounded border border-border" />
          <p className="text-xs text-muted-foreground mt-2">
            Stand straight, plain background, full body visible
          </p>
        </div>
      )}

      {isValidating && (
        <div className="p-3 bg-primary/10 text-primary rounded-lg border border-primary/20 text-sm">
          Validating image...
        </div>
      )}

      {validationError && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm">
          {validationError}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-upload"
      />

      <p className="text-xs text-muted-foreground">
        Accepted formats: JPG, PNG. Max size: 10MB. Aspect ratio: 2:3 to 1:2
      </p>
    </div>
  );
}
