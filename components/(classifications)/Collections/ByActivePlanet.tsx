'use client';

import React, { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { DiscoveryCardSingle } from './Classification';

interface DiscoveryCardsByActivePlanetProps {
  activePlanet: number;
}

export function DiscoveryCardsByActivePlanet({ activePlanet }: DiscoveryCardsByActivePlanetProps) {
  const supabase = useSupabaseClient();
  const [classifications, setClassifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('classifications')
          .select('id')
          .filter('classificationConfiguration->activePlanet', 'eq', activePlanet);

        if (error) throw error;

        setClassifications(data);
      } catch (error) {
        console.error('Error fetching classifications:', error);
        setError('Failed to load classifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassifications();
  }, [activePlanet, supabase]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (classifications.length === 0) return <p>No classifications found for active planet {activePlanet}.</p>;

  return (
    <div className="flex flex-col space-y-4">
      {classifications.map((classification) => (
        <DiscoveryCardSingle key={classification.id} classificationId={classification.id} />
      ))}
    </div>
  );
}
