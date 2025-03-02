import React from "react";

type Anomaly = {
    id: number;
    content: string | null;
    anomalytype: string | null;
    mass: number | null;
    radius: number | null;
    density: number | null;
    gravity: number | null;
    temperature: number | null;
    orbital_period: number | null;
    avatar_url: string | null;
    created_at: string;
  };

interface Classification {
    id: number;
    content: string | null;
    author: string | null;
    anomaly: Anomaly | null;
    media: (string | { uploadUrl?: string })[] | null;
    classificationtype: string | null;
    classificationConfiguration?: any;
    created_at: string;
    title?: string;
    votes?: number;
    category?: string;
    tags?: string[];
    images?: string[];
    relatedClassifications?: Classification[];
    annotationOptions?: any[];  // Add annotationOptions to the Classification type to avoid errors
};

export interface SatellitePlanetFourClassification extends Classification {
    annotationOptions: any[];
    classificationConfiguration?: any; // Ensure it's optional here if required
}
  

interface SatellitePlanetFourAggregatorProps {
  classifications: SatellitePlanetFourClassification[];
}

const SatellitePlanetFourAggregator: React.FC<SatellitePlanetFourAggregatorProps> = ({ classifications }) => {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-bold">Satellite Planet Four Classifications</h3>
      {classifications.length === 0 ? (
        <p>No satellite classifications available.</p>
      ) : (
        classifications.map((classification) => (
          <div key={classification.id} className="mt-4 p-4 border border-gray-200 rounded-md shadow-md bg-[#2C4F64]">
            <h4 className="font-bold text-lg">Classification #{classification.id}</h4>
            <p className="mt-2 text-sm">Annotation Options: {classification.annotationOptions.join(", ")}</p>
            {classification.classificationConfiguration && (
              <pre className="bg-gray-800 text-white p-2 rounded-md">
                {JSON.stringify(classification.classificationConfiguration, null, 2)}
              </pre>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default SatellitePlanetFourAggregator;