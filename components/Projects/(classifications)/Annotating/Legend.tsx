'use client';

import { Button } from '@/components/ui/button';
import { type AI4MCategory, type P4Category, type CategoryConfig } from '@/types/Annotation';

interface LegendProps<Category extends AI4MCategory | P4Category> {
  currentCategory: Category;
  setCurrentCategory: (category: Category) => void;
  categoryCount: Record<Category, number>;
  categories: Record<Category, CategoryConfig>;
};

export function Legend<Category extends AI4MCategory | P4Category>({
  currentCategory,
  setCurrentCategory,
  categoryCount,
  categories,
}: LegendProps<Category>) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {Object.entries(categories).map(([key, value]) => {
          const config = value as CategoryConfig;
          return (
            <Button
              key={key}
              variant={currentCategory === key ? 'default' : 'outline'}
              className="justify-start gap-2 h-auto py-2"
              onClick={() => setCurrentCategory(key as Category)}
            >
              <div className="flex items-center gap-2">
                {config.iconUrl && (
                  <img
                    src={config.iconUrl}
                    alt={config.name}
                    className="w-8 h-8 object-contain"
                  />
                )}
                <div className="flex-1 text-left">
                  <div className="font-medium">{config.name}</div>
                  <div className="text-sm text-muted-foreground">{config.description}</div>
                </div>
              </div>
              {categoryCount[key as Category] > 0 && (
                <div className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs">
                  {categoryCount[key as Category]}
                </div>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};