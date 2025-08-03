import { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export function useSatelliteManagement() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [activeSatelliteMessage, setActiveSatelliteMessage] = useState<string | null>(null);

  const handleSendSatellite = async (classificationId: number) => {
    if (!session) return;
    
    const userId = session.user.id;

    // Step 1: Get random cloud anomaly
    const { data: cloudAnomalies, error } = await supabase
      .from("anomalies")
      .select("id")
      .eq("anomalytype", "cloud");

    if (error || !cloudAnomalies || cloudAnomalies.length === 0) return;

    const randomIndex = Math.floor(Math.random() * cloudAnomalies.length);
    const selectedAnomaly = cloudAnomalies[randomIndex];

    const insertPayload = [
      {
        author: userId,
        anomaly_id: selectedAnomaly.id,
        classification_id: classificationId,
        automaton: "WeatherSatellite",
      },
      {
        author: userId,
        anomaly_id: selectedAnomaly.id,
        classification_id: classificationId,
        automaton: "WeatherSatellite",
      },
    ];

    await supabase.from("linked_anomalies").insert(insertPayload);
  };

  const checkActiveSatellite = async () => {
    if (!session) return;
    
    const userId = session.user.id;
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysSinceSunday = dayOfWeek;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysSinceSunday);
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: existingLinks } = await supabase
      .from("linked_anomalies")
      .select("classification_id, anomaly:anomaly_id(content)")
      .eq("author", userId)
      .eq("automaton", "WeatherSatellite")
      .gte("date", startOfWeek.toISOString());

    if (existingLinks && existingLinks.length > 0) {
      const anomaly = Array.isArray(existingLinks[0].anomaly) ? existingLinks[0].anomaly[0] : existingLinks[0].anomaly;
      const planetName = anomaly?.content ?? "a planet";
      setActiveSatelliteMessage(`Your satellite is currently exploring the planet ${planetName}`);
    }
  };

  useEffect(() => {
    if (session) {
      checkActiveSatellite();
    }
  }, [session]);

  return {
    activeSatelliteMessage,
    handleSendSatellite,
    checkActiveSatellite,
  };
}
