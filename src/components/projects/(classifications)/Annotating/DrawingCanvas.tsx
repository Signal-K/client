'use client';

import { useEffect } from 'react';
import { cn } from '@/src/shared/utils';
import type { DrawingObject, Tool, AI4MCategory, P4Category } from '@/types/Annotation';

interface AnnotationCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  imageRef: React.RefObject<HTMLImageElement>;
  isDrawing: boolean;
  setIsDrawing: (isDrawing: boolean) => void;
  currentTool: Tool;
  currentColor: string;
  lineWidth: number;
  drawings: DrawingObject[];
  setDrawings: (drawings: DrawingObject[]) => void;
  currentDrawing: DrawingObject | null;
  setCurrentDrawing: (drawing: DrawingObject | null) => void;
  currentCategory: AI4MCategory | P4Category;
}

export function AnnotationCanvas({
  canvasRef,
  imageRef,
  isDrawing,
  setIsDrawing,
  currentTool,
  currentColor,
  lineWidth,
  drawings,
  setDrawings,
  currentDrawing,
  setCurrentDrawing,
  currentCategory,
}: AnnotationCanvasProps) {
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    const newDrawing: DrawingObject = {
      type: currentTool,
      category: currentCategory,
      color: currentColor,
      width: lineWidth,
      points: [{ x, y }],
      startPoint: { x, y },
    };
    setCurrentDrawing(newDrawing);
  };

  const getTouchPos = (touch: Touch, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  // Allow scroll if more than 1 finger (e.g. pinch/scroll gesture)
  if (e.touches.length > 1) return;

  const touch = e.nativeEvent.touches[0];
  const { x, y } = getTouchPos(touch, canvas);

  setIsDrawing(true);
  const newDrawing: DrawingObject = {
    type: currentTool,
    category: currentCategory,
    color: currentColor,
    width: lineWidth,
    points: [{ x, y }],
    startPoint: { x, y },
  };
  setCurrentDrawing(newDrawing);

  // Prevent scroll only if single-touch drawing
  e.preventDefault();
};

const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
  if (!isDrawing || !currentDrawing || !canvasRef.current) return;

  const touch = e.nativeEvent.touches[0];
  const { x, y } = getTouchPos(touch, canvasRef.current);

  if (currentTool === 'pen') {
    setCurrentDrawing({
      ...currentDrawing,
      points: [...currentDrawing.points, { x, y }],
    });
  } else {
    setCurrentDrawing({
      ...currentDrawing,
      endPoint: { x, y },
    });
  }

  // Prevent scroll only if actually drawing
  e.preventDefault();
};

  const handleTouchEnd = () => {
    if (currentDrawing) {
      setDrawings([...drawings, currentDrawing]);
    }
    setIsDrawing(false);
    setCurrentDrawing(null);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === 'pen') {
      setCurrentDrawing({
        ...currentDrawing,
        points: [...currentDrawing.points, { x, y }],
      });
    } else {
      setCurrentDrawing({
        ...currentDrawing,
        endPoint: { x, y },
      });
    }
  };

  const stopDrawing = () => {
    if (currentDrawing) {
      setDrawings([...drawings, currentDrawing]);
    }
    setIsDrawing(false);
    setCurrentDrawing(null);
  };

  const drawObject = (ctx: CanvasRenderingContext2D, drawing: DrawingObject) => {
    ctx.strokeStyle = drawing.color;
    ctx.lineWidth = drawing.width;
    ctx.beginPath();

    if (drawing.type === 'pen') {
      ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
      drawing.points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
    } else if (drawing.type === 'square' && drawing.startPoint && drawing.endPoint) {
      const width = drawing.endPoint.x - drawing.startPoint.x;
      const height = drawing.endPoint.y - drawing.startPoint.y;
      ctx.rect(drawing.startPoint.x, drawing.startPoint.y, width, height);
    }

    ctx.stroke();
  };

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imageRef.current) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const img = imageRef.current;
    const imgAspectRatio = img.naturalWidth / img.naturalHeight;

    const drawWidth = canvasWidth;
    const drawHeight = canvasWidth / imgAspectRatio;

    const offsetX = 0;
    const offsetY = (canvasHeight - drawHeight) / 2;

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    drawings.forEach((drawing) => {
      drawObject(ctx, drawing);
    });

    if (currentDrawing) {
      drawObject(ctx, currentDrawing);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;

    const dpr = window.devicePixelRatio || 1;

    if (!canvas || !img) return;

    const setCanvasSize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      // Limit canvas to reasonable maximum dimensions for responsive fit
      const maxWidth = Math.min(parent.offsetWidth, 450); // Max 450px wide
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      const width = maxWidth;
      const maxHeight = window.innerHeight * 0.4; // Max 40% of viewport height
      const height = Math.min(width / aspectRatio, maxHeight, 350); // Max 350px tall
      
      // Recalculate width if height was constrained
      const finalWidth = height * aspectRatio;

      canvas.width = finalWidth * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${finalWidth}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
        ctx.scale(dpr, dpr);
      }

      renderCanvas();
    };

    if (img.complete) {
      setCanvasSize();
    } else {
      img.addEventListener('load', setCanvasSize);
      return () => img.removeEventListener('load', setCanvasSize);
    }

    window.addEventListener('resize', setCanvasSize);
    return () => window.removeEventListener('resize', setCanvasSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    renderCanvas();
  }, [drawings, currentDrawing]);

  return (
    <div className="border rounded-lg overflow-hidden inline-block w-full max-w-full">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
className={cn(
    "w-full h-auto cursor-crosshair touch-none",
    isDrawing && "cursor-none"
  )}
      />
    </div>
  );
};