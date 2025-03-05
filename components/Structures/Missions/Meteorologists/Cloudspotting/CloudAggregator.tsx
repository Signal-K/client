'use client';

import React, { useState, useEffect, useRef } from "react";

interface Classification {
  id: number;
  classificationConfiguration?: ClassificationConfiguration;
}

interface ClassificationConfiguration {
  createdBy?: number | null;
  activePlanet?: number;
  additionalFields?: Record<string, any>;
  annotationOptions?: string[];
  parentPlanetLocation?: string;
  classificationOptions?: Record<string, Record<string, boolean>>;
}

interface AggregatedCloud {
  annotationOptions: Record<string, number>;
  classificationOptions: Record<string, Record<string, number>>;
  additionalFields: Record<string, Set<string>>;
  colourClassifications?: Record<string, Record<string, number>>;
  cloudColours?: Record<string, number>;
}

const aggregateCloudClassifications = (
  classifications: Classification[]
): AggregatedCloud => {
  const aggregated: AggregatedCloud = {
    annotationOptions: {},
    classificationOptions: {},
    additionalFields: {},
    colourClassifications: {},
    cloudColours: {},
  };

  classifications.forEach(({ classificationConfiguration }) => {
    if (!classificationConfiguration) return;

    const {
      annotationOptions = [],
      classificationOptions = {},
      additionalFields = {},
    } = classificationConfiguration;

    // Handle annotation options
    annotationOptions.forEach((option) => {
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

    // Handle classification options
    Object.entries(classificationOptions).forEach(([category, values]) => {
      // Detect colour classifications
      const colourMatch = category.match(/(\w+)\s*colour/i);
      
      if (colourMatch) {
        const colour = colourMatch[1].toLowerCase();
        
        // Aggregate for colourClassifications
        if (!aggregated.colourClassifications![colour]) {
          aggregated.colourClassifications![colour] = {};
        }
        
        Object.entries(values).forEach(([key, value]) => {
          if (value) {
            aggregated.colourClassifications![colour][key] = 
              (aggregated.colourClassifications![colour][key] || 0) + 1;
          }
        });

        // Aggregate for cloudColours
        aggregated.cloudColours![colour] = 
          (aggregated.cloudColours![colour] || 0) + 1;
      } else {
        // Regular classification options
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
    });

    // Handle additional fields
    Object.entries(additionalFields).forEach(([key, value]) => {
      if (!aggregated.additionalFields[key]) {
        aggregated.additionalFields[key] = new Set();
      }
      aggregated.additionalFields[key].add(value);
    });
  });

  return aggregated;
};

const CloudClassificationSummary: React.FC<{
  classifications: Classification[];
  onSummaryUpdate: (summary: AggregatedCloud) => void;
}> = ({ classifications, onSummaryUpdate }) => {
  const [cloudSummary, setCloudSummary] = useState<AggregatedCloud | null>(null);
  const hasUpdated = useRef(false);

  useEffect(() => {
    if (hasUpdated.current) return;

    const aggregatedData = aggregateCloudClassifications(classifications);
    setCloudSummary(aggregatedData);
    onSummaryUpdate(aggregatedData);

    hasUpdated.current = true;
  }, [classifications, onSummaryUpdate]);

  if (!cloudSummary) return <div>Loading...</div>;

  return (
    <div className="p-4 border border-gray-200 rounded-md shadow-md bg-[#2C4F64] text-white">
      <h3 className="text-xl font-bold">Cloud Classification Summary</h3>

      {/* Annotation Options */}
      <div className="mt-4">
        <h4 className="font-bold">Annotation Options</h4>
        {Object.entries(cloudSummary.annotationOptions).length === 0 ? (
          <p>No data available</p>
        ) : (
          <ul>
            {Object.entries(cloudSummary.annotationOptions).map(([key, value]) => (
              <li key={key}>
                {key}: {value}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Classification Options */}
      <div className="mt-4">
        <h4 className="font-bold">Classification Options</h4>
        {Object.entries(cloudSummary.classificationOptions).length === 0 ? (
          <p>No data available</p>
        ) : (
          <ul>
            {Object.entries(cloudSummary.classificationOptions).map(([key, values]) => (
              <li key={key}>
                <strong>{key}</strong>
                <ul>
                  {Object.entries(values).map(([subKey, count]) => (
                    <li key={subKey}>
                      {subKey}: {count}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Colour Classifications */}
      {cloudSummary.colourClassifications && Object.keys(cloudSummary.colourClassifications).length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold">Colour Classifications</h4>
          <ul>
            {Object.entries(cloudSummary.colourClassifications).map(([colour, values]) => (
              <li key={colour}>
                <strong>{colour.charAt(0).toUpperCase() + colour.slice(1)} colour</strong>
                <ul>
                  {Object.entries(values).map(([subKey, count]) => (
                    <li key={subKey}>
                      {subKey}: {count}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Cloud Colours */}
      {cloudSummary.cloudColours && Object.keys(cloudSummary.cloudColours).length > 0 && (
        <div className="mt-4">
          <h4 className="font-bold">Cloud Colours</h4>
          <ul>
            {Object.entries(cloudSummary.cloudColours).map(([colour, count]) => (
              <li key={colour}>
                {colour}: {count}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Additional Fields */}
      <div className="mt-4">
        <h4 className="font-bold">Additional Fields</h4>
        {Object.entries(cloudSummary.additionalFields).length === 0 ? (
          <p>No data available</p>
        ) : (
          <ul>
            {Object.entries(cloudSummary.additionalFields).map(([key, values]) => (
              <li key={key}>
                {key}: {Array.from(values).join(", ")}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CloudClassificationSummary;


{/*         <div className="mt-4">
          <h4 className="font-bold">Individual Classifications</h4>
          {classifications.map((classification) => (
            <div key={classification.id} className="p-3 border border-gray-300 rounded-md mt-2">
              <strong>Classification #{classification.id}</strong>
              <pre className="mt-2 bg-gray-800 p-2 rounded-md text-xs">
                {JSON.stringify(classification.classificationConfiguration, null, 2)}
              </pre>
            </div>
          ))}
        </div> */}