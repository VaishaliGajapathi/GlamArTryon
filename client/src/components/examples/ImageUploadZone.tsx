import ImageUploadZone from '../ImageUploadZone';
import { useState } from 'react';

export default function ImageUploadZoneExample() {
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = (file: File) => {
    console.log('File uploaded:', file.name);
    setIsValidating(true);
    setError(null);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setTimeout(() => {
        setModelImage(e.target?.result as string);
        setIsValidating(false);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    console.log('Image removed');
    setModelImage(null);
    setError(null);
  };

  return (
    <div className="max-w-md p-6">
      <ImageUploadZone
        modelImage={modelImage}
        onImageUpload={handleUpload}
        onImageRemove={handleRemove}
        isValidating={isValidating}
        validationError={error}
      />
    </div>
  );
}
