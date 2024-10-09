'use client';

import React, { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { DiscoveryCardSingle } from './Classification';

interface DiscoveryCardsByUserAndAnomalyProps {
  anomalyId: number;
}

export function DiscoveryCardsByUserAndAnomaly({ anomalyId }: DiscoveryCardsByUserAndAnomalyProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  
  const [classifications, setClassifications] = useState<any[]>([]);
  const [totalClassifications, setTotalClassifications] = useState<number | null>(null);
  const [userClassificationsCount, setUserClassificationsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassifications = async () => {
      setLoading(true);
      setError(null);

      // Check if session is available
      if (!session?.user?.id) {
        setError('No user session found.');
        setLoading(false);
        return;
      }

      try {
        // Fetch total classifications for this anomaly
        const { count: totalCount, error: totalError } = await supabase
          .from('classifications')
          .select('id', { count: 'exact' })
          .eq('anomaly', anomalyId);

        if (totalError) {
          console.error('Error fetching total classifications:', totalError);
          throw totalError;
        }

        setTotalClassifications(totalCount);

        // Fetch the number of classifications the user has made for this anomaly
        const { count: userCount, error: userError } = await supabase
          .from('classifications')
          .select('id', { count: 'exact' })
          .eq('author', session.user.id)
          .eq('anomaly', anomalyId);

        if (userError) {
          console.error('Error fetching user classifications count:', userError);
          throw userError;
        }

        setUserClassificationsCount(userCount);

        // Fetch the actual classification data for the user
        const { data, error: classificationsError } = await supabase
          .from('classifications')
          .select('id')
          .eq('author', session.user.id)
          .eq('anomaly', anomalyId);

        if (classificationsError) {
          console.error('Error fetching classifications data:', classificationsError);
          throw classificationsError;
        }

        setClassifications(data);
      } catch (error) {
        console.error('Error fetching classifications:', error);
        setError('Failed to load classifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchClassifications();
  }, [anomalyId, supabase, session?.user?.id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-col space-y-4">
      {/* Display total classifications and user-specific count */}
      <div className="mb-4">
        <p>Total classifications for this anomaly: {totalClassifications ?? 'N/A'}</p>
        <p>Your classifications for this anomaly: {userClassificationsCount ?? 'N/A'}</p>
      </div>

      {classifications.length === 0 ? (
        <p>No classifications found for this anomaly by user</p>
      ) : (
        classifications.map((classification) => (
          <DiscoveryCardSingle key={classification.id} classificationId={classification.id} />
        ))
      )}
    </div>
  );
};