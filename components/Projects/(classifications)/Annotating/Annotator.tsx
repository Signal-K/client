'use client';

import { useState, useRef, useEffect } from 'react';
import { AnnotationTools } from './AnnotationTools';
import { AnnotationCanvas } from './DrawingCanvas';
import { Button } from '@/components/ui/button';
import { Legend } from './Legend';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import ClassificationForm from '../PostForm';
import {
  AI4MCATEGORIES,
  P4CATEGORIES,
  PHCATEGORIES,
  CACCategories,
  JVHCATEGORIES,
  CoMSCategories,
  SunspotsCategories,
  type CoMShapesCategory,
  type AI4MCategory,
  type SunspotsCategory,
  type JVHCategory,
  type CACCategory,
  type P4Category,
  type PHCategory,
  type CoMCategory,
  type DrawingObject,
  type Tool,
  type CategoryConfig,
  CoMCATEGORIES,
} from '@/types/Annotation';
import { SciFiPanel } from '@/components/ui/styles/sci-fi/panel';

interface ImageAnnotatorProps {
  initialImageUrl: string;
  otherAssets?: string[];
  anomalyType?: string;
  parentClassificationId?: number;
  anomalyId?: string;
  missionNumber?: number;
  assetMentioned?: string | string[];
  structureItemId?: number;
  parentPlanetLocation?: string;
  annotationType: 'AI4M' | 'P4' | 'PH' | 'CoM' | 'CAC' | 'JVH' | 'CoMS' | 'Sunspots' | 'Custom';
};

export default function ImageAnnotator({
  initialImageUrl,
  parentClassificationId,
  anomalyType, 
  anomalyId,
  missionNumber,
  assetMentioned,
  otherAssets,
  parentPlanetLocation,
  structureItemId,
  annotationType,
}: ImageAnnotatorProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImageUrl);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>('pen');
  const [currentCategory, setCurrentCategory] = useState<AI4MCategory | P4Category>('Custom');
  const [lineWidth, setLineWidth] = useState(2);
  const [drawings, setDrawings] = useState<DrawingObject[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingObject | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploads, setUploads] = useState<string[]>([]);
  const [annotationOptions, setAnnotationOptions] = useState<string[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const CATEGORY_CONFIG: Record<string, CategoryConfig> =
    annotationType === 'AI4M'
      ? AI4MCATEGORIES
      : annotationType === 'P4'
      ? P4CATEGORIES
      : annotationType === 'CoM'
      ? CoMCATEGORIES
      : annotationType === 'PH'
      ? PHCATEGORIES
      : annotationType === 'JVH'
      ? JVHCATEGORIES
      : annotationType === 'CAC'
      ? CACCategories
      : annotationType === 'Sunspots'
      ? SunspotsCategories
      : annotationType === 'CoMS'
      ? CoMSCategories
      : {} as Record<string, CategoryConfig>;

  const addMedia = async () => {
    if (!canvasRef.current || !session) return;
    const canvas = canvasRef.current;
    setIsUploading(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Failed to create Blob from canvas');
      const fileName = `${Date.now()}-${session.user.id}-annotated-image.png`;
      const { data, error } = await supabase.storage
        .from('media')
        .upload(fileName, blob, { contentType: 'image/png' });
      if (error) {
        console.error('Upload error:', error.message);
      } else if (data) {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${data.path}`;
        setUploads((prev) => [...prev, url]);
        setIsFormVisible(true);
      }
    } catch (err) {
      console.error('Unexpected error during canvas upload:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const renderCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(imageRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    };
  };    

  useEffect(() => {
    if (!initialImageUrl) return;
  
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setSelectedImage(initialImageUrl);
      renderCanvas();
    };
    img.src = initialImageUrl;
  }, [initialImageUrl]);  

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    };

    const preventTouchScroll = ( e: TouchEvent ) => e.preventDefault();

    canvas.addEventListener('touchstart', preventTouchScroll, { passive: false });
    canvas.addEventListener('touchmove', preventTouchScroll, { passive: false });

    return () => {
      canvas.removeEventListener('touchstart', preventTouchScroll);
      canvas.removeEventListener('touchmove', preventTouchScroll);
    };
  }, []);
  
  useEffect(() => {
    if (imageRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderCanvas(); 
      }
    }
  }, [selectedImage]);

  useEffect(() => {
    const options = drawings.reduce((acc, drawing) => {
      const categoryName = CATEGORY_CONFIG[drawing.category]?.name || drawing.category;
      const existingOption = acc.find((option) => option.name === categoryName);

      if (existingOption) {
        existingOption.quantity += 1;
      } else {
        acc.push({ name: categoryName, quantity: 1 });
      }

      return acc;
    }, [] as { name: string; quantity: number }[]);

    setAnnotationOptions(options.map((opt) => `${opt.name} (x${opt.quantity})`));
  }, [drawings, CATEGORY_CONFIG]);

  const categoryCount = drawings.reduce((acc, drawing) => {
    acc[drawing.category] = (acc[drawing.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4 max-w-full px-2 md:px-4 mx-auto overflow-x-hidden overflow-y-auto max-h-screen">
      <div className="flex justify-between items-center">
        <SciFiPanel className="p-4 w-full max-w-md mx-auto">
          <AnnotationTools
            currentTool={currentTool}
            setCurrentTool={setCurrentTool}
            lineWidth={lineWidth}
            setLineWidth={setLineWidth}
          />
        </SciFiPanel>
      </div>
      {selectedImage && (
        <div className="space-y-4">
          <SciFiPanel className="p-4 w-full max-w-md mx-auto">
            <p>{parentClassificationId}</p>
            <AnnotationCanvas
              canvasRef={canvasRef}
              imageRef={imageRef}
              isDrawing={isDrawing}
              setIsDrawing={setIsDrawing}
              currentTool={currentTool}
              currentColor={
                CATEGORY_CONFIG[currentCategory as keyof typeof CATEGORY_CONFIG]?.color || '#000000'
              }
              lineWidth={lineWidth}
              drawings={drawings}
              setDrawings={setDrawings}
              currentDrawing={currentDrawing}
              setCurrentDrawing={setCurrentDrawing}
              currentCategory={currentCategory}
            />
          </SciFiPanel>
          <SciFiPanel className="p-4 w-full max-w-md mx-auto">
            <Legend
              currentCategory={currentCategory}
              setCurrentCategory={setCurrentCategory}
              categoryCount={categoryCount}
              categories={CATEGORY_CONFIG as Record<AI4MCategory | P4Category, CategoryConfig>}
            />
          </SciFiPanel>
          <SciFiPanel className="p-4 w-full max-w-md mx-auto">
            <Button onClick={addMedia} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Save & proceed'}
            </Button>
          </SciFiPanel>
          {otherAssets && (
            <SciFiPanel>
              {otherAssets.map((url, index) => (
                <div
                  key={index}
                  id={`slide-${index}`}
                  className="carousel-item relative w-full h-64 flex-shrink-0"
                >
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${url}`}
                    alt={`Anomaly image ${index + 1}`}
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              ))}
            </SciFiPanel>
          )}
          {/* {isFormVisible && ( */}
            <SciFiPanel className="p-4 w-full max-w-md mx-auto">
              {anomalyId && anomalyType && missionNumber && (
                <ClassificationForm
                  anomalyId={anomalyId}
                  anomalyType={anomalyType}
                  missionNumber={missionNumber}
                  parentPlanetLocation={parentPlanetLocation}
                  parentClassificationId={parentClassificationId}
                  assetMentioned={[
                    ...uploads,
                    ...(otherAssets || []),
                    ...(Array.isArray(assetMentioned) ? assetMentioned : [assetMentioned]),
                  ].filter((item): item is string => typeof item === 'string')}
                  structureItemId={structureItemId}
                  annotationOptions={annotationOptions}
                />
              )}
            </SciFiPanel>
          {/* // )} */}
        </div>
      )}
    </div>
  );
};