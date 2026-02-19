import { generateAnomalyProperties } from "./constants";

export function useDatabaseOperations() {
  const fetchViewportBundle = async () => {
    const response = await fetch("/api/gameplay/telescope/viewport", {
      method: "GET",
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || "Failed to load telescope viewport data");
    }
    return payload as {
      anomalies: any[];
      userClassifications: any[];
      allClassifications: any[];
    };
  };

  const fetchAnomalies = async () => {
    try {
      const payload = await fetchViewportBundle();
      return (payload.anomalies || []).map(generateAnomalyProperties);
    } catch (error) {
      console.error("Error fetching anomalies:", error);
    }
    return [];
  }

  const fetchUserClassifications = async () => {
    try {
      const payload = await fetchViewportBundle();
      return payload.userClassifications || [];
    } catch (error) {
      console.error("Error fetching user classifications:", error)
    }
    return []
  }

  const fetchAllClassifications = async () => {
    try {
      const payload = await fetchViewportBundle();
      return payload.allClassifications || [];
    } catch (error) {
      console.error("Error fetching all classifications:", error)
    }
    return []
  }

  const createClassification = async (anomalyId: string, classificationType: string) => {
    try {
      const dbId = Number.parseInt(anomalyId.replace("db-", ""))
      const response = await fetch("/api/gameplay/classifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anomaly: dbId,
          classificationtype: classificationType,
          content: `Classified as ${classificationType}`,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to create classification");
      }

      const data = await response.json();
      if (data) return data;
    } catch (error) {
      console.error("Error creating classification:", error);
    };
    return null
  };

  return {
    fetchAnomalies,
    fetchUserClassifications,
    fetchAllClassifications,
    createClassification,
  };
};
