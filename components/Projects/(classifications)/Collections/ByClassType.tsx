'use client';

import React, { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { DiscoveryCardSingle } from './Classification';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DiscoveryCardsByClassificationTypeProps { 
  classificationtype: string;
};

export function DiscoveryCardsByClassificationType({ classificationtype }: DiscoveryCardsByClassificationTypeProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  
  const [classifications, setClassifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchClassifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('classifications')
          .select('*')
          .eq('classificationtype', classificationtype); 

        if (error) throw error;

        setClassifications(data);
      } catch (error) {
        console.error('Error fetching classifications:', error);
        setError('Failed to load classifications.');
      } finally {
        setLoading(false);
      }
    };

    if (classificationtype) { 
      fetchClassifications();
    }
  }, [classificationtype, supabase]);

  const goToNext = () => {
    if (currentIndex < classifications.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (classifications.length === 0) return <p>No classifications found for this classification type</p>;

  return (
    <div className="relative">
      <div className="flex items-center space-x-4">
        {/* Left Arrow Button */}
        <button 
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
        >
          <ChevronLeft />
        </button>

        {/* Horizontal Scrolling Container */}
        <div className="flex overflow-x-auto space-x-4 py-2">
          {classifications.map((classification, index) => (
            <div 
              key={classification.id}
              className={`flex-shrink-0 ${index === currentIndex ? 'opacity-100' : 'opacity-50'}`}
            >
              <DiscoveryCardSingle key={classification.id} classificationId={classification.id} />
            </div>
          ))}
        </div>

        {/* Right Arrow Button */}
        <button 
          onClick={goToNext}
          disabled={currentIndex === classifications.length - 1}
          className="p-2 bg-gray-200 rounded-full disabled:opacity-50"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};