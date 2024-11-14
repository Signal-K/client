'use client';

import React, { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { DiscoveryCardsByClassificationType } from '@/components/Projects/(classifications)/Collections/ByClassType';
import { DiscoveryCardsByUserAndAnomaly } from '@/components/Projects/(classifications)/Collections/ByAnomaly';

export default function AllClassifications() {
  const supabase = useSupabaseClient();
  const [classificationTypes, setClassificationTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');

  const [activePlanet, setActivePlanet] = useState<number | null>(null);
  const [anomalyId, setAnomalyId] = useState<number | null>(null);

  const handleActivePlanetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setActivePlanet(Number(e.target.value));
  };

  const handleAnomalyIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnomalyId(Number(e.target.value));
  };

  useEffect(() => {
    const fetchClassificationTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('classifications')
          .select('classificationtype')  // Select classificationtype column
          .neq('classificationtype', null);  // Exclude null values

        if (error) throw error;

        // Remove duplicates manually by using Set
        const uniqueTypes = Array.from(new Set(data.map((row: { classificationtype: string }) => row.classificationtype)));
        setClassificationTypes(uniqueTypes);
      } catch (error) {
        console.error('Error fetching classification types:', error);
      }
    };

    fetchClassificationTypes();
  }, [supabase]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value);
  };

  return (
    <div className="py-2 space-y-8">
      <div>
        <h3>Select Classification Type</h3>
        <form className="space-y-4">
          <select
            value={selectedType}
            onChange={handleTypeChange}
            className="border rounded p-2"
          >
            <option value="">Select Classification Type</option>
            {classificationTypes.map((type, idx) => (
              <option key={idx} value={type}>
                {type}
              </option>
            ))}
          </select>
        </form>
        {selectedType && (
          <DiscoveryCardsByClassificationType classificationtype={selectedType} />
        )}
      </div>

      {/* <div>
        <h3>Select Anomaly</h3>
        <form className="space-y-4">
          <input
            type="number"
            placeholder="Enter Anomaly ID"
            value={anomalyId || ""}
            onChange={handleAnomalyIdChange}
            className="border rounded p-2"
          />
        </form>
        {anomalyId !== null && (
          <DiscoveryCardsByUserAndAnomaly anomalyId={anomalyId} />
        )}
      </div> */}
    </div>
  );
};