'use client';

import { useState, useRef, useEffect } from 'react';
import { AnnotationTools } from './AnnotationTools';
import { AnnotationCanvas } from './DrawingCanvas';
import { Button } from '@/components/ui/button';
import { AI4MCATEGORIES, type AI4MCategory, type DrawingObject, type Tool } from '@/types/Annotation';
import { Legend } from './Legend';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import ClassificationForm from '../PostForm';

interface ImageAnnotatorProps {
  initialImageUrl: string;
  anomalyType: string;
  anomalyId: string;
  missionNumber: number;
  assetMentioned: string | string[];
  structureItemId?: number;
};

export default function ImageAnnotator({ initialImageUrl, anomalyType, anomalyId, assetMentioned, missionNumber, structureItemId }: ImageAnnotatorProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [selectedImage, setSelectedImage] = useState<string | null>(initialImageUrl);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [currentCategory, setCurrentCategory] = useState<AI4MCategory>('custom');
  const [lineWidth, setLineWidth] = useState(2);
  const [drawings, setDrawings] = useState<DrawingObject[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingObject | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploads, setUploads] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const addMedia = async () => {
    if (!canvasRef.current || !session) return;
  
    const canvas = canvasRef.current;
    setIsUploading(true);
  
    try {
      // Convert canvas to Blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });
  
      if (!blob) throw new Error('Failed to create Blob from canvas');
  
      // Prepare file name and upload to Supabase
      const fileName = `${Date.now()}-${session.user.id}-annotated-image.png`;
      const { data, error } = await supabase.storage
        .from('media')
        .upload(fileName, blob, {
          contentType: 'image/png',
        });
  
      if (error) {
        console.error('Upload error:', error.message);
      } else if (data) {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${data.path}`;
        setUploads((prevUploads) => [...prevUploads, url]);
        console.log('Uploaded successfully:', url);
      }
    } catch (err) {
      console.error('Unexpected error during canvas upload:', err);
    } finally {
      setIsUploading(false);
    }
  };  

  useEffect(() => {
    if (initialImageUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setSelectedImage(initialImageUrl);
        imageRef.current = img;
      };
      img.src = initialImageUrl;
    }
  }, [initialImageUrl]);

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'annotated-image.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const categoryCount = drawings.reduce((acc, drawing) => {
    acc[drawing.category] = (acc[drawing.category] || 0) + 1;
    return acc;
  }, {} as Record<AI4MCategory, number>);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <AnnotationTools
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
          lineWidth={lineWidth}
          setLineWidth={setLineWidth}
        />
        {/* <Button onClick={downloadImage}>Download Annotated Image</Button> */}
      </div>

      {selectedImage && (
        <div className="space-y-4">
          <AnnotationCanvas
            canvasRef={canvasRef}
            imageRef={imageRef}
            isDrawing={isDrawing}
            setIsDrawing={setIsDrawing}
            currentTool={currentTool}
            currentColor={AI4MCATEGORIES[currentCategory].color}
            lineWidth={lineWidth}
            drawings={drawings}
            setDrawings={setDrawings}
            currentDrawing={currentDrawing}
            setCurrentDrawing={setCurrentDrawing}
            currentCategory={currentCategory}
          />
          <Legend
            currentCategory={currentCategory}
            setCurrentCategory={setCurrentCategory}
            categoryCount={categoryCount}
          />
          <Button onClick={addMedia} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Save & proceed'}
          </Button>
          <ClassificationForm
            anomalyId={anomalyId}
            anomalyType="automaton-aiForMars"
            missionNumber={200000062}
            assetMentioned={[...uploads, ...(Array.isArray(assetMentioned) ? assetMentioned : [assetMentioned])]}
            structureItemId={3102}
          />
        </div>
      )}
    </div>
  );
};