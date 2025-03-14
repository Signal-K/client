import React, { useEffect } from "react";
import { AggregatedP4 } from "@/app/planets/[id]/page";

interface ClassificationOption {
  id: number;
  text: string;
}

export const PlanetFourOptions: ClassificationOption[] = [
  { id: 1, text: "Dust Deposits" },
  { id: 2, text: "Surface Cracks" },
  { id: 3, text: "Spider-like Features" },
  { id: 4, text: "Rocky Outcrops" },
  { id: 5, text: "Smooth Terrain" },
];

export interface SatellitePlanetFourClassification {
  id: number;
  annotationOptions: string[];
  classificationConfiguration?: {
    "": Record<number, boolean>;
  };
}

interface SatellitePlanetFourAggregatorProps {
  classifications: SatellitePlanetFourClassification[];
  onSummaryUpdate?: (summary: AggregatedP4) => void;
}

const SatellitePlanetFourAggregator: React.FC<SatellitePlanetFourAggregatorProps> = ({
  classifications,
  onSummaryUpdate,
}) => {
  const aggregateClassifications = () => {
    let fanCount = 0;
    let blotchCount = 0;
    let classificationCounts: Record<string, number> = {};

    classifications.forEach((classification) => {
      // Count fans and blotches
      classification.annotationOptions.forEach((option) => {
        if (option.includes("Fan")) {
          const match = option.match(/\(x(\d+)\)/);
          fanCount += match ? parseInt(match[1]) : 1;
        } else if (option.includes("Blotch")) {
          const match = option.match(/\(x(\d+)\)/);
          blotchCount += match ? parseInt(match[1]) : 1;
        }
      });

      // Count classification options (surface features)
      if (classification.classificationConfiguration?.[""]) {
        Object.keys(classification.classificationConfiguration[""]).forEach((key) => {
          const id = parseInt(key);
          const option = PlanetFourOptions.find((opt) => opt.id === id);
          if (option) {
            classificationCounts[option.text] = (classificationCounts[option.text] || 0) + 1;
          }
        });
      }
    });

    return { fanCount, blotchCount, classificationCounts };
  };

  const { fanCount, blotchCount, classificationCounts } = aggregateClassifications();

  // Call onSummaryUpdate when classifications are updated
  useEffect(() => {
    if (onSummaryUpdate) {
      onSummaryUpdate({
        fanCount,
        blotchCount,
        classificationCounts,
      });
    }
  }, [fanCount, blotchCount, classificationCounts, onSummaryUpdate]);

  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold">Satellite Planet Four Classifications</h3>
      {classifications.length === 0 ? (
        <p>No satellite classifications available.</p>
      ) : (
        <div className="mt-4 p-4 border border-gray-200 rounded-md shadow-md bg-[#2C4F64]">
          <h4 className="font-bold text-lg">Aggregated Classification Data</h4>
          <p className="mt-2 text-sm">Total Fans: {fanCount}</p>
          <p className="mt-2 text-sm">Total Blotches: {blotchCount}</p>
          <h4 className="mt-4 font-bold">Surface Features:</h4>
          <ul className="mt-2">
            {Object.entries(classificationCounts).map(([feature, count]) => (
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

export default SatellitePlanetFourAggregator;