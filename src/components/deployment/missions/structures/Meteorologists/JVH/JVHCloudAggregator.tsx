import React from "react";

type Classification = {
  classificationConfiguration: {
    annotationOptions: string[];
  };
};

type AggregatedAnnotations = { [key: string]: number };

const JVHCloudAggregator: React.FC<{ classifications: Classification[] }> = ({
  classifications,
}) => {
  const aggregateAnnotations = () => {
    const counts: AggregatedAnnotations = {};

    classifications.forEach((classification) => {
      const options =
        classification.classificationConfiguration?.annotationOptions || [];
      options.forEach((option) => {
        const match = option.match(/(.+?)\s?\(x(\d+)\)/);
        if (match) {
          const label = match[1].trim();
          const count = parseInt(match[2], 10);
          counts[label] = (counts[label] || 0) + count;
        } else {
          counts[option] = (counts[option] || 0) + 1;
        }
      });
    });

    return counts;
  };

  const aggregated = aggregateAnnotations();

  return (
    <div className="p-4 border rounded-lg bg-gray-900 mt-4">
      <h2 className="text-lg font-bold mb-2 text-yellow-400">
        Aggregated Annotations
      </h2>
      {Object.keys(aggregated).length > 0 ? (
        <ul className="list-disc list-inside text-sm">
          {Object.entries(aggregated).map(([annotation, count]) => (
            <li key={annotation}>
              {count}x {annotation}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No annotations available.</p>
      )}
    </div>
  );
};

export default JVHCloudAggregator;