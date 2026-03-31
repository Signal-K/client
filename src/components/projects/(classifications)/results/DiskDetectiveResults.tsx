"use client";

import React from "react";

interface DiskDetectiveResultsProps {
  classification: any;
}

export function DiskDetectiveResults({ classification }: DiskDetectiveResultsProps) {
  if (classification?.classificationtype !== "diskDetective" || !classification?.classificationConfiguration) {
    return null;
  }

  const { interpretation, selectedOptions, comments, imageCount } = classification.classificationConfiguration;

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-[#2E3440]">
        🔍 Discovery Analysis
      </h3>

      {/* Main discovery result */}
      {interpretation && (
        <div
          className={`p-3 sm:p-4 rounded-lg border ${
            interpretation.category.includes("Disk Candidate") ||
            interpretation.category.includes("Planetary System")
              ? "bg-green-50 border-green-200"
              : interpretation.category === "Unclassified Object"
              ? "bg-gray-50 border-gray-200"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="space-y-2 sm:space-y-3">
            {/* Object type header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  interpretation.category.includes("Disk Candidate") ||
                  interpretation.category.includes("Planetary System")
                    ? "bg-green-100 text-green-800"
                    : interpretation.category === "Unclassified Object"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {interpretation.objectType}
              </span>
              <span className="text-xs text-gray-600">
                Confidence: {interpretation.confidence}
              </span>
            </div>

            {/* What you discovered */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                What You Discovered:
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {interpretation.discovery}
              </p>
            </div>

            {/* Scientific description */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Scientific Details:
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {interpretation.description}
              </p>
            </div>

            {/* Scientific value */}
            <div className="bg-white bg-opacity-50 rounded p-2 sm:p-3">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                Why This Matters:
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {interpretation.scientificValue}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed characteristics (collapsible on mobile) */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-blue-700 hover:text-blue-900 list-none">
          <div className="flex items-center gap-2">
            <span className="group-open:rotate-90 transition-transform">
              ▶
            </span>
            <span>View Technical Details</span>
          </div>
        </summary>
        <div className="mt-2 space-y-2 sm:space-y-3">
          {/* Selected characteristics */}
          {selectedOptions && selectedOptions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Observed Characteristics:
              </h4>
              <ul className="space-y-1">
                {selectedOptions.map((option: any, index: number) => (
                  <li
                    key={index}
                    className="text-xs text-blue-800 flex items-start gap-2"
                  >
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* User comments */}
          {comments && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Your Notes:
              </h4>
              <p className="text-sm text-gray-700 italic leading-relaxed">
                "{comments}"
              </p>
            </div>
          )}

          {/* Survey information */}
          {imageCount && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-purple-600">📊</span>
                <span className="text-sm text-purple-800">
                  Analyzed {imageCount} survey images
                </span>
              </div>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
