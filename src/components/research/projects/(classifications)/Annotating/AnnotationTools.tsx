'use client';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Pencil, Circle, Square } from 'lucide-react';
import type { Tool } from '@/types/Annotation';

interface AnnotationToolsProps {
  currentTool: Tool;
  setCurrentTool: (tool: Tool) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
};

export function AnnotationTools({
  currentTool,
  setCurrentTool,
  lineWidth,
  setLineWidth,
}: AnnotationToolsProps) {
  return (
    <div className="flex gap-4 items-center">
      <div className="space-x-2">
        <Button
          variant={currentTool === 'pen' ? 'default' : 'outline'}
          onClick={() => setCurrentTool('pen')}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Pen
        </Button>
        <Button
          variant={currentTool === 'square' ? 'default' : 'outline'}
          onClick={() => setCurrentTool('square')}
        >
          <Square className="w-4 h-4 mr-2" />
          Square
        </Button>
      </div>
      <Input
        type="number"
        min="1"
        max="20"
        value={lineWidth}
        onChange={(e) => setLineWidth(Number(e.target.value))}
        className="w-20"
      />
    </div>
  );
};