"use client";

import React, { useState } from "react";

interface DiskDetectiveSlideshowProps {
  images: string[];
  loading?: boolean;
}

export function DiskDetectiveSlideshow({ images, loading }: DiskDetectiveSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="space-y-3">
      <h3 className="text-base sm:text-lg font-semibold text-[#2E3440]">
        📡 Survey Images
      </h3>

      {loading ? (
        <div className="w-full h-48 sm:h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-gray-500 text-sm">Loading images...</span>
        </div>
      ) : images.length > 0 ? (
        <div className="bg-gray-900 rounded-lg p-2 sm:p-4">
          <div className="relative">
            <img
              src={images[currentIndex]}
              alt={`Survey image ${currentIndex + 1}`}
              className="w-full h-48 sm:h-64 object-contain bg-black rounded"
            />

            {/* Image navigation thumbnails */}
            {images.length > 1 && (
              <div className="flex justify-center mt-2 sm:mt-3 gap-1 sm:gap-2 overflow-x-auto pb-2">
                {images.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`flex-shrink-0 w-6 h-6 sm:w-10 sm:h-10 rounded border-2 overflow-hidden ${
                      currentIndex === index ? "border-blue-400" : "border-gray-600"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-contain bg-black"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Navigation buttons */}
            {images.length > 1 && (
              <div className="flex justify-between items-center mt-2 sm:mt-3">
                <button
                  onClick={prevImage}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-md transition-colors text-xs sm:text-sm"
                >
                  ← Prev
                </button>
                <span className="flex items-center text-xs sm:text-sm text-gray-300 mx-2 sm:mx-4">
                  {currentIndex + 1} / {images.length}
                </span>
                <button
                  onClick={nextImage}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-md transition-colors text-xs sm:text-sm"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-gray-500 text-sm">No survey images available</span>
        </div>
      )}
    </div>
  );
}
