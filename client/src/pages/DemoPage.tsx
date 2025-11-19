import { useState } from "react";
import TryOnButton from "@/components/TryOnButton";
import TryOnPanel from "@/components/TryOnPanel";
import AuthGate from "@/components/AuthGate";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Summer Floral Dress",
    price: "$89.99",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=600&fit=crop",
  },
  {
    id: "2",
    name: "Classic White Shirt",
    price: "$49.99",
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=600&fit=crop",
  },
  {
    id: "3",
    name: "Casual Denim Jacket",
    price: "$129.99",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop",
  },
  {
    id: "4",
    name: "Evening Gown",
    price: "$199.99",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&h=600&fit=crop",
  },
  {
    id: "5",
    name: "Leather Jacket",
    price: "$249.99",
    image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=400&h=600&fit=crop",
  },
  {
    id: "6",
    name: "Striped Tee",
    price: "$29.99",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400&h=600&fit=crop",
  },
];

export default function DemoPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<typeof MOCK_PRODUCTS[0] | null>(null);
  const [isDark, setIsDark] = useState(false);

  const handleTryOnClick = (product: typeof MOCK_PRODUCTS[0]) => {
    if (!isAuthenticated) {
      setShowAuthGate(true);
      return;
    }
    setSelectedProduct(product);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Fashion Store</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAuthenticated(!isAuthenticated)}
              data-testid="button-toggle-auth"
            >
              {isAuthenticated ? 'Sign Out' : 'Sign In'}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-toggle-theme"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">New Arrivals</h2>
          <p className="text-muted-foreground">Try on items virtually with our AI-powered feature</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="group relative bg-card border border-card-border rounded-lg overflow-hidden hover-elevate"
              data-testid={`product-card-${product.id}`}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <TryOnButton
                  onClick={() => handleTryOnClick(product)}
                  cachedCount={product.id === "1" ? 2 : 0}
                />
              </div>
              <div className="p-4">
                <h3 className="font-medium truncate" data-testid={`product-name-${product.id}`}>
                  {product.name}
                </h3>
                <p className="text-lg font-semibold text-primary mt-1" data-testid={`product-price-${product.id}`}>
                  {product.price}
                </p>
                <Button className="w-full mt-3" variant="secondary" data-testid={`button-add-cart-${product.id}`}>
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <AuthGate
        isOpen={showAuthGate}
        onClose={() => setShowAuthGate(false)}
        onSignIn={() => {
          setIsAuthenticated(true);
          setShowAuthGate(false);
        }}
      />

      {selectedProduct && (
        <TryOnPanel
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          productImageUrl={selectedProduct.image}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
}
