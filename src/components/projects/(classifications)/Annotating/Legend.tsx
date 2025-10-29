'use client';

import { Button } from '@/src/components/ui/button';
import { type AI4MCategory, type P4Category, type CategoryConfig } from '@/types/Annotation';

interface LegendProps<Category extends AI4MCategory | P4Category> {
  currentCategory: Category;
  setCurrentCategory: (category: Category) => void;
  categoryCount: Record<Category, number>;
  categories: Record<Category, CategoryConfig>;
}

export function Legend<Category extends AI4MCategory | P4Category>({
  currentCategory,
  setCurrentCategory,
  categoryCount,
  categories,
}: LegendProps<Category>) {
  return (
    <div className="space-y-4">
      <style jsx>{`
        .legend-button {
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
          white-space: normal;
        }
        .legend-button * {
          white-space: normal !important;
        }
      `}</style>
      <div className="grid gap-2 grid-cols-2 md:grid-cols-1">
        {Object.entries(categories).map(([key, value]) => {
          const config = value as CategoryConfig;
          return (
            <Button
              key={key}
              variant={currentCategory === key ? 'default' : 'outline'}
              onClick={() => setCurrentCategory(key as Category)}
              className={`legend-button w-full text-left flex flex-col items-start gap-1.5 p-2 md:p-2.5 min-h-[80px] h-auto ${
                currentCategory === key 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'bg-background text-foreground hover:bg-accent hover:text-accent-foreground border-border'
              }`}
            >
              <div className="flex items-start gap-2 w-full">
                {config.iconUrl && (
                  <img
                    src={config.iconUrl}
                    alt={config.name}
                    className="w-6 h-6 object-contain flex-shrink-0 mt-0.5"
                  />
                )}
                <div className="flex-1 min-w-0 w-full pr-1.5">
                  <div className="font-medium text-xs leading-tight mb-0.5 break-words text-foreground whitespace-normal">{config.name}</div>
                  <div className="text-[10px] leading-snug break-words text-foreground/80 whitespace-normal overflow-visible line-clamp-2">
                    {config.description}
                  </div>
                </div>
              </div>
              {categoryCount[key as Category] > 0 && (
                <div className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                  currentCategory === key
                    ? 'bg-primary-foreground text-primary'
                    : 'bg-secondary text-secondary-foreground'
                } self-end`}>
                  {categoryCount[key as Category]}
                </div>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}