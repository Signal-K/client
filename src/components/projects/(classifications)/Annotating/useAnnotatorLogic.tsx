"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import { useRouter } from "next/navigation";
import { determineMineralType } from "@/src/utils/mineralAnalysis";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";
import {
  AI4MCATEGORIES,
  P4CATEGORIES,
  PHCATEGORIES,
  NGTSCATEGORIES,
  CACCategories,
  JVHCATEGORIES,
  CoMSCategories,
  SunspotsCategories,
  ActiveAsteroidsCategories,
  CoMCATEGORIES,
  type CoMShapesCategory,
  type ActiveAsteroidsCategory,
  type AI4MCategory,
  type SunspotsCategory,
  type JVHCategory,
  type CACCategory,
  type P4Category,
  type PHCategory,
  type NGTSCategory,
  type CoMCategory,
  type DrawingObject,
  type Tool,
  type CategoryConfig,
} from "@/types/Annotation";

export interface ImageAnnotatorProps {
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
  annotationType:
    | "AI4M"
    | "P4"
    | "PH"
    | "NGTS"
    | "CoM"
    | "CAC"
    | "JVH"
    | "AA"
    | "CoMS"
    | "Sunspots"
    | "Custom";
  className?: string;
  onClassificationComplete?: () => void | Promise<void>;
}

