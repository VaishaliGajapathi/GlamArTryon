import TryOnPanel from '../TryOnPanel';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function TryOnPanelExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>Open Try-On Panel</Button>
      <TryOnPanel
        isOpen={isOpen}
        onClose={() => {
          console.log('Panel closed');
          setIsOpen(false);
        }}
        productId="prod-123"
        productName="Summer Floral Dress"
        productImageUrl="https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=600&fit=crop"
        isAuthenticated={true}
      />
    </div>
  );
}
