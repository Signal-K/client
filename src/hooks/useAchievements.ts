"use client";

import { useState, useEffect } from "react";
import { AchievementProgress } from "../types/achievement";

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<AchievementProgress | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/gameplay/achievements", {
        method: "GET",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to fetch achievements");
      }

      setAchievements(payload as AchievementProgress);
    } catch (err: any) {
      console.error("Error fetching achievements:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    achievements,
    loading,
    error,
    refetch: fetchAchievements,
  };
};
