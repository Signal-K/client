"use client";

import { forwardRef } from 'react';
import type { Point, Line, Shape, DrawingMode } from '@/types/Annotation';
import { createLineGenerator, getMousePosition } from './DrawingUtils';
import { createShapePath } from '@/types/Annotation/Shapes';

interface DrawingCanvasProps {
  isDrawing: boolean;
  currentLine: Line;
  currentShape: Shape | null;
  lines: Line[];
  shapes: Shape[];
  drawingMode: DrawingMode;
  onMouseDown: (point: Point) => void;
  onMouseMove: (point: Point) => void;
  onMouseUp: () => void;
  width?: number;
  height?: number;
}

export const DrawingCanvas = forwardRef<SVGSVGElement, DrawingCanvasProps>(({
  isDrawing,
  currentLine,
  currentShape,
  lines,
  shapes,
  drawingMode,
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
      {/* Completed lines */}
      {lines.map((line, i) => (
        <path
          key={`line-${i}`}
          d={lineGenerator(line.points) || ''}
          fill="none"
          stroke={line.color}
          strokeWidth={line.width}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      
      {/* Current line */}
      {currentLine.points.length > 0 && (
        <path
          d={lineGenerator(currentLine.points) || ''}
          fill="none"
          stroke={currentLine.color}
          strokeWidth={currentLine.width}
          vectorEffect="non-scaling-stroke"
        />
      )}

      {/* Completed shapes */}
      {shapes.map((shape, i) => (
        <path
          key={`shape-${i}`}
          d={createShapePath(shape)}
          fill="none"
          stroke={shape.color}
          strokeWidth={shape.width}
          vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* Current shape */}
      {currentShape && (
        <path
          d={createShapePath(currentShape)}
          fill="none"
          stroke={currentShape.color}
          strokeWidth={currentShape.width}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';