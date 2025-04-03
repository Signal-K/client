import React, { useEffect, useState } from "react";
import { automatonaiForMarsOptions } from "@/content/Classifications/Options";
import { AI4MCATEGORIES } from "@/types/Annotation";

export interface AI4MClassification {
  id: number;
  annotationOptions?: string[]; // Made optional to avoid crashing
  classificationConfiguration?: {
    "": Record<number, boolean>;
  };
};

interface AI4MAggregatorProps {
  classifications: AI4MClassification[];
  onSummaryUpdate?: (summary: AggregatedAI4M) => void;
};

export interface AggregatedAI4M {
  sandCount: number;
  soilCount: number;
  bedrockCount: number;
  rockCount: number;
  unlabelledCount: number;
  classificationCounts: Record<string, number>;
};

const AI4MAggregator: React.FC<AI4MAggregatorProps> = ({ classifications, onSummaryUpdate }) => {
  const [aggregatedData, setAggregatedData] = useState<AggregatedAI4M>({
    sandCount: 0,
    soilCount: 0,
    bedrockCount: 0,
    rockCount: 0,
    unlabelledCount: 0,
    classificationCounts: {},
  });

  useEffect(() => {
    const aggregateClassifications = () => {
      let sandCount = 0;
      let soilCount = 0;
      let bedrockCount = 0;
      let rockCount = 0;
      let unlabelledCount = 0;
      let classificationCounts: Record<string, number> = {};
  
      classifications.forEach((classification) => {
        // Ensure annotationOptions exists and is an array
        const options = classification.annotationOptions || [];
  
        options.forEach((option) => {
          const match = option.match(/([a-zA-Z\s-]+) \(x(\d+)\)/);
          if (match) {
            const feature = match[1].trim();
            const count = parseInt(match[2], 10);
  
            switch (feature) {
              case AI4MCATEGORIES.sand.name:
                sandCount += count;
                break;
              case AI4MCATEGORIES["consolidated-soil"].name:
                soilCount += count;
                break;
              case AI4MCATEGORIES.bedrock.name:
                bedrockCount += count;
                break;
              case AI4MCATEGORIES["big-rocks"].name:
                rockCount += count;
                break;
              case AI4MCATEGORIES.Custom.name:
                unlabelledCount += count;
                break;
              default:
                classificationCounts[feature] = (classificationCounts[feature] || 0) + count;
                break;
            }
          }
        });
  
        // Process classification configuration for additional options
        if (classification.classificationConfiguration?.[""]) {
          Object.keys(classification.classificationConfiguration[""]).forEach((key) => {
            const id = parseInt(key, 10);
            const option = automatonaiForMarsOptions.find((opt) => opt.id === id);
            if (option) {
              const featureText = option.text.trim();
              const matchedFeature = options.find((opt) => opt.includes(featureText));
  
              if (matchedFeature) {
                const featureName = matchedFeature.split(" (")[0]; // Extract feature name
                classificationCounts[featureName] = (classificationCounts[featureName] || 0) + 1;
              }
            }
          });
        }
      });
  
      return {
        sandCount,
        soilCount,
        bedrockCount,
        rockCount,
        unlabelledCount,
        classificationCounts,
      };
    };

    const data = aggregateClassifications();

    // Only update if data is different
    setAggregatedData(prevData => {
      if (JSON.stringify(data) !== JSON.stringify(prevData)) {
        onSummaryUpdate?.(data); // Update the summary
        return data;
      }
      return prevData; // No change
    });
  }, [classifications, onSummaryUpdate]);

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold">AI4M Classifications</h3>
      {classifications.length === 0 ? (
        <p>No AI4M classifications available.</p>
      ) : (
        <div className="mt-4 p-4 border border-gray-200 rounded-md shadow-md bg-[#2C4F64] text-white">
          <h4 className="font-bold text-lg">Aggregated Classification Data</h4>
          <ul className="mt-2 space-y-1">
            <li>Total Sand: {aggregatedData.sandCount}</li>
            <li>Total Consolidated Soil: {aggregatedData.soilCount}</li>
            <li>Total Bedrock: {aggregatedData.bedrockCount}</li>
            <li>Total Big Rocks: {aggregatedData.rockCount}</li>
            <li>Total Custom: {aggregatedData.unlabelledCount}</li>
          </ul>
          <h4 className="mt-4 font-bold">Mars Features:</h4>
          <ul className="mt-2 space-y-1">
            {Object.entries(aggregatedData.classificationCounts).map(([feature, count]) => (
              <li key={feature}>
                {feature}: {count}
              </li>
            ))}
          </ul>
        </div>
      )}
      <ul>
        {classifications.map((classification) => (
          <li key={classification.id}>
            ID: {classification.id}, Options: {classification.annotationOptions?.join(", ") || "None"}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AI4MAggregator;