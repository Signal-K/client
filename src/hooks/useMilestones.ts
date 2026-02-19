"use client";

import { useState, useEffect } from "react";
import { MilestoneProgress } from "../types/achievement";

export const useMilestones = () => {
  const [milestones, setMilestones] = useState<MilestoneProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/gameplay/milestones/progress", {
        method: "GET",
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to fetch milestones");
      }

      setMilestones(payload as MilestoneProgress);
      
      
    } catch (err: any) {
      console.error("Error fetching milestones:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    milestones,
    loading,
    error,
    refetch: fetchAchievements,
  };
};
