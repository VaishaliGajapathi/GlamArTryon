import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TryOnButtonProps {
  onClick: () => void;
  cachedCount?: number;
  className?: string;
}

export default function TryOnButton({ onClick, cachedCount = 0, className = "" }: TryOnButtonProps) {
  return (
    <div className={`absolute top-3 right-3 z-10 ${className}`}>
      <Button
        size="icon"
        variant="secondary"
        onClick={onClick}
        data-testid="button-tryon-trigger"
        className="backdrop-blur-md bg-background/80 border border-border shadow-lg hover-elevate active-elevate-2"
      >
        <Camera className="h-4 w-4" />
      </Button>
      {cachedCount > 0 && (
        <Badge
          className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-1 text-xs bg-primary text-primary-foreground"
          data-testid="badge-cached-count"
        >
          {cachedCount}
        </Badge>
      )}
    </div>
  );
}
