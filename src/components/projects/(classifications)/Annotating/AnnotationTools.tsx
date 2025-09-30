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
    <div className="flex gap-4 items-center">
      <div className="space-x-3">
        <Button
          variant={currentTool === 'square' ? 'default' : 'outline'}
          onClick={() => setCurrentTool('square')}
          className="px-6 py-3 text-base font-semibold"
        >
          <Square className="w-5 h-5 mr-2" />
          Square
        </Button>
        <Button
          variant={currentTool === 'pen' ? 'default' : 'outline'}
          onClick={() => setCurrentTool('pen')}
          className="px-6 py-3 text-base font-semibold"
        >
          <Pencil className="w-5 h-5 mr-2" />
          Pen
        </Button>
        <Button
          variant={currentTool === 'erase' ? 'default' : 'outline'}
          onClick={handleEraseClick}
          className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 px-6 py-3 text-base font-semibold"
        >
          <Eraser className="w-5 h-5 mr-2" />
          Clear All
        </Button>
      </div>
      <Input
        type="number"
        min="1"
        max="20"
        value={lineWidth}
        onChange={(e) => setLineWidth(Number(e.target.value))}
        className="w-24 h-12 text-base"
      />
    </div>
  );
};