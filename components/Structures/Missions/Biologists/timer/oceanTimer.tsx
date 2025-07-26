'use client';

import React, { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

const OceanCounter = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [classifications, setClassifications] = useState<any[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const fetchClassifications = async () => {
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from("classifications")
          .select('id, classificationtype, created_at')
          .eq('author', session.user.id)
          .in('classificationtype', ['zoodex-clickACoral', 'zoodex-planktonPortal'])
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching classifications:', error);
        } else {
          setClassifications(data || []);
        }
      }
    };

    fetchClassifications();
  }, [session]);

  useEffect(() => {
    const checkRecentClassifications = () => {
      const relevantClassifications = classifications.filter((classification) => {
        const timeDiff = new Date().getTime() - new Date(classification.created_at).getTime();
        return timeDiff <= 24 * 60 * 60 * 1000; // within the last 24 hours
      });

      if (relevantClassifications.length >= 3) {
        const thirdRecentClassification = relevantClassifications[2];
        const thirdRecentTime = new Date(thirdRecentClassification.created_at).getTime();
        const timeLeft = thirdRecentTime + 24 * 60 * 60 * 1000 - new Date().getTime();
        setCountdown(timeLeft > 0 ? timeLeft : 0); // Set the countdown to the remaining time or 0 if passed
      }
    };

    checkRecentClassifications();
  }, [classifications]);

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 1000 / 60 / 60);
    const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((time % (1000 * 60)) / 1000);
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-wrap gap-6 p-6">
      <div className="bg-gray-900 bg-opacity-80 p-4 rounded-lg">
        <h3 className="text-xl font-semibold text-white">Classifications Overview</h3>
        <p className="text-sm text-gray-400">{classifications.length} classifications available</p>

        {countdown !== null && countdown > 0 ? (
          <div className="mt-4 text-center">
            <p className="text-lg text-yellow-400">You have classified all animal sightings. Please wait for more to become available.</p>
            <p className="text-white text-xl font-bold">{formatTime(countdown)} remaining</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-400">You have more classifications available for these animal sightings.</p>
        )}
      </div>
    </div>
  );
};

export default OceanCounter;