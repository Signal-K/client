import { useSession, useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";
import { generateAnomalyProperties } from "./constants";

export function useDatabaseOperations() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const fetchAnomalies = async () => {
    if (!session) return [];

    try {
      // Fetch anomalies that are linked to this user via linked_anomalies
      const { data: linkedData, error: linkedError } = await supabase
        .from("linked_anomalies")
        .select(`
          id,
          anomaly_id,
          anomalies:anomaly_id (
            id,
            content,
            ticId,
            anomalytype,
            type,
            radius,
            mass,
            density,
            gravity,
            temperatureEq,
            temperature,
            smaxis,
            orbital_period,
            classification_status,
            avatar_url,
            created_at,
            deepnote,
            lightkurve,
            configuration,
            parentAnomaly,
            anomalySet,
            anomalyConfiguration
          )
        `)
        .eq("author", session.user.id)
        .eq("automaton", "Telescope")
        .not("anomalies", "is", null);

      if (linkedError) {
        console.error("Error fetching linked anomalies:", linkedError);
        return [];
      }

      if (linkedData) {
        // Extract the anomaly data from the linked records
        const anomalies = linkedData
          .map((link: any) => link.anomalies)
          .filter(Boolean);
        
        const processedAnomalies = anomalies.map(generateAnomalyProperties);
        console.log("Processed linked anomalies count:", processedAnomalies.length);
        console.log("Sample processed anomaly:", processedAnomalies[0]);
        return processedAnomalies;
      }
    } catch (error) {
      console.error("Error fetching anomalies:", error);
    }
    return [];
  }

  const fetchUserClassifications = async () => {
    if (!session) return []

    try {
      const { data, error } = await supabase
        .from("classifications")
        .select(`
          id, created_at, content, author, anomaly, media, 
          classificationtype, classificationConfiguration
        `)
        .eq("author", session?.user.id)
        .order("created_at", { ascending: false })

      if (!error && data) {
        return data
      }
    } catch (error) {
      console.error("Error fetching user classifications:", error)
    }
    return []
  }

  const fetchAllClassifications = async () => {
    try {
      const { data, error } = await supabase
        .from("classifications")
        .select(`
          id, created_at, content, author, anomaly, media, 
          classificationtype, classificationConfiguration
        `)
        .limit(50)
        .order("created_at", { ascending: false })

      if (!error && data) {
        return data
      }
    } catch (error) {
      console.error("Error fetching all classifications:", error)
    }
    return []
  }

  const createClassification = async (anomalyId: string, classificationType: string, userId: string) => {
    if (!userId) return null;

    try {
      const dbId = Number.parseInt(anomalyId.replace("db-", ""))
      const { data, error } = await supabase
        .from("classifications")
        .insert({
          author: userId,
          anomaly: dbId,
          classificationtype: classificationType,
          content: `Classified as ${classificationType}`,
        })
        .select()
        .single()

      if (!error && data) {
        return data;
      };
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