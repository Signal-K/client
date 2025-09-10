import React, { useEffect, useMemo, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { SharedSatelliteProps, WeatherAnomalyEntry } from "./types"
import useSatelliteProgressShared from "./useSatelliteProgressShared";

export default function WeatherSatelliteProgressBar(props: SharedSatelliteProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const {
    isMobile,
    height,
    width,
    deployTime,
    now,
    isRoot,
    hideCards,
    satSize,
    barStart,
    barEnd,
    segmentLength,
  } = useSatelliteProgressShared(props);

  const deploy = typeof deployTime === "string" ? new Date(deployTime) : deployTime;
  const current = now || new Date();

  const [allWeatherSatEntries, setAllWeatherSatEntries] = useState<any[]>([]);
  const [classifications, setClassifications] = useState<any[]>([]);
  const [anomalyClassified, setAnomalyClassified] = useState<{ [anomalyId: string]: boolean }>({});

  function getAESTWeekStart(date: Date) {
    const utc = new Date(date.getTime() + 10 * 60 * 60 * 1000);
    const day = utc.getUTCDay();
    const diff = utc.getUTCDate() - day;
    const weekStart = new Date(utc);
    weekStart.setUTCDate(diff);
    weekStart.setUTCHours(0, 1, 0, 0);
    return new Date(weekStart.getTime() - 10 * 60 * 60 * 1000);
  }

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.id) return;
      const weekStart = getAESTWeekStart(new Date());

      const { data: allEntries } = await supabase
        .from("linked_anomalies")
        .select("*")
        .eq("automaton", "WeatherSatellite")
        .eq("author", session.user.id);

      const { data: userClassifications } = await supabase
        .from("classifications")
        .select("id, anomaly, author, created_at")
        .eq("author", session.user.id);

      setAllWeatherSatEntries(allEntries || []);
      setClassifications(userClassifications || []);
    }
    fetchData();
  }, [session, supabase]);

  const sortedAnomalies = useMemo(() => {
    return allWeatherSatEntries
      .filter((entry) => entry.anomaly_id)
      .sort((a, b) => a.anomaly_id - b.anomaly_id);
  }, [allWeatherSatEntries]);

  const anomalyClassifiedMap = useMemo(() => {
    const map: { [anomalyId: string]: boolean } = {};
    for (const entry of sortedAnomalies) {
      map[entry.anomaly_id] = classifications.some(
        (c) =>
          c.anomaly?.toString() === entry.anomaly_id.toString() &&
          c.author === session?.user?.id
      );
    }
    return map;
  }, [sortedAnomalies, classifications, session?.user?.id]);

  const weatherSteps = [
    {
      label: "Deploy satellite to chosen planet",
      description: "Satellite deployed and in transit.",
      time: 0,
    },
    {
      label: "Commence scanning",
      description: "Scanning for clouds and storms",
      time: 10 * 60 * 1000,
    },
    {
      label: "Finish scanning, cloud or storm identified",
      description: "Cloud or storm identified",
      time: 20 * 60 * 1000,
    },
  ];

  const weatherBounceCount = 4;
  const weatherBounceDuration = 10 * 60 * 1000;
  const initialDuration = weatherSteps[2].time;
  const bounceSegments = weatherBounceCount * 2;
  const totalWeatherDuration = initialDuration + bounceSegments * weatherBounceDuration;

  let weatherStepIdx = 0;
  let weatherStepProgress = 0;
  let weatherDirection: "right" | "left" = "right";
  let currentAnomalyIdx = 0;
  let currentAnomaly = sortedAnomalies[0];
  let anomalyPause = false;

  const elapsedMs = Math.max(0, current.getTime() - deploy.getTime());

  if (sortedAnomalies.length > 0) {
    let anomalyIdx = 0;
    let anomalyStartTime = 0;
    let anomalyEndTime = initialDuration;

    for (let i = 0; i < sortedAnomalies.length; i++) {
      if (i === 0) {
        anomalyStartTime = 0;
        anomalyEndTime = initialDuration;
      } else {
        const prevAnomaly = sortedAnomalies[i - 1];
        const prevClass = classifications
          .filter(
            (c) =>
              c.anomaly?.toString() === prevAnomaly.anomaly_id.toString() &&
              c.author === session?.user?.id
          )
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];
        if (prevClass) {
          anomalyStartTime = new Date(prevClass.created_at).getTime();
          anomalyEndTime = anomalyStartTime + weatherBounceDuration * 2;
        } else {
          continue;
        }
      }

      if (
        (i === 0 && elapsedMs < initialDuration) ||
        (i > 0 &&
          current.getTime() >= anomalyStartTime &&
          current.getTime() < anomalyEndTime)
      ) {
        anomalyIdx = i;
        break;
      }
    }

    currentAnomalyIdx = anomalyIdx;
    currentAnomaly = sortedAnomalies[anomalyIdx];

    const classified = anomalyClassifiedMap[currentAnomaly.anomaly_id];
    if (!classified) {
      weatherStepIdx = 2;
      weatherStepProgress = 1;
      weatherDirection = "right";
      anomalyPause = true;
    } else {
      const thisClass = classifications
        .filter(
          (c) =>
            c.anomaly?.toString() === currentAnomaly.anomaly_id.toString() &&
            c.author === session?.user?.id
        )
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
      if (thisClass) {
        const sinceClass =
          current.getTime() - new Date(thisClass.created_at).getTime();
        const bounceIdx = Math.floor(sinceClass / weatherBounceDuration);
        const bounceProgress =
          (sinceClass % weatherBounceDuration) / weatherBounceDuration;
        if (bounceIdx % 2 === 0) {
          weatherStepIdx = 2;
          weatherStepProgress = 1 - bounceProgress;
          weatherDirection = "left";
        } else {
          weatherStepIdx = 1;
          weatherStepProgress = bounceProgress;
          weatherDirection = "right";
        }
        if (bounceIdx >= bounceSegments) {
          weatherStepIdx = 2;
          weatherStepProgress = 1;
          weatherDirection = "right";
        }
      }
    }
  }

  const clampedStepIdx = weatherStepIdx;
  const clampedElapsed = Math.min(elapsedMs, totalWeatherDuration);
  const stepProgress = weatherStepProgress;
  const satProgress = Math.min(clampedStepIdx + stepProgress, weatherSteps.length - 1);
  const satPos = barStart + segmentLength * satProgress;

  return (
    <div style={{ width, height }}>
      {/* Core rendering left out for brevity */}
      {/* Render weatherSteps, satellite SVG, bouncing animation, etc. */}
      {/* You can reuse the exact visual layout from the original component */}
      Weather Progress Bar here (TODO: render cards and visuals)
    </div>
  );
}