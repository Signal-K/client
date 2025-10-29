'use client';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Pencil, Circle, Square, Eraser } from 'lucide-react';
import type { Tool } from '@/types/Annotation';

interface AnnotationToolsProps {
  currentTool: Tool;
  setCurrentTool: (tool: Tool) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  onClearAll?: () => void;
};

export function AnnotationTools({
  currentTool,
  setCurrentTool,
  lineWidth,
  setLineWidth,
  onClearAll,
}: AnnotationToolsProps) {
  
  const handleEraseClick = () => {
    if (onClearAll) {
      onClearAll();
    }
  };
  return (
    <div className="flex gap-2 items-center flex-wrap">
      <div className="space-x-2">
        <Button
          variant={currentTool === 'square' ? 'default' : 'outline'}
          onClick={() => setCurrentTool('square')}
          className="px-3 py-1.5 text-xs font-semibold"
        >
          <Square className="w-3.5 h-3.5 mr-1.5" />
          Square
        </Button>
        <Button
          variant={currentTool === 'pen' ? 'default' : 'outline'}
          onClick={() => setCurrentTool('pen')}
          className="px-3 py-1.5 text-xs font-semibold"
        >
          <Pencil className="w-3.5 h-3.5 mr-1.5" />
          Pen
        </Button>
        <Button
          variant={currentTool === 'erase' ? 'default' : 'outline'}
          onClick={handleEraseClick}
          className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 px-3 py-1.5 text-xs font-semibold"
        >
          <Eraser className="w-3.5 h-3.5 mr-1.5" />
          Clear All
        </Button>
      </div>
      <Input
        type="number"
        min="1"
        max="20"
        value={lineWidth}
        onChange={(e) => setLineWidth(Number(e.target.value))}
        className="w-16 h-8 text-xs"
      />
    </div>
  );
};