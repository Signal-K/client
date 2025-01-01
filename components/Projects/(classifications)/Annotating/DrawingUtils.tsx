import type { Point } from '@/types/Annotation';

// Simple curve generator that creates a smooth path through points
export const createLineGenerator = () => {
  return (points: Point[]): string => {
    if (points.length < 2) return '';

    // Move to the first point
    let path = `M ${points[0].x},${points[0].y}`;

    // Create smooth curves between points
    for (let i = 1; i < points.length - 2; i++) {
      const current = points[i];
      const next = points[i + 1];
      
      // Calculate control point as the midpoint between current and next
      const controlX = (current.x + next.x) / 2;
      const controlY = (current.y + next.y) / 2;
      
      path += ` Q ${current.x},${current.y} ${controlX},${controlY}`;
    }

    // For the last two points
    if (points.length >= 2) {
      const last = points[points.length - 1];
      const secondLast = points[points.length - 2];
      path += ` L ${last.x},${last.y}`;
    }

    return path;
  };
};

export const getMousePosition = (
  event: React.MouseEvent<SVGSVGElement>,
  svg: SVGSVGElement
): Point => {
  const CTM = svg.getScreenCTM();
  if (!CTM) return { x: 0, y: 0 };

  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  
  const transformedPoint = point.matrixTransform(CTM.inverse());
  return {
    x: transformedPoint.x,
    y: transformedPoint.y
  };
};

export const downloadAnnotatedImage = async (
  svgElement: SVGSVGElement,
  imageElement: HTMLImageElement
): Promise<void> => {
  // Create canvas with the correct dimensions
  const canvas = document.createElement('canvas');
  const width = imageElement.naturalWidth;
  const height = imageElement.naturalHeight;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Draw the original image
  ctx.drawImage(imageElement, 0, 0);

  // Convert SVG to data URL
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  // Create and load SVG image
  const svgImg = new Image();
  
  try {
    await new Promise((resolve, reject) => {
      svgImg.onload = resolve;
      svgImg.onerror = () => reject(new Error('Failed to load SVG image'));
      svgImg.src = svgUrl;
    });

    // Draw SVG on top of the original image
    ctx.drawImage(svgImg, 0, 0, width, height);

    // Convert to blob and download
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });

    if (!blob) {
      throw new Error('Failed to create image blob');
    }

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'annotated-image.png';
    link.href = url;
    link.click();

    // Cleanup
    URL.revokeObjectURL(url);
    URL.revokeObjectURL(svgUrl);
  } catch (error) {
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};