import TryOnResultsGallery, { TryOnResult } from '../TryOnResultsGallery';
import { useState } from 'react';

const mockResults: TryOnResult[] = [
  {
    id: '1',
    productId: 'prod-1',
    productName: 'Summer Floral Dress',
    resultImageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=600&fit=crop',
    timestamp: Date.now() - 86400000,
  },
  {
    id: '2',
    productId: 'prod-2',
    productName: 'Classic White Shirt',
    resultImageUrl: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&h=600&fit=crop',
    timestamp: Date.now() - 172800000,
  },
  {
    id: '3',
    productId: 'prod-3',
    productName: 'Casual Denim Jacket',
    resultImageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop',
    timestamp: Date.now() - 259200000,
  },
];

export default function TryOnResultsGalleryExample() {
  const [results, setResults] = useState<TryOnResult[]>(mockResults);

  const handleDelete = (id: string) => {
    console.log('Delete result:', id);
    setResults(results.filter((r: TryOnResult) => r.id !== id));
  };

  const handleClearAll = () => {
    console.log('Clear all results');
    setResults([]);
  };

  return (
    <div className="max-w-md p-6">
      <TryOnResultsGallery
        results={results}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
