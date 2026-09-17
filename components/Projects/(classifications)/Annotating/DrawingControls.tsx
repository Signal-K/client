"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DrawingControls, DrawingMode } from '@/types/Annotation';
import { Pencil, Square, Circle } from 'lucide-react';

export function DrawingControls({ 
  strokeColor, 
  strokeWidth, 
  drawingMode,
  onColorChange, 
  onWidthChange,
  onModeChange
}: DrawingControls) {
  const tools: { mode: DrawingMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'freehand', icon: <Pencil className="h-4 w-4" />, label: 'Freehand' },
    { mode: 'rectangle', icon: <Square className="h-4 w-4" />, label: 'Rectangle' },
    { mode: 'circle', icon: <Circle className="h-4 w-4" />, label: 'Circle' },
  ];

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
      <div className="flex items-center gap-2 border-l pl-4">
        <Label className="sr-only">Drawing Mode:</Label>
        <div className="flex gap-2">
          {tools.map(({ mode, icon, label }) => (
            <Button
              key={mode}
              variant={drawingMode === mode ? "default" : "outline"}
              size="sm"
              onClick={() => onModeChange(mode)}
              className="gap-2"
            >
              {icon}
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}