export function useAnnotatorLogic({
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
  className = "",
  onClassificationComplete,
}: ImageAnnotatorProps) {
  const router = useRouter();

  const session = useSession();

  const [selectedImage, setSelectedImage] = useState<string | null>(
    initialImageUrl
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<Tool>("square");
  const [currentCategory, setCurrentCategory] = useState<
    AI4MCategory | P4Category
  >("Custom");
  const [lineWidth, setLineWidth] = useState(2);
  const [drawings, setDrawings] = useState<DrawingObject[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingObject | null>(
    null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploads, setUploads] = useState<[string, string][]>([]);
  const [annotationOptions, setAnnotationOptions] = useState<string[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [hasMineralDeposit, setHasMineralDeposit] = useState<boolean>(false);
  const [mineralDepositId, setMineralDepositId] = useState<number | null>(null);

  const CATEGORY_CONFIG: Record<string, CategoryConfig> =
    annotationType === "AI4M"
      ? AI4MCATEGORIES
      : annotationType === "P4"
      ? P4CATEGORIES
      : annotationType == "AA"
      ? ActiveAsteroidsCategories
      : annotationType === "CoM"
      ? CoMCATEGORIES
      : annotationType === "PH"
      ? PHCATEGORIES
      : annotationType === "NGTS"
      ? NGTSCATEGORIES
      : annotationType === "JVH"
      ? JVHCATEGORIES
      : annotationType === "CAC"
      ? CACCategories
      : annotationType === "Sunspots"
      ? SunspotsCategories
      : annotationType === "CoMS"
      ? CoMSCategories
      : ({} as Record<string, CategoryConfig>);

  const handleSubmitClassification = async () => {
    if (!canvasRef.current || !session) return;

    setIsUploading(true);
    try {
      // First, save the canvas as an image
      const canvas = canvasRef.current;
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) throw new Error("Failed to create Blob from canvas");

      const fileName = `${Date.now()}-${session.user.id}-annotated-image.png`;
      const file = new File([blob], fileName, { type: "image/png" });
      const formData = new FormData();
      formData.append("bucket", "media");
      formData.append("file", file);
      formData.append("fileName", fileName);
      const uploadResponse = await fetch("/api/gameplay/storage/upload", {
        method: "POST",
        body: formData,
      });
      const uploadPayload = await uploadResponse.json().catch(() => null);
      if (!uploadResponse.ok || !uploadPayload?.publicUrl) {
        throw new Error(uploadPayload?.error || "Upload failed");
      }

      let finalUploads = uploads;
      finalUploads = [...uploads, [uploadPayload.publicUrl, fileName]];

      // Check if this anomaly is in the user's linked_anomalies and get the classification_id
      let parentPlanetFromLinkedAnomaly = null;
      if (session?.user?.id && anomalyId) {
        try {
          const response = await fetch(
            `/api/gameplay/linked-anomalies?anomalyId=${anomalyId}&classificationIdOnly=true`,
            { cache: "no-store" }
          );
          const payload = await response.json().catch(() => null);
          if (response.ok && payload?.classification_id) {
            parentPlanetFromLinkedAnomaly = payload.classification_id;
          }
        } catch (error) {
          console.error("Error checking linked_anomalies:", error);
        }
      }

      // Then, create the classification
      const classificationConfiguration = {
        annotationOptions,
        additionalFields,
        parentPlanet: parentPlanetFromLinkedAnomaly || activePlanet?.id,
        createdBy: inventoryItemId ?? null,
        classificationParent: parentClassificationId ?? null,
      };

      const classificationResponse = await fetch("/api/gameplay/classifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          media: [
            [],
            ...finalUploads,
            ...(otherAssets || []).map((url) => ["http://...", "generated-id"]),
            ...(Array.isArray(assetMentioned) ? assetMentioned : [assetMentioned]).map((id) => id && [id, "id"]),
          ].filter(
            (item): item is [string, string] =>
              Array.isArray(item) && item.length === 2
          ),
          anomaly: anomalyId,
          classificationParent: classificationParent,
          classificationtype: anomalyType,
          classificationConfiguration,
        }),
      });

      if (!classificationResponse.ok) {
        const payload = await classificationResponse.json().catch(() => ({}));
        console.error("Error creating classification: ", payload?.error);
        alert("Failed to create classification. Please try again");
        return;
      }
      const classificationData = await classificationResponse.json();

      // Create mineral deposit if this waypoint has one
      if (classificationData && hasMineralDeposit && anomalyId) {
        try {
          // Import mineral analysis functions
          const { determineMineralType } = await import(
            "@/src/utils/mineralAnalysis"
          );

          // Extract categories from drawings
          const categories = drawings.map((d) => d.category as any);

          // Determine mineral type
          const mineralConfig = determineMineralType({
            annotationOptions,
            categories,
          });

          // creating mineral deposit with computed config

          const mineralResponse = await fetch("/api/gameplay/mineral-deposits", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              anomaly: parseInt(anomalyId),
              discovery: classificationData.id,
              mineralconfiguration: mineralConfig,
              location: "Mars",
              roverName: "Rover 1",
              created_at: new Date().toISOString(),
            }),
          });
          if (!mineralResponse.ok) {
            const payload = await mineralResponse.json().catch(() => ({}));
            console.error("Error creating mineral deposit:", payload?.error);
          } else {
            const mineralData = await mineralResponse.json();
            setMineralDepositId(mineralData.id);
          }
        } catch (err) {
          console.error("Error in mineral deposit creation:", err);
        }
      }

      setContent("");
      setAdditionalFields({});
      setUploads([]);
      setDrawings([]);

      // Call the completion callback if provided (for tutorial completion)
      if (onClassificationComplete) {
        onClassificationComplete();
      }
      
      // Always redirect after classification submission
      router.push(`/next/${classificationData.id}`);
    } catch (err) {
      console.error("Error during classification submission:", err);
      alert("Failed to submit classification. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const addMedia = async () => {
    if (!canvasRef.current || !session) return;
    const canvas = canvasRef.current;
    setIsUploading(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) throw new Error("Failed to create Blob from canvas");

      const fileName = `${Date.now()}-${session.user.id}-annotated-image.png`;
      const file = new File([blob], fileName, { type: "image/png" });
      const formData = new FormData();
      formData.append("bucket", "media");
      formData.append("file", file);
      formData.append("fileName", fileName);
      const response = await fetch("/api/gameplay/storage/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.publicUrl) {
        console.error("Upload error:", payload?.error || response.statusText);
      } else {
        setUploads((prev) => [...prev, [payload.publicUrl, fileName]]);
        setIsFormVisible(true);
      }
    } catch (err) {
      console.error("Unexpected error during canvas upload:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const renderCanvas = () => {
    if (!canvasRef.current || !imageRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(
        imageRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    }
  };

  useEffect(() => {
    if (!initialImageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;

      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.visibility = "hidden";
      container.style.width = "100%";
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

  // Update cursor based on current tool and drawing state
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Set cursor based on tool type and drawing state
    if (currentTool === "pen") {
      if (isDrawing) {
        // Enhanced pencil cursor when actively drawing
        canvas.style.cursor =
          "url(\"data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3 21L21 3M21 3L19 5M21 3L19 1M3 21L5 19M3 21H1V23H3V21Z' stroke='%23ff6b6b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\") 3 21, auto";
      } else {
        // Regular pencil cursor when hovering
        canvas.style.cursor =
          "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 18L18 2M18 2L16 4M18 2L16 0M2 18L4 16M2 18H0V20H2V18Z' stroke='%23333' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\") 2 18, auto";
      }
    } else if (currentTool === "circle") {
      canvas.style.cursor = isDrawing ? "grabbing" : "crosshair";
    } else if (currentTool === "square") {
      canvas.style.cursor = isDrawing ? "grabbing" : "crosshair";
    } else {
      canvas.style.cursor = "default";
    }
  }, [currentTool, isDrawing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventTouchScroll = (e: TouchEvent) => e.preventDefault();
    canvas.addEventListener("touchstart", preventTouchScroll, {
      passive: false,
    });
    canvas.addEventListener("touchmove", preventTouchScroll, {
      passive: false,
    });

    return () => {
      canvas.removeEventListener("touchstart", preventTouchScroll);
      canvas.removeEventListener("touchmove", preventTouchScroll);
    };
  }, []);

  useEffect(() => {
    if (imageRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderCanvas();
      }
    }
  }, [selectedImage]);

  useEffect(() => {
    const options = drawings.reduce((acc, drawing) => {
      const categoryName =
        CATEGORY_CONFIG[drawing.category]?.name || drawing.category;
      const existingOption = acc.find((option) => option.name === categoryName);
      if (existingOption) {
        existingOption.quantity += 1;
      } else {
        acc.push({ name: categoryName, quantity: 1 });
      }
      return acc;
    }, [] as { name: string; quantity: number }[]);
    setAnnotationOptions(
      options.map((opt) => `${opt.name} (x${opt.quantity})`)
    );
  }, [drawings, CATEGORY_CONFIG]);

  const categoryCount = drawings.reduce((acc, drawing) => {
    acc[drawing.category] = (acc[drawing.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Function to clear all drawings
  const handleClearAll = () => {
    setDrawings([]);
    setCurrentDrawing(null);
    // Re-render the canvas to remove all annotations
    renderCanvas();
  };

  const [content, setContent] = useState<string>("");
  const [additionalFields, setAdditionalFields] = useState<{
    [key: string]: string;
  }>({});
  const [inventoryItemId, setInventoryItemId] = useState<number | null>(null);
  const { activePlanet } = useActivePlanet();

  useEffect(() => {
    const fetchInventoryItemId = async () => {
      if (!session || !activePlanet) return;
      try {
        const response = await fetch(
          `/api/gameplay/inventory/lookup?anomaly=${activePlanet.id}&item=${structureItemId}`,
          { cache: "no-store" }
        );
        const payload = await response.json().catch(() => null);
        const inventoryData = payload?.item;
        if (!response.ok) throw new Error(payload?.error || "Failed to fetch inventory");
        if (inventoryData) setInventoryItemId(inventoryData.id);
      } catch (error: any) {
        console.error(
          "Error fetching inventory for classification: ",
          error.message
        );
      }
    };
    fetchInventoryItemId();
  }, [session, structureItemId, activePlanet]);

  const createPost = async () => {
    if (!session) return;

    // Check if this anomaly is in the user's linked_anomalies and get the classification_id
    let parentPlanetFromLinkedAnomaly = null;
    if (session?.user?.id && anomalyId) {
      try {
        const response = await fetch(
          `/api/gameplay/linked-anomalies?anomalyId=${anomalyId}&classificationIdOnly=true`,
          { cache: "no-store" }
        );
        const payload = await response.json().catch(() => null);
        if (response.ok && payload?.classification_id) {
          parentPlanetFromLinkedAnomaly = payload.classification_id;
        }
      } catch (error) {
        console.error("Error checking linked_anomalies:", error);
      }
    }

    const classificationConfiguration = {
      annotationOptions,
      additionalFields,
      parentPlanet: parentPlanetFromLinkedAnomaly || activePlanet?.id,
      createdBy: inventoryItemId ?? null,
      classificationParent: parentClassificationId ?? null,
    };

    try {
      const classificationResponse = await fetch("/api/gameplay/classifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          media: [
            [],
            ...uploads,
            ...(otherAssets || []).map((url) => ["http://...", "generated-id"]),
            ...(Array.isArray(assetMentioned) ? assetMentioned : [assetMentioned]).map((id) => id && [id, "id"]),
          ].filter(
            (item): item is [string, string] =>
              Array.isArray(item) && item.length === 2
          ),
          anomaly: anomalyId,
          classificationParent: classificationParent,
          classificationtype: anomalyType,
          classificationConfiguration,
        }),
      });

      if (!classificationResponse.ok) {
        const payload = await classificationResponse.json().catch(() => ({}));
        console.error("Error creating classification: ", payload?.error);
        alert("Failed to create classification. Please try again");
        return;
      }
      const classificationData = await classificationResponse.json();

      console.log("Classification created successfully: ", classificationData);

      setContent("");
      setAdditionalFields({});
      setUploads([]);
      setDrawings([]);

      if (classificationData && hasMineralDeposit) {
        // Extract categories from annotations/drawings
        const categories = drawings.map((d) => d.category as AI4MCategory);

        const mineralConfig = determineMineralType({
          annotationOptions,
          categories,
        });

        const mineralResponse = await fetch("/api/gameplay/mineral-deposits", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            anomaly: anomalyId ? parseInt(anomalyId) : null,
            discovery: classificationData.id,
            mineralConfiguration: mineralConfig,
            location: "Mars",
            roverName: "Rover 1",
            created_at: new Date().toISOString(),
          }),
        });

        if (!mineralResponse.ok) {
          const payload = await mineralResponse.json().catch(() => ({}));
          console.error("Error creating mineral deposit:", payload?.error);
        } else {
          const mineralData = await mineralResponse.json();
          setMineralDepositId(mineralData.id);
        }
      }

      // Call the completion callback if provided (for tutorial completion)
      if (onClassificationComplete) {
        onClassificationComplete();
      }
      
      // Always redirect after classification submission
      router.push(`/next/${classificationData.id}`);
    } catch (error: any) {
      console.error("Unexpected error: ", error);
      alert("Classification error occurred. Please try again");
    }
  };

  useEffect(() => {
    async function checkMineralDeposit() {
      if (!anomalyId || !session) return;

      try {
        const response = await fetch("/api/gameplay/routes/latest", { cache: "no-store" });
        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload?.route) return;

        const config = payload.route.routeConfiguration;
        if (!config || !config.waypoints) return;

        // Find waypoint matching this anomaly
        const waypoint = config.waypoints.find(
          (wp: any) => wp.anomalyId === parseInt(anomalyId)
        );

        if (waypoint?.hasMineralDeposit) {
          setHasMineralDeposit(true);
        }
      } catch (err: any) {
        console.error("Error checking mineral deposit: ", err);
      }
    }

    checkMineralDeposit();
  }, [anomalyId, session]);

  // Determine if we should use horizontal layout (only for Active Asteroids on desktop)
  // Use horizontal layout only for AA with h-full className on desktop (md breakpoint and up)
  const useHorizontalLayout =
    annotationType === "AA" && className?.includes("h-full");
  const isActiveAsteroids = annotationType === "AA";

  return {
    // refs and UI state
    selectedImage,
    setSelectedImage,
    canvasRef,
    imageRef,
    isDrawing,
    setIsDrawing,
    currentTool,
    setCurrentTool,
    lineWidth,
    setLineWidth,
    drawings,
    setDrawings,
    currentDrawing,
    setCurrentDrawing,
    isUploading,
    uploads,
    setUploads,
    annotationOptions,
    isFormVisible,
    setIsFormVisible,
    hasMineralDeposit,
    mineralDepositId,
    CATEGORY_CONFIG,
    handleSubmitClassification,
    addMedia,
    renderCanvas,
    handleClearAll,
    content,
    setContent,
    additionalFields,
    setAdditionalFields,
    inventoryItemId,
    activePlanet,
    createPost,
    categoryCount,
    useHorizontalLayout,
    isActiveAsteroids,
    currentCategory,
    setCurrentCategory,
  };
};
