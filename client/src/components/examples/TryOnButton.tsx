import TryOnButton from '../TryOnButton';

export default function TryOnButtonExample() {
  return (
    <div className="flex gap-8 items-start p-8">
      <div className="relative w-64 h-80 bg-card border border-card-border rounded-lg overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=600&fit=crop" 
          alt="Product" 
          className="w-full h-full object-cover"
        />
        <TryOnButton onClick={() => console.log('Try-On clicked')} />
      </div>
      
      <div className="relative w-64 h-80 bg-card border border-card-border rounded-lg overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&h=600&fit=crop" 
          alt="Product with cache" 
          className="w-full h-full object-cover"
        />
        <TryOnButton onClick={() => console.log('Try-On with cache clicked')} cachedCount={3} />
      </div>
    </div>
  );
}
