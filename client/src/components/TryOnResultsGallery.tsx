import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import noResultsImg from "@assets/generated_images/No_results_empty_state_b41e7ee3.png";

export interface TryOnResult {
  id: string;
  productId: string;
  productName: string;
  resultImageUrl: string;
  timestamp: number;
}

interface TryOnResultsGalleryProps {
  results: TryOnResult[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export default function TryOnResultsGallery({ results, onDelete, onClearAll }: TryOnResultsGalleryProps) {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <img src={noResultsImg} alt="No results" className="w-32 h-32 mb-4 opacity-60" />
        <h3 className="text-sm font-medium mb-2">No Try-On Results Yet</h3>
        <p className="text-xs text-muted-foreground max-w-xs">
          Upload your photo and try on items to see results here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          data-testid="button-clear-all"
          className="text-destructive hover:text-destructive"
        >
          Clear All
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="grid grid-cols-2 gap-3">
          {results.map((result) => (
            <div
              key={result.id}
              className="relative group rounded-lg overflow-hidden border border-card-border bg-card"
              data-testid={`result-item-${result.id}`}
            >
              <img
                src={result.resultImageUrl}
                alt={result.productName}
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="p-2 space-y-1">
                <p className="text-xs font-medium truncate">{result.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(result.timestamp).toLocaleDateString()}
                </p>
              </div>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => onDelete(result.id)}
                data-testid={`button-delete-${result.id}`}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
