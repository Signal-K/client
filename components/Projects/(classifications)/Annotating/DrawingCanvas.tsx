'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
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
};

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
  const CANVAS_WIDTH = 500; 
  const CANVAS_HEIGHT = 400;

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
  
    const touch = e.touches[0];
    const { x, y } = getTouchPos(touch as unknown as Touch, canvas);
  
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
  
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentDrawing || !canvasRef.current) return;
  
    const touch = e.touches[0];
    const { x, y } = getTouchPos(touch as unknown as Touch, canvasRef.current);
  
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
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    const img = imageRef.current;
    const imgAspectRatio = img.width / img.height;
    const canvasAspectRatio = CANVAS_WIDTH / CANVAS_HEIGHT;
  
    let drawWidth, drawHeight, offsetX, offsetY;
  
    if (imgAspectRatio > canvasAspectRatio) {
      // Image is wider than canvas
      drawWidth = CANVAS_WIDTH;
      drawHeight = CANVAS_WIDTH / imgAspectRatio;
      offsetX = 0;
      offsetY = (CANVAS_HEIGHT - drawHeight) / 2;
    } else {
      // Image is taller than canvas
      drawWidth = CANVAS_HEIGHT * imgAspectRatio;
      drawHeight = CANVAS_HEIGHT;
      offsetX = (CANVAS_WIDTH - drawWidth) / 2;
      offsetY = 0;
    };
  
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  
    drawings.forEach((drawing) => {
      drawObject(ctx, drawing);
    });
  
    if (currentDrawing) {
      drawObject(ctx, currentDrawing);
    };
  };  

  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;

    if (canvas && img) {
      // Ensure actual canvas size matches styled size to avoid scaling issues
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      canvas.style.width = `${CANVAS_WIDTH}px`;
      canvas.style.height = `${CANVAS_HEIGHT}px`;

      renderCanvas();
    }
  }, [imageRef.current]);

  useEffect(() => {
    renderCanvas();
  }, [drawings, currentDrawing]);

  return (
    <div className="border rounded-lg overflow-hidden inline-block">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn("cursor-crosshair", isDrawing && "cursor-none")}
      />
    </div>
  );
};