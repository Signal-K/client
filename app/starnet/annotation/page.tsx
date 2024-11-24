'use client';

import React, { useState, useRef } from 'react';
import Canvas from '@/components/Projects/(classifications)/Annotation/Canvas';
import Toolbar from '@/components/Projects/(classifications)/Annotation/Toolbar';
import AnnotationList from '@/components/Projects/(classifications)/Annotation/AnnotationList';
import { Annotation } from '@/types/Annotation';
import { Upload } from 'lucide-react';
import dynamic from 'next/dynamic';

function AnnotationCreate() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [currentTool, setCurrentTool] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleAddAnnotation = (annotation: Annotation) => {
    setAnnotations([...annotations, annotation]);
  };

  const handleLabelChange = (index: number, newLabel: string) => {
    const newAnnotations = [...annotations];
    newAnnotations[index].label = newLabel;
    setAnnotations(newAnnotations);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    // Draw the image onto the canvas
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      // Clear the canvas before drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
  
      // Now draw the annotations (example, adjust based on how you manage annotations)
      annotations.forEach((annotation) => {
        const x = annotation.x ?? 0;
        const y = annotation.y ?? 0;
        const width = annotation.width ?? 0;
        const height = annotation.height ?? 0;
        
        ctx.beginPath();
        ctx.rect(x, y, width, height); // Safe to call now
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'red';
        ctx.fillText(annotation.label, x, y - 5); // Add label with default x and y        
      });
  
      // Generate the data URL and trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'annotated-image.png';
      link.href = dataUrl;
      link.click();
    };
  };  

  const handleShare = async () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], 'annotated-image.png', { type: 'image/png' });

    if (navigator.share) {
      await navigator.share({
        files: [file],
        title: 'Annotated Image',
      });
    } else {
      alert('Web Share API is not supported in your browser');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Image Annotator</h1>
        
        <div className="flex gap-8">
          <div className="flex-1">
            {!imageUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-[600px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG or GIF</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </label>
            ) : (
              <div className="space-y-4">
                <Toolbar
                  currentTool={currentTool}
                  onToolSelect={setCurrentTool}
                  onDownload={handleDownload}
                  onShare={handleShare}
                />
                <div ref={containerRef}>
                  {/* <Canvas
                    imageUrl={imageUrl}
                    annotations={annotations}
                    currentTool={currentTool}
                    isDrawing={isDrawing}
                    setIsDrawing={setIsDrawing}
                    onAddAnnotation={handleAddAnnotation}
                  /> */}
                </div>
                {/* Create a hidden canvas to draw the image and annotations */}
                <canvas ref={canvasRef} style={{ display: 'none' }} width={800} height={600} />
              </div>
            )}
          </div>
          
          <AnnotationList
            annotations={annotations}
            onLabelChange={handleLabelChange}
          />
        </div>
      </div>
    </div>
  );
}

export default AnnotationCreate;