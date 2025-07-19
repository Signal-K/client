'use client';

import { Button } from '@/components/ui/button';
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
      <div className="grid gap-2 grid-cols-2 md:grid-cols-1">
        {Object.entries(categories).map(([key, value]) => {
          const config = value as CategoryConfig;
          return (
            <Button
              key={key}
              variant={currentCategory === key ? 'default' : 'outline'}
              onClick={() => setCurrentCategory(key as Category)}
              className="w-full text-left flex flex-col items-start gap-2 p-4 md:p-2 min-h-[88px] md:min-h-0"
            >
              <div className="flex items-start gap-3 w-full">
                {config.iconUrl && (
                  <img
                    src={config.iconUrl}
                    alt={config.name}
                    className="w-8 h-8 object-contain flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{config.name}</div>
                  <div className="text-sm text-muted-foreground leading-snug break-words whitespace-normal">
                    {config.description}
                  </div>
                </div>
              </div>
              {categoryCount[key as Category] > 0 && (
                <div className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs self-end">
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