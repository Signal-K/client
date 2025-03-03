"use client";

import React, { useState } from "react";

interface Classification {
  id: number;
  classificationConfiguration?: ClassificationConfiguration;
};

interface ClassificationConfiguration {
  createdBy?: number | null;
  activePlanet?: number;
  additionalFields?: Record<string, any>;
  annotationOptions?: string[];
  parentPlanetLocation?: string;
  classificationOptions?: Record<string, Record<string, boolean>>;
};

interface AggregatedCloud {
  annotationOptions: Record<string, number>;
  classificationOptions: Record<string, Record<string, number>>;
  additionalFields: Record<string, Set<string>>;
};

const aggregateCloudClassifications = (
  classifications: Classification[]
): AggregatedCloud => {
  const aggregated: AggregatedCloud = {
    annotationOptions: {},
    classificationOptions: {},
    additionalFields: {},
  };

  classifications.forEach(({ classificationConfiguration }) => {
    if (!classificationConfiguration) return;

    classificationConfiguration.annotationOptions?.forEach((option) => {
      const match = option.match(/(.+?)\s*\(x(\d+)\)/);
      if (match) {
        const [, name, count] = match;
        aggregated.annotationOptions[name] =
          (aggregated.annotationOptions[name] || 0) + parseInt(count);
      } else {
        aggregated.annotationOptions[option] =
          (aggregated.annotationOptions[option] || 0) + 1;
      }
    });

    Object.entries(classificationConfiguration.classificationOptions || {}).forEach(
      ([category, values]) => {
        if (!aggregated.classificationOptions[category]) {
          aggregated.classificationOptions[category] = {};
        }
        Object.entries(values).forEach(([key, value]) => {
          if (value) {
            aggregated.classificationOptions[category][key] =
              (aggregated.classificationOptions[category][key] || 0) + 1;
          }
        });
      }
    );

    Object.entries(classificationConfiguration.additionalFields || {}).forEach(
      ([key, value]) => {
        if (!aggregated.additionalFields[key]) {
          aggregated.additionalFields[key] = new Set();
        }
        aggregated.additionalFields[key].add(value);
      }
    );
  });

  return aggregated;
};

const CloudClassificationSummary: React.FC<{ classifications: Classification[] }> = ({
  classifications,
}) => {
  const aggregatedData = aggregateCloudClassifications(classifications);
  const [showAggregated, setShowAggregated] = useState(true);

  return (
    <div className="p-4 border border-gray-200 rounded-md shadow-md bg-[#2C4F64] text-white">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Cloud Classification Summary</h3>
        <button
          onClick={() => setShowAggregated(!showAggregated)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md"
        >
          {showAggregated ? "Show Individual" : "Show Aggregated"}
        </button> 
      </div>

      {showAggregated ? (
        <div>
          <div className="mt-4">
            <h4 className="font-bold">Annotation Options</h4>
            <ul>
              {Object.entries(aggregatedData.annotationOptions).map(([option, count]) => (
                <li key={option}>
                  {option} (x{count})
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <h4 className="font-bold">Classification Options</h4>
            <ul>
              {Object.entries(aggregatedData.classificationOptions).map(([category, values]) => (
                <li key={category}>
                  <strong>{category || "General"}</strong>:{" "}
                  {Object.entries(values)
                    .map(([key, count]) => `${key} (x${count})`)
                    .join(", ")}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4">
            <h4 className="font-bold">Additional Fields</h4>
            <ul>
              {Object.entries(aggregatedData.additionalFields).map(([key, values]) => (
                <li key={key}>
                  <strong>{key}</strong>: {[...values].join(", ")}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <h4 className="font-bold">Individual Classifications</h4>
          {classifications.map((classification) => (
            <div key={classification.id} className="p-3 border border-gray-300 rounded-md mt-2">
              <strong>Classification #{classification.id}</strong>
              <pre className="mt-2 bg-gray-800 p-2 rounded-md text-xs">
                {JSON.stringify(classification.classificationConfiguration, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CloudClassificationSummary;