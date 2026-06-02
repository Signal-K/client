"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/src/components/ui/dialog";

interface MediaSliderProps {
  media: string[];
  sourceMedia?: string[];
  className?: string;
}

export function MediaSlider({ media, sourceMedia, className = "" }: MediaSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Combine both media arrays if sourceMedia exists
  const allImages = sourceMedia && sourceMedia.length > 0 
    ? [...media, ...sourceMedia]
    : media;

  const totalImages = allImages.length;

  if (totalImages === 0) return null;

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalImages);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const isSourceImage = sourceMedia && currentIndex >= media.length;

  return (
    <div className={`relative ${className}`}>
      <Dialog>
        <div className="relative group rounded-lg overflow-hidden border border-[#D8DEE9] bg-black">
          {/* Main Image */}
          <DialogTrigger asChild>
            <div className="relative cursor-zoom-in">
              <img
                src={allImages[currentIndex]}
                alt={`Image ${currentIndex + 1} of ${totalImages}`}
                className="w-full h-[400px] object-contain transition-transform duration-200 group-hover:scale-105"
              />
              
              {/* Source indicator badge */}
              {isSourceImage && (
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
                  📊 Source Data
                </div>
              )}

              {/* Zoom indicator */}
              <div className="absolute bottom-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-4 h-4" />
              </div>
            </div>
          </DialogTrigger>

          {/* Navigation Arrows - Only show if more than 1 image */}
          {totalImages > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Lightbox Dialog */}
        <DialogContent className="max-w-7xl w-full h-[90vh] p-0">
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={allImages[currentIndex]}
              alt={`Enlarged view ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {isSourceImage && (
              <div className="absolute top-4 left-4 bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded">
                📊 Source Light Curve Data
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Thumbnail Navigation - Only show if more than 1 image */}
      {totalImages > 1 && (
        <div className="mt-3 space-y-2">
          {/* Image counter */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            {currentIndex + 1} / {totalImages}
            {sourceMedia && sourceMedia.length > 0 && (
              <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                ({media.length} classification + {sourceMedia.length} source)
              </span>
            )}
          </div>

          {/* Thumbnail strip */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            {allImages.map((image, index) => {
              const isSource = sourceMedia && index >= media.length;
              return (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all ${
                    currentIndex === index
                      ? "border-blue-500 scale-110"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {isSource && (
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[8px] text-center py-0.5">
                      SRC
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
