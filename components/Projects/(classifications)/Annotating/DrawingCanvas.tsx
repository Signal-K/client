"use client";

import { forwardRef } from 'react';
import type { Point, Line } from '@/types/Annotation';
import { createLineGenerator, getMousePosition } from './DrawingUtils';

interface DrawingCanvasProps {
  isDrawing: boolean;
  currentLine: Line;
  lines: Line[];
  onMouseDown: (point: Point) => void;
  onMouseMove: (point: Point) => void;
  onMouseUp: () => void;
  width?: number;
  height?: number;
}

export const DrawingCanvas = forwardRef<SVGSVGElement, DrawingCanvasProps>(({
  isDrawing,
  currentLine,
  lines,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  width,
  height,
}, ref) => {
  const lineGenerator = createLineGenerator();

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = event.currentTarget;
    const point = getMousePosition(event, svg);
    onMouseDown(point);
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing) return;
    const svg = event.currentTarget;
    const point = getMousePosition(event, svg);
    onMouseMove(point);
  };

  return (
    <svg
      ref={ref}
      className="absolute top-0 left-0 w-full h-full"
      width={width}
      height={height}
      viewBox={`0 0 ${width || 0} ${height || 0}`}
      preserveAspectRatio="none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      {lines.map((line, i) => (
        <path
          key={i}
          d={lineGenerator(line.points) || ''}
          fill="none"
          stroke={line.color}
          strokeWidth={line.width}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      {currentLine.points.length > 0 && (
        <path
          d={lineGenerator(currentLine.points) || ''}
          fill="none"
          stroke={currentLine.color}
          strokeWidth={currentLine.width}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';