'use client';

import { Button } from '@/components/ui/button';
import { AI4MCATEGORIES, AI4MCategory } from '@/types/Annotation';

interface LegendProps {
  currentCategory: AI4MCategory;
  setCurrentCategory: (category: AI4MCategory) => void;
  categoryCount: Record<AI4MCategory, number>;
}

export function Legend({ currentCategory, setCurrentCategory, categoryCount }: LegendProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {(Object.entries(AI4MCATEGORIES) as [AI4MCategory, typeof AI4MCATEGORIES[AI4MCategory]][]).map(([key, config]) => (
          <Button
            key={key}
            variant={currentCategory === key ? "default" : "outline"}
            className="justify-start gap-2 h-auto py-2"
            onClick={() => setCurrentCategory(key)}
          >
            <div 
              className="w-4 h-4 rounded-sm" 
              style={{ backgroundColor: config.color }} 
            />
            <div className="flex-1 text-left">
              <div className="font-medium">{config.name}</div>
              <div className="text-sm text-muted-foreground">{config.description}</div>
            </div>
            {categoryCount[key] > 0 && (
              <div className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full text-xs">
                {categoryCount[key]}
              </div>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};