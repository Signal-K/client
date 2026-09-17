import React from "react";
import { AggregatedBalloon } from "@/app/planets/[id]/page";

type MarsCloudShape = {
  id: number;
  classificationConfiguration: {
    annotationOptions?: string[];
  };
};

type Props = {
  classifications: MarsCloudShape[];
  onSummaryUpdate?: (summary: AggregatedBalloon) => void;
};

const MarsCloudsShapesAggregator: React.FC<Props> = ({ classifications }) => {
  if (!classifications.length) return <p>No Mars cloud shape classifications yet.</p>;

  const total = classifications.length;

  // Count occurrences of each annotation option
  const annotationCounts = classifications.reduce((acc: Record<string, number>, classification) => {
    const options = classification.classificationConfiguration?.annotationOptions || [];
    options.forEach((option) => {
      acc[option] = (acc[option] || 0) + 1;
    });
    return acc;
  }, {});

  return (
    <div className="p-4 border rounded-lg bg-gray-800 text-white">
      <h2 className="text-lg font-bold mb-2 text-orange-400">Balloon - Mars Cloud Shapes</h2>
      <p className="text-md font-semibold text-yellow-400">Total Classifications: {total}</p>
      {Object.entries(annotationCounts).map(([option, count]) => (
        <p key={option} className="text-md font-semibold text-green-400">
          Total {option}: {count}
        </p>
      ))}
    </div>
  );
};

export default MarsCloudsShapesAggregator;