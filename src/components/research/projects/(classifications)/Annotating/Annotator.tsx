'use client';

import { useState, useRef, useEffect } from 'react';
import { AnnotationTools } from './AnnotationTools';
import { AnnotationCanvas } from './DrawingCanvas';
import { Button } from '@/src/components/ui/button';
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
  ActiveAsteroidsCategories,
  type CoMShapesCategory,
  type ActiveAsteroidsCategory,
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
import { SciFiPanel } from '@/src/components/ui/styles/sci-fi/panel';
import { useActivePlanet } from '@/src/core/context/ActivePlanet';
import { useRouter } from 'next/navigation';

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
  classificationParent?: string;
  annotationType: 'AI4M' | 'P4' | 'PH' | 'CoM' | 'CAC' | 'JVH' | 'AA' | 'CoMS' | 'Sunspots' | 'Custom';
  className?: string;
};

export default function ImageAnnotator({
  initialImageUrl,
  parentClassificationId,
  anomalyType,
  anomalyId,
  missionNumber,
  assetMentioned,
  otherAssets,
  classificationParent,
  parentPlanetLocation,
  structureItemId,
  annotationType,
  className = '', // default empty
}: ImageAnnotatorProps) {
  const router = useRouter();

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
  const [uploads, setUploads] = useState<[string, string][]>([]);
  const [annotationOptions, setAnnotationOptions] = useState<string[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const CATEGORY_CONFIG: Record<string, CategoryConfig> =
    annotationType === 'AI4M'
      ? AI4MCATEGORIES
      : annotationType === 'P4'
      ? P4CATEGORIES
      : annotationType == 'AA'
      ? ActiveAsteroidsCategories
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
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );
      if (!blob) throw new Error('Failed to create Blob from canvas');

      const fileName = `${Date.now()}-${session.user.id}-annotated-image.png`;
      const { data, error } = await supabase.storage
        .from('media')
        .upload(fileName, blob, { contentType: 'image/png' });

      if (error) {
        console.error('Upload error:', error.message);
      } else if (data) {
        const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${data.path}`;
        setUploads((prev) => [...prev, [url, fileName]]);
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
    }
  };

  useEffect(() => {
    if (!initialImageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;

      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.visibility = 'hidden';
      container.style.width = '100%';
      container.appendChild(img);
      document.body.appendChild(container);
      const { width, height } = img.getBoundingClientRect();
      document.body.removeChild(container);

      if (canvasRef.current) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        canvasRef.current.style.width = `${width}px`;
        canvasRef.current.style.height = `${height}px`;
      }

      setSelectedImage(initialImageUrl);
      renderCanvas();
    };
    img.src = initialImageUrl;
  }, [initialImageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventTouchScroll = (e: TouchEvent) => e.preventDefault();
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

  const [content, setContent] = useState<string>("");
  const [additionalFields, setAdditionalFields] = useState<{ [key: string]: string; }>({});
  const [inventoryItemId, setInventoryItemId] = useState<number | null>(null);
  const { activePlanet } = useActivePlanet();

  useEffect(() => {
    const fetchInventoryItemId = async () => {
      if (!session || !activePlanet) return;
      try {
        const {
          data: inventoryData,
          error: inventoryError,
        } = await supabase
          .from("inventory")
          .select("*")
          .eq("owner", session.user.id)
          .eq("anomaly", activePlanet.id)
          .eq("item", structureItemId)
          .limit(1)
          .single();

        if (inventoryError) throw inventoryError;
        if (inventoryData) setInventoryItemId(inventoryData.id);
      } catch (error: any) {
        console.error("Error fetching inventory for classification: ", error.message);
      }
    };
    fetchInventoryItemId();
  }, [session, structureItemId]);

  const createPost = async () => {
    if (!session) return;

    const classificationConfiguration = {
      annotationOptions,
      additionalFields,
      parentPlanetLocation: activePlanet?.id,
      createdBy: inventoryItemId ?? null,
      classificationParent: parentClassificationId ?? null,
    };

    try {
      const {
        data: classificationData,
        error: classificationError,
      } = await supabase
        .from("classifications")
        .insert({
          author: session.user.id,
          content,
          media: [
            [],
            ...uploads,
            ...(otherAssets || []).map(url => ["http://...", "generated-id"]),
            ...(Array.isArray(assetMentioned) ? assetMentioned : [assetMentioned]).map(id => id && [id, "id"]),
          ].filter((item): item is [string, string] => Array.isArray(item) && item.length === 2),
          anomaly: anomalyId,
          classificationParent: classificationParent,
          classificationtype: anomalyType,
          classificationConfiguration,
        })
        .select()
        .single();

      if (classificationError) {
        console.error("Error creating classification: ", classificationError.message);
        alert("Failed to create classification. Please try again");
        return;
      }

      console.log("Classification created successfully: ", classificationData);

      setContent("");
      setAdditionalFields({});
      setUploads([]);
      setDrawings([]);

      router.push(`/next/${classificationData.id}`);
    } catch (error: any) {
      console.error("Unexpected error: ", error);
      alert("Classification error occurred. Please try again");
    };
  };

  return (
    <div className={`space-y-2 max-w-full px-2 md:px-4 mx-auto overflow-x-hidden ${className}`}>
      <div className="flex justify-between items-center">
        <AnnotationTools
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
          lineWidth={lineWidth}
          setLineWidth={setLineWidth}
        />
      </div>

      {selectedImage && (
        <>
          <div className="w-full text-center max-h-[50vh] md:max-h-[60vh] overflow-auto">
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
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full max-w-5xl mx-auto">
            <SciFiPanel className="p-4 w-full md:w-1/2">
              <Legend
                currentCategory={currentCategory}
                setCurrentCategory={setCurrentCategory}
                categoryCount={categoryCount}
                categories={CATEGORY_CONFIG as Record<AI4MCategory | P4Category, CategoryConfig>}
              />
            </SciFiPanel>

            <SciFiPanel className="p-4 w-full md:w-1/2">
              <div className="space-y-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 h-24 text-sm text-blue-300 rounded-md border border-[#3B4252]"
                  placeholder="Describe your annotations or post any additional information"
                />

                {!isFormVisible ? (
                  <Button onClick={addMedia} disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Save & proceed'}
                  </Button>
                ) : (
                  <Button onClick={createPost} disabled={isUploading}>
                    Submit classification
                  </Button>
                )}
              </div>
            </SciFiPanel>
          </div>

          {/* {otherAssets && (
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
          )} */}
        </>
      )}
    </div>
  );
};