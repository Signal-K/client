import React, { useEffect, useState } from "react";
import { automatonaiForMarsOptions } from "@/content/Classifications/Options";

export interface AI4MClassification {
  id: number;
  annotationOptions: string[];
  classificationConfiguration?: {
    "": Record<number, boolean>;
  };
}

interface AI4MAggregatorProps {
  classifications: AI4MClassification[];
  onSummaryUpdate?: (summary: AggregatedAI4M) => void;
}

export interface AggregatedAI4M {
  sandCount: number;
  soilCount: number;
  bedrockCount: number;
  rockCount: number;
  unlabelledCount: number;
  classificationCounts: Record<string, number>;
}

const AI4MAggregator: React.FC<AI4MAggregatorProps> = ({ classifications, onSummaryUpdate }) => {
  const [aggregatedData, setAggregatedData] = useState<AggregatedAI4M>({
    sandCount: 0,
    soilCount: 0,
    bedrockCount: 0,
    rockCount: 0,
    unlabelledCount: 0,
    classificationCounts: {},
  });

  const aggregateClassifications = () => {
    let sandCount = 0;
    let soilCount = 0;
    let bedrockCount = 0;
    let rockCount = 0;
    let unlabelledCount = 0;
    let classificationCounts: Record<string, number> = {};

    classifications.forEach((classification) => {
      classification.annotationOptions.forEach((option) => {
        const match = option.match(/([a-zA-Z\s]+)\(x(\d+)\)/);
        if (match) {
          const feature = match[1].trim();
          const count = parseInt(match[2]);

          switch (feature) {
            case "Sand":
              sandCount += count;
              break;
            case "Soil":
              soilCount += count;
              break;
            case "Bedrock":
              bedrockCount += count;
              break;
            case "Big rocks":
              rockCount += count;
              break;
            case "Unlabelled":
              unlabelledCount += count;
              break;
            default:
              break;
          }
        }
      });

      if (classification.classificationConfiguration?.[""]) {
        Object.keys(classification.classificationConfiguration[""]).forEach((key) => {
          const id = parseInt(key);
          const option = automatonaiForMarsOptions.find((opt) => opt.id === id);
          if (option) {
            const featureText = option.text.trim().toLowerCase();
            const matchedFeature = classification.annotationOptions.find((option) =>
              option.toLowerCase().includes(featureText)
            );
            if (matchedFeature) {
              const featureName = matchedFeature.split(' (')[0]; // Get the feature name without count
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

  useEffect(() => {
    const data = aggregateClassifications();

    if (JSON.stringify(data) !== JSON.stringify(aggregatedData)) {
      setAggregatedData(data);
    }

    if (onSummaryUpdate) {
      onSummaryUpdate(data);
    }
  }, []);

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold">AI4M Classifications</h3>
      {classifications.length === 0 ? (
        <p>No AI4M classifications available.</p>
      ) : (
        <div className="mt-4 p-4 border border-gray-200 rounded-md shadow-md bg-[#2C4F64]">
          <h4 className="font-bold text-lg">Aggregated Classification Data</h4>
          <p className="mt-2 text-sm">Total Sand: {aggregatedData.sandCount}</p>
          <p className="mt-2 text-sm">Total Soil: {aggregatedData.soilCount}</p>
          <p className="mt-2 text-sm">Total Bedrock: {aggregatedData.bedrockCount}</p>
          <p className="mt-2 text-sm">Total Big Rocks: {aggregatedData.rockCount}</p>
          <p className="mt-2 text-sm">Total Unlabelled: {aggregatedData.unlabelledCount}</p>
          <h4 className="mt-4 font-bold">Mars Features:</h4>
          <ul className="mt-2">
            {Object.entries(aggregatedData.classificationCounts).map(([feature, count]) => (
              <li key={feature} className="text-sm">
                {feature}: {count}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AI4MAggregator;