"use client";

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { DrawingCanvas } from './DrawingCanvas';
import { DrawingControls } from './DrawingControls';
import { downloadAnnotatedImage } from './DrawingUtils';
import type { Point, Line, Shape, DrawingMode } from '@/types/Annotation';
import { useToast } from "@/hooks/toast";

export function ImageAnnotator() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<Line>({ points: [], color: '#ff0000', width: 2 });
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [strokeColor, setStrokeColor] = useState('#ff0000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [drawingMode, setDrawingMode] = useState<DrawingMode>('freehand');
  const [isDownloading, setIsDownloading] = useState(false);
  
  const svgRef = useRef<SVGSVGElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { toast } = useToast();
  
  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setLines([]);
    setShapes([]);
    setCurrentLine({ points: [], color: strokeColor, width: strokeWidth });
    setCurrentShape(null);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setDimensions({
      width: img.naturalWidth,
      height: img.naturalHeight
    });
  };

  const handleMouseDown = (point: Point) => {
    setIsDrawing(true);
    if (drawingMode === 'freehand') {
      setCurrentLine({
        points: [point],
        color: strokeColor,
        width: strokeWidth
      });
    } else {
      setCurrentShape({
        type: drawingMode,
        startPoint: point,
        endPoint: point,
        color: strokeColor,
        width: strokeWidth
      });
    }
  };

  const handleMouseMove = (point: Point) => {
    if (!isDrawing) return;
    
    if (drawingMode === 'freehand') {
      setCurrentLine(prev => ({
        ...prev,
        points: [...prev.points, point]
      }));
    } else if (currentShape) {
      setCurrentShape(prev => ({
        ...prev!,
        endPoint: point
      }));
    }
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;

    if (drawingMode === 'freehand') {
      if (currentLine.points.length > 0) {
        setLines(prev => [...prev, currentLine]);
        setCurrentLine({ points: [], color: strokeColor, width: strokeWidth });
      }
    } else if (currentShape) {
      setShapes(prev => [...prev, currentShape]);
      setCurrentShape(null);
    }
    
    setIsDrawing(false);
  };

  const handleDownload = async () => {
    if (!svgRef.current || !imageRef.current) {
      toast({
        title: "Error",
        description: "Image or drawing canvas not ready",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    try {
      await downloadAnnotatedImage(svgRef.current, imageRef.current);
      toast({
        title: "Success",
        description: "Image downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download image",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex gap-4">
        <ImageUploader onImageUpload={handleImageUpload} />
        {imageUrl && (
          <Button 
            variant="outline" 
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>
        )}
      </div>

      {imageUrl && (
        <>
          <DrawingControls
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            drawingMode={drawingMode}
            onColorChange={setStrokeColor}
            onWidthChange={setStrokeWidth}
            onModeChange={setDrawingMode}
          />
          <div className="relative border rounded-lg overflow-hidden">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Upload an image to annotate"
              className="max-w-full h-auto block"
              style={{ maxHeight: '70vh' }}
              onLoad={handleImageLoad}
            />
            <DrawingCanvas
              ref={svgRef}
              isDrawing={isDrawing}
              currentLine={currentLine}
              currentShape={currentShape}
              lines={lines}
              shapes={shapes}
              drawingMode={drawingMode}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              width={dimensions.width}
              height={dimensions.height}
            />
          </div>
        </>
      )}

      {!imageUrl && (
        <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800">
          <Upload className="h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Upload an image to begin annotating</p>
        </div>
      )}
    </div>
  );
}