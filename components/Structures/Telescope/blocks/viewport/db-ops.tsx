import { useSession, useSessionContext, useSupabaseClient } from "@supabase/auth-helpers-react";
import { generateAnomalyProperties } from "./constants";

export function useDatabaseOperations() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const fetchAnomalies = async () => {
    try {
      const { data, error } = await supabase.from("anomalies").select("*")
      console.log("Fetching anomalies viewport - raw data count:", data?.length)

      if (!error && data) {
        const processedAnomalies = data.map(generateAnomalyProperties)
        console.log("Processed anomalies count:", processedAnomalies.length)
        console.log("Sample processed anomaly:", processedAnomalies[0])
        return processedAnomalies        
      }
    } catch (error) {
      console.error("Error fetching anomalies:", error)
    }
    return []
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