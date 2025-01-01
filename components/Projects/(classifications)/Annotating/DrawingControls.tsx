"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DrawingControls } from '@/types/Annotation';

export function DrawingControls({ 
  strokeColor, 
  strokeWidth, 
  onColorChange, 
  onWidthChange 
}: DrawingControls) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <Label htmlFor="stroke-color">Color:</Label>
        <Input
          id="stroke-color"
          type="color"
          value={strokeColor}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-16 h-8 p-0"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="stroke-width">Width:</Label>
        <Input
          id="stroke-width"
          type="range"
          min="1"
          max="20"
          value={strokeWidth}
          onChange={(e) => onWidthChange(Number(e.target.value))}
          className="w-32"
        />
        <span className="text-sm text-gray-500">{strokeWidth}px</span>
      </div>
    </div>
  );
};