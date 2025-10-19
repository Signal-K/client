"use client";

import React from "react";
import { AnnotationTools } from "./AnnotationTools";
import { AnnotationCanvas } from "./DrawingCanvas";
import { Button } from "@/src/components/ui/button";
import { Legend } from "./Legend";
import { SciFiPanel } from "@/src/components/ui/styles/sci-fi/panel";
import { useAnnotatorLogic, ImageAnnotatorProps } from "./useAnnotatorLogic";

export default function AnnotatorView(props: ImageAnnotatorProps) {
  const {
    selectedImage,
    isDrawing,
    setIsDrawing,
    currentTool,
    setCurrentTool,
    lineWidth,
    setLineWidth,
    canvasRef,
    imageRef,
    handleSubmitClassification,
    isUploading,
    drawings,
    setDrawings,
    currentDrawing,
    setCurrentDrawing,
    currentCategory,
    setCurrentCategory,
    CATEGORY_CONFIG,
    content,
    setContent,
    handleClearAll,
    addMedia,
    annotationOptions,
    categoryCount,
    hasMineralDeposit,
    useHorizontalLayout,
    isActiveAsteroids,
  } = useAnnotatorLogic(props as ImageAnnotatorProps) as any;

  // NOTE: we intentionally return the same JSX and structure as the original file.
  return (
    <div
      className={`max-w-full overflow-x-hidden ${
        useHorizontalLayout
          ? "h-full flex flex-col"
          : "space-y-2 px-2 md:px-4 mx-auto"
      } ${props.className ?? ""}`}
    >
      <style jsx>{`
        .annotation-canvas-container {
          transition: all 0.2s ease-in-out;
        }
        .annotation-canvas-container:hover {
          transform: scale(1.01);
        }
        .annotation-canvas-container.drawing {
          box-shadow: 0 0 20px rgba(255, 107, 107, 0.3);
          transform: scale(1.02);
        }
      `}</style>

      <div
        className={`${useHorizontalLayout ? "flex-shrink-0" : ""} flex justify-between items-center px-2`}
      >
        <AnnotationTools
          currentTool={currentTool}
          setCurrentTool={setCurrentTool}
          lineWidth={lineWidth}
          setLineWidth={setLineWidth}
          onClearAll={handleClearAll}
        />
      </div>

      {hasMineralDeposit && (
        <div className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white p-3 mb-2 rounded-lg border-2 border-amber-400 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <div>
                <h3 className="font-bold text-sm">Mineral deposits can be found here</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <>
          {useHorizontalLayout && (
            <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-4 overflow-hidden px-2">
              <div
                className={`annotation-canvas-container ${isDrawing ? "drawing" : ""} flex-1 min-h-0 overflow-hidden flex items-center justify-center bg-gray-900 rounded-lg`}
              >
                <AnnotationCanvas
                  canvasRef={canvasRef}
                  imageRef={imageRef}
                  isDrawing={isDrawing}
                  setIsDrawing={setIsDrawing}
                  currentTool={currentTool}
                  currentColor={
                    CATEGORY_CONFIG[
                      currentCategory as keyof typeof CATEGORY_CONFIG
                    ]?.color || "#000000"
                  }
                  lineWidth={lineWidth}
                  drawings={drawings}
                  setDrawings={setDrawings}
                  currentDrawing={currentDrawing}
                  setCurrentDrawing={setCurrentDrawing}
                  currentCategory={currentCategory}
                />
              </div>

              <div className="w-full md:w-80 md:min-w-80 flex flex-col gap-3 overflow-y-auto">
                <SciFiPanel className="p-3">
                  <Legend
                    currentCategory={currentCategory}
                    setCurrentCategory={setCurrentCategory}
                    categoryCount={categoryCount}
                    categories={CATEGORY_CONFIG as Record<any, any>}
                  />
                </SciFiPanel>

                <SciFiPanel className="p-3">
                  <div className="space-y-3">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full p-2 h-20 text-sm text-blue-300 rounded-md border border-[#3B4252]"
                      placeholder="Describe your annotations or post any additional information"
                    />

                    <Button
                      onClick={handleSubmitClassification}
                      disabled={isUploading}
                      className="w-full text-sm py-2"
                    >
                      {isUploading ? "Submitting..." : "Submit Classification"}
                    </Button>
                  </div>
                </SciFiPanel>
              </div>
            </div>
          )}

          {!useHorizontalLayout && (
            <>
              <div
                className={`annotation-canvas-container ${isDrawing ? "drawing" : ""} w-full text-center ${isActiveAsteroids ? "min-h-[60vh] md:max-h-[60vh]" : "max-h-[50vh] md:max-h-[60vh]"} overflow-auto`}
              >
                <AnnotationCanvas
                  canvasRef={canvasRef}
                  imageRef={imageRef}
                  isDrawing={isDrawing}
                  setIsDrawing={setIsDrawing}
                  currentTool={currentTool}
                  currentColor={
                    CATEGORY_CONFIG[
                      currentCategory as keyof typeof CATEGORY_CONFIG
                    ]?.color || "#000000"
                  }
                  lineWidth={lineWidth}
                  drawings={drawings}
                  setDrawings={setDrawings}
                  currentDrawing={currentDrawing}
                  setCurrentDrawing={setCurrentDrawing}
                  currentCategory={currentCategory}
                />
              </div>

              {isActiveAsteroids ? (
                <div className="flex flex-col gap-3 md:gap-4 w-full max-w-5xl mx-auto px-2">
                  <SciFiPanel className="p-3 md:p-4 w-full">
                    <Legend
                      currentCategory={currentCategory}
                      setCurrentCategory={setCurrentCategory}
                      categoryCount={categoryCount}
                      categories={CATEGORY_CONFIG as Record<any, any>}
                    />
                  </SciFiPanel>

                  <SciFiPanel className="p-3 md:p-4 w-full">
                    <div className="space-y-3 md:space-y-4">
                      <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-2 md:p-3 h-20 md:h-24 text-sm text-blue-300 rounded-md border border-[#3B4252]"
                        placeholder="Describe your annotations or post any additional information"
                      />

                      <Button
                        onClick={handleSubmitClassification}
                        disabled={isUploading}
                        className="w-full"
                      >
                        {isUploading ? "Submitting..." : "Submit Classification"}
                      </Button>
                    </div>
                  </SciFiPanel>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row gap-4 w-full max-w-5xl mx-auto">
                  <SciFiPanel className="p-4 w-full md:w-1/2">
                    <Legend
                      currentCategory={currentCategory}
                      setCurrentCategory={setCurrentCategory}
                      categoryCount={categoryCount}
                      categories={CATEGORY_CONFIG as Record<any, any>}
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

                      <Button onClick={handleSubmitClassification} disabled={isUploading}>
                        {isUploading ? "Submitting..." : "Submit Classification"}
                      </Button>
                    </div>
                  </SciFiPanel>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
