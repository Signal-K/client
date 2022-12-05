import React, { useEffect } from "react";
import { useState, useMemo } from "react";
import WeatherSatelliteMissionType from "./WeatherSatelliteMissionType";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

interface SatelliteProgressBarProps {
  deployTime: Date | string;
  now?: Date;
  height?: number | string;
  width?: number | string;
  investigationType?: "planet" | "weather";
  classification?: {
    id?: number | string;
    media?: any;
  };
  classificationId?: number | string;

  style?: React.CSSProperties;
  parentWidth?: number;
}

export default function SatelliteProgressBar(props: SatelliteProgressBarProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [hideCards, setHideCards] = React.useState(false);
  const [isRoot, setIsRoot] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setHideCards(window.location.pathname === "/");
      setIsRoot(window.location.pathname === "/");
    }
  }, []);
  // Use much smaller defaults for compact display in small sections
  const {
    deployTime,
    now,
    height = props.height ?? 16,
    width = props.width ?? 180,
    investigationType = "planet",
    classification,
    parentWidth,
    // Optionally pass in missionType and segment externally if needed
    // missionType,
    // segment,
  } = props;

  // Responsive: vertical layout for mobile
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 700);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  // Parse times
  const deploy =
    typeof deployTime === "string" ? new Date(deployTime) : deployTime;
  const current = now || new Date();

  // Timeline steps for planet investigation
  // Find first image in media array from the classification referenced by linked_anomalies.classification_id
  const [firstImage, setFirstImage] = useState<string | undefined>(undefined);
  useEffect(() => {
    async function fetchFirstImage() {
      if (investigationType !== "planet" || !session?.user?.id) return;
      // Get the latest linked_anomalies for this user
      const { data: linked, error: linkedErr } = await supabase
        .from("linked_anomalies")
        .select("classification_id")
        .eq("author", session.user.id)
        .order("date", { ascending: false });
      if (linkedErr || !linked || linked.length === 0) return;
      const classificationId = linked[0].classification_id;
      if (!classificationId) return;
      // Fetch the classification
      const { data: classData, error: classErr } = await supabase
        .from("classifications")
        .select("media")
        .eq("id", classificationId)
        .single();
      if (classErr || !classData || !classData.media) return;
      // Find first image in media array (anywhere)
      let foundImage: string | undefined = undefined;
      if (Array.isArray(classData.media)) {
        for (const arr of classData.media) {
          if (Array.isArray(arr)) {
            for (const url of arr) {
              if (typeof url === "string" && url.startsWith("http")) {
                foundImage = url;
                break;
              }
            }
          } else if (typeof arr === "string" && arr.startsWith("http")) {
            foundImage = arr;
            break;
          }
          if (foundImage) break;
        }
      }
      setFirstImage(foundImage);
    }
    fetchFirstImage();
    // Only run on mount or when investigationType/session changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investigationType, session?.user?.id]);

  const [allWeatherSatEntries, setAllWeatherSatEntries] = useState<any[]>([]);
  const [deploymentCount, setDeploymentCount] = useState<number | null>(null);
  const [anomalyClassified, setAnomalyClassified] = useState<{ [anomalyId: string]: boolean }>({});
  const [classifications, setClassifications] = useState<any[]>([]);
  const [pauseIdx, setPauseIdx] = useState<number | null>(null);

  function getAESTWeekStart(date: Date) {
    // Convert to AEST (UTC+10)
    const utc = new Date(date.getTime() + 10 * 60 * 60 * 1000);
    const day = utc.getUTCDay();
    const diff = utc.getUTCDate() - day;
    const weekStart = new Date(utc);
    weekStart.setUTCDate(diff);
    weekStart.setUTCHours(0, 1, 0, 0); // 00:01 AEST
    // Convert back to local time
    return new Date(weekStart.getTime() - 10 * 60 * 60 * 1000);
  }

  useEffect(() => {
    async function fetchDeploymentData() {
      if (!session?.user?.id) return;
      const weekStart = getAESTWeekStart(new Date());
      // Count for this week
      const { count, error } = await supabase
        .from("linked_anomalies")
        .select("id", { count: "exact", head: true })
        .eq("automaton", "WeatherSatellite")
        .eq("author", session.user.id)
        .gte("date", weekStart.toISOString());
      if (!error) setDeploymentCount(count ?? 0);
      else setDeploymentCount(null);
      // All entries (ignore time)
      const { data: allEntries, error: allErr } = await supabase
        .from("linked_anomalies")
        .select("*")
        .eq("automaton", "WeatherSatellite")
        .eq("author", session.user.id);
      if (!allErr && allEntries) setAllWeatherSatEntries(allEntries);
      else setAllWeatherSatEntries([]);
      // Fetch all classifications for this user
      const { data: userClassifications, error: classErr } = await supabase
        .from("classifications")
        .select("id, anomaly, author, created_at")
        .eq("author", session.user.id);
      if (!classErr && userClassifications) setClassifications(userClassifications);
      else setClassifications([]);
    }
    fetchDeploymentData();
  }, [session, supabase]);

  // Memo: sorted anomalies (ascending by anomaly_id)
  const sortedAnomalies = useMemo(() => {
    return allWeatherSatEntries
      .filter((entry) => entry.anomaly_id)
      .sort((a, b) => a.anomaly_id - b.anomaly_id);
  }, [allWeatherSatEntries]);

  // Memo: anomaly classification status
  const anomalyClassifiedMap = useMemo(() => {
    const map: { [anomalyId: string]: boolean } = {};
    for (const entry of sortedAnomalies) {
      map[entry.anomaly_id] = classifications.some(
        (c) => c.anomaly?.toString() === entry.anomaly_id.toString() && c.author === session?.user?.id
      );
    }
    return map;
  }, [sortedAnomalies, classifications, session?.user?.id]);

  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Steps for planet and weather missions
  const planetSteps = [
    {
      label: "Identify orbital period of your planet",
      description: "Satellite deployed and in transit.",
      time: 0,
      card: firstImage
        ? { image: firstImage, title: "Deployment Image" }
        : undefined,
    },
    {
      label: "Identify stellar temperature & radius",
      description: "Finding star’s temperature and radius",
      time: 10 * 60 * 1000,
    },
    {
      label: "Input orbital period",
      // Updated description to inform user to look at dips in the first card
      description: "Find the period by looking at the dips you annotated in the first card.",
      time: 20 * 60 * 1000,
    },
    {
      label: "Identify flux differential of planet",
      description: "Calculating flux differential",
      time: 30 * 60 * 1000,
    },
    {
      label: "Planet stats identified",
      description: "Planet stats revealed, ready to publish",
      time: 40 * 60 * 1000,
    },
  ];
  // For weather: exactly 3 cards, satellite bounces between 2 and 3
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

  // Bounce logic: after reaching step 2, bounce between 1 and 2 N times
  const weatherBounceCount = 4; // number of bounces (forward+back = 1 bounce)
  const weatherBounceDuration = 10 * 60 * 1000; // 10 minutes per segment
  // Calculate total duration: initial (0->1->2), then bounce (2->1->2->1...)
  const initialDuration = weatherSteps[2].time; // 20 min
  const bounceSegments = weatherBounceCount * 2; // e.g. 4 bounces = 8 segments
  const totalWeatherDuration = initialDuration + bounceSegments * weatherBounceDuration;

  // Calculate satellite position and direction for weather
  let weatherStepIdx = 0;
  let weatherStepProgress = 0;
  let weatherDirection: "right" | "left" = "right";
  let currentAnomalyIdx = 0;
  let currentAnomaly = sortedAnomalies[0];
  let anomalyPause = false;
  let anomalyPauseTime = null;
  let anomalyPauseStart = null;
  let anomalyPauseDuration = weatherBounceDuration; // 10 min
  if (investigationType === "weather" && sortedAnomalies.length > 0) {
    // Find which anomaly we are on (based on time/classification)
    const elapsedMs = Math.max(0, current.getTime() - deploy.getTime());
    let anomalyIdx = 0;
    let anomalyStartTime = 0;
    let anomalyEndTime = initialDuration;
    let anomalyClassifiedAt: Date | null = null;
    for (let i = 0; i < sortedAnomalies.length; i++) {
      // For each anomaly, after initial, time is based on classification
      if (i === 0) {
        anomalyStartTime = 0;
        anomalyEndTime = initialDuration;
        anomalyClassifiedAt = null;
      } else {
        // For subsequent anomalies, time is based on classification of previous
        const prevAnomaly = sortedAnomalies[i - 1];
        // Find classification for prevAnomaly
        const prevClass = classifications
          .filter((c) => c.anomaly?.toString() === prevAnomaly.anomaly_id.toString() && c.author === session?.user?.id)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        if (prevClass) {
          anomalyStartTime = new Date(prevClass.created_at).getTime();
          anomalyEndTime = anomalyStartTime + weatherBounceDuration * 2;
        } else {
          // If no classification, skip this anomaly (not active yet)
          continue;
        }
        anomalyClassifiedAt = null;
      }
      // If current time is within this anomaly's window, use it
      if (
        (i === 0 && elapsedMs < initialDuration) ||
        (i > 0 && current.getTime() >= anomalyStartTime && current.getTime() < anomalyEndTime)
      ) {
        anomalyIdx = i;
        break;
      }
    }
    currentAnomalyIdx = anomalyIdx;
    currentAnomaly = sortedAnomalies[anomalyIdx];
    // Now, determine if we are paused at the third card for this anomaly
    // If not classified, pause at third card
    const classified = anomalyClassifiedMap[currentAnomaly.anomaly_id];
    if (!classified) {
      weatherStepIdx = 2;
      weatherStepProgress = 1;
      weatherDirection = "right";
      anomalyPause = true;
    } else {
      // After classification, start timer for next anomaly
      // Find classification for this anomaly
      const thisClass = classifications
        .filter((c) => c.anomaly?.toString() === currentAnomaly.anomaly_id.toString() && c.author === session?.user?.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      if (thisClass) {
        const sinceClass = current.getTime() - new Date(thisClass.created_at).getTime();
        // Bounce logic: 2->1 (left), 1->2 (right), each 10 min
        const bounceElapsed = sinceClass;
        const bounceIdx = Math.floor(bounceElapsed / weatherBounceDuration);
        const bounceProgress = (bounceElapsed % weatherBounceDuration) / weatherBounceDuration;
        if (bounceIdx % 2 === 0) {
          // 2 -> 1
          weatherStepIdx = 2;
          weatherStepProgress = 1 - bounceProgress;
          weatherDirection = "left";
        } else {
          // 1 -> 2
          weatherStepIdx = 1;
          weatherStepProgress = bounceProgress;
          weatherDirection = "right";
        }
        // Clamp to end if finished all bounces
        if (bounceIdx >= bounceSegments) {
          weatherStepIdx = 2;
          weatherStepProgress = 1;
          weatherDirection = "right";
        }
      }
    }
  }

  // For planet, use original logic
  let steps;
  let totalDuration;
  let elapsed;
  let currentStepIdx;
  let clampedElapsed;
  let clampedStepIdx;
  let stepProgress;
  if (investigationType === "planet") {
    steps = planetSteps;
    totalDuration = steps.length > 1 ? steps[steps.length - 1].time : 1;
    elapsed = Math.max(0, current.getTime() - deploy.getTime());
    currentStepIdx = 0;
    for (let i = 0; i < steps.length; i++) {
      if (elapsed >= steps[i].time) currentStepIdx = i;
    }
    clampedElapsed = Math.min(elapsed, totalDuration);
    clampedStepIdx = 0;
    for (let i = 0; i < steps.length; i++) {
      if (clampedElapsed >= steps[i].time) clampedStepIdx = i;
    }
    const nextStepTime = steps[Math.min(clampedStepIdx + 1, steps.length - 1)].time;
    const prevStepTime = steps[clampedStepIdx].time;
    stepProgress = nextStepTime > prevStepTime
      ? (clampedElapsed - prevStepTime) / (nextStepTime - prevStepTime)
      : 1;
  } else {
    steps = weatherSteps;
    totalDuration = totalWeatherDuration;
    elapsed = Math.max(0, current.getTime() - deploy.getTime());
    currentStepIdx = weatherStepIdx;
    clampedElapsed = Math.min(elapsed, totalDuration);
    clampedStepIdx = weatherStepIdx;
    stepProgress = weatherStepProgress;
  }


  // Convert height/width to numbers for calculations (default fallback)
  const pxHeight = typeof height === "number" ? height : 16;
  const pxWidth = typeof width === "number" ? width : 180;
  // Satellite icon size
  const satSize = pxHeight * 1.2;
  // For vertical layout, swap width/height logic
  const isVertical = isMobile;
  const stepCount = steps.length;
  const barStart = satSize / 2;
  const barEnd = isVertical
    ? pxHeight - satSize / 2 + (stepCount - 1) * 120
    : pxWidth - satSize / 2;
  const segmentLength = (barEnd - barStart) / (stepCount - 1);
  // Clamp satellite position so it never goes past the end of the bar
  let satProgress = clampedStepIdx + stepProgress;
  if (satProgress > steps.length - 1) satProgress = steps.length - 1;
  const satPos = barStart + segmentLength * satProgress;

  // Inputs and random values
  const [inputs, setInputs] = React.useState<{ [key: number]: string }>({});
  // Stellar and flux values
  const [stellar, setStellar] = React.useState<{ temp: number | null; radius: number | null; mass?: number | null } | null>(null);
  const [flux, setFlux] = React.useState<number | null>(null);

  // Fetch stellar values from anomalyConfiguration if available
  useEffect(() => {
    async function fetchStellarFromAnomaly() {
      if (investigationType !== "planet" || !session?.user?.id) return;
      // Get the latest linked_anomalies for this user
      const { data: linked, error: linkedErr } = await supabase
        .from("linked_anomalies")
        .select("anomaly_id")
        .eq("author", session.user.id)
        .order("date", { ascending: false });
      if (linkedErr || !linked || linked.length === 0) {
        setStellar(null);
        return;
      }
      const anomalyId = linked[0].anomaly_id;
      if (!anomalyId) {
        setStellar(null);
        return;
      }
      // Fetch anomalyConfiguration from anomalies
      const { data: anomaly, error: anomalyErr } = await supabase
        .from("anomalies")
        .select("anomalyConfiguration")
        .eq("id", anomalyId)
        .single();
      if (anomalyErr || !anomaly || !anomaly.anomalyConfiguration) {
        setStellar(null);
        return;
      }
      let config = anomaly.anomalyConfiguration;
      // If config is a string, parse it
      if (typeof config === "string") {
        try { config = JSON.parse(config); } catch { config = {}; }
      }
      setStellar({
        temp: config.stellar_temperature ?? null,
        radius: config.stellar_radius ?? null,
      });
    }
    fetchStellarFromAnomaly();
  }, [investigationType, session?.user?.id, supabase]);
  // User result for planet stats
  const [planetStats, setPlanetStats] = React.useState<null | { mass: number; radius: number; density: number; temp: number }>(null);
  // Classification creation state
  const [creatingClassification, setCreatingClassification] = useState(false);
  const [classificationResult, setClassificationResult] = useState<string | null>(null);

  // Generate random flux value on mount (desktop only)
  useEffect(() => {
    if (investigationType === "planet") {
      setFlux(+(0.5 + Math.random() * 2.5).toFixed(2)); // 0.5-3.0
    }
  }, [investigationType]);

  // For weather mission, show scanning animation if on a scanning step
  const isWeatherScanning =
    investigationType === "weather" && clampedStepIdx % 2 === 1;

  // Only step 2 (index 1) is input, others are display
  const isStepActive = (stepIdx: number) => {
    if (investigationType !== "planet") return false;
    if (stepIdx === 2) return elapsed >= 20 * 60 * 1000;
    return false;
  };

  const handleInputChange = (idx: number, value: string) => {
    setInputs((prev) => ({ ...prev, [idx]: value }));
  };

  return (
    <div
      style={{
        width: isVertical ? "100%" : width,
        minHeight: isVertical ? "320px" : pxHeight + 320,
        height: isVertical ? "100%" : undefined,
        position: isVertical ? "relative" : "relative",
        display: isVertical ? "flex" : undefined,
        flexDirection: isVertical ? "row" : undefined,
        alignItems: isVertical ? "center" : undefined,
        justifyContent: isVertical ? "center" : undefined,
        overflow: isVertical ? "visible" : undefined,
        ...props.style,
      }}
    >
      {isVertical ? (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            position: "relative",
            zIndex: 5,
            width: "100%",
            height: "100%",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              position: "static",
              zIndex: 5,
            }}
          >
            {steps.map((step, i) => {
              // Time gating for each card (planet mission)
              if (investigationType === "planet") {
                if (i === 1 && elapsed < 10 * 60 * 1000) return null;
                if (i === 2 && elapsed < 20 * 60 * 1000) return null;
                if (i === 3 && elapsed < 30 * 60 * 1000) return null;
                if (i === 4 && elapsed < 40 * 60 * 1000) return null;
              }
              return (
                <div
                  key={i}
                  style={{
                    minWidth: 140,
                    maxWidth: 220,
                    marginBottom: 32,
                    textAlign: "right",
                    position: "relative",
                    right: 0,
                  }}
                >
                  <div
                    style={{
                      background: "#181e2a",
                      border: "1.5px solid #78cce2",
                      borderRadius: 10,
                      boxShadow: "0 2px 8px #0006",
                      padding: 12,
                      minHeight: 48,
                      maxWidth: 220,
                      marginBottom: 8,
                      marginRight: 12,
                    }}
                  >
                    <div
                      style={{
                        color: i <= currentStepIdx ? "#78cce2" : "#e4eff0",
                        fontWeight: 600,
                        fontSize: 15,
                        marginBottom: 4,
                      }}
                    >
                      {step.label}
                    </div>
                    {/* 1st card: show image from classification if available */}
                    {investigationType === "planet" && i === 0 && firstImage && (
                      <div style={{ margin: "8px 0" }}>
                        <img src={firstImage} alt="Deployment" style={{ maxWidth: 180, borderRadius: 8, border: "1.5px solid #78cce2" }} />
                      </div>
                    )}
                    {/* 2nd card: show stellar values from anomalyConfiguration if available */}
                    {investigationType === "planet" && i === 1 && (
                      <div style={{ color: "#e4eff0", fontSize: 15, margin: "8px 0" }}>
                        {stellar && (stellar.temp || stellar.radius) ? (
                          <>
                            <div>Stellar Temp: <b>{stellar.temp ? `${stellar.temp} Kelvin` : "Unknown"}</b></div>
                            <div>Stellar Radius: <b>{stellar.radius ? `${stellar.radius} Solar Radii` : "Unknown"}</b></div>
                          </>
                        ) : (
                          <>
                            <div>Stellar Temp: <b>Unknown</b></div>
                            <div>Stellar Radius: <b>Unknown</b></div>
                          </>
                        )}
                      </div>
                    )}
                    {/* 3rd card: input for orbital period */}
                    {investigationType === "planet" && i === 2 && elapsed >= 20 * 60 * 1000 && (
                      <div style={{ marginTop: 8 }}>
                        <input
                          type="number"
                          value={inputs[2] || ""}
                          onChange={e => handleInputChange(2, e.target.value)}
                          placeholder="Enter orbital period (days)"
                          style={{
                            width: "90%",
                            padding: 8,
                            borderRadius: 6,
                            border: "1.5px solid #78cce2",
                            background: "#232b3b",
                            color: "#e4eff0",
                            fontSize: 15,
                          }}
                        />
                      </div>
                    )}
                    {/* 4th card: show random flux value */}
                    {investigationType === "planet" && i === 3 && flux !== null && elapsed >= 30 * 60 * 1000 && (
                      <div style={{ color: "#e4eff0", fontSize: 15, margin: "8px 0" }}>
                        Planetary Flux: <b>{flux} S⊕</b>
                      </div>
                    )}
                    {/* 5th card: calculate and show planet stats */}
                    {investigationType === "planet" && i === 4 && elapsed >= 40 * 60 * 1000 && (
                      <div style={{ marginTop: 10, minHeight: 32, color: "#e4eff0", fontSize: 15, fontStyle: "italic", opacity: 0.9 }}>
                        {planetStats ? (
                          <>
                            <div>Mass: <b>{planetStats.mass.toFixed(2)} M⊕</b></div>
                            <div>Radius: <b>{planetStats.radius.toFixed(2)} R⊕</b></div>
                            <div>Density: <b>{planetStats.density.toFixed(2)} g/cm³</b></div>
                            <div>Temperature: <b>{planetStats.temp.toFixed(0)} K</b></div>
                          </>
                        ) : (
                          <>
                            <button
                              style={{
                                marginTop: 8,
                                padding: "6px 18px",
                                borderRadius: 6,
                                border: "1.5px solid #78cce2",
                                background: "#232b3b",
                                color: "#e4eff0",
                                fontSize: 15,
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                // Calculate planet stats using a made-up formula
                                if (!stellar || flux === null || !inputs[2]) return;
                                const period = parseFloat(inputs[2]);
                                // Example formulas (not physically accurate):
                                // Mass (M⊕): proportional to (stellar.mass * period * flux)
                                // Radius (R⊕): proportional to (stellar.radius * Math.sqrt(period))
                                // Density: mass / (radius^3) * 5.5
                                // Temp: stellar.temp * Math.pow(flux, 0.25) / 2
                                if (
                                  stellar &&
                                  typeof stellar.mass === "number" &&
                                  typeof stellar.radius === "number" &&
                                  typeof stellar.temp === "number"
                                ) {
                                  const mass = stellar.mass * period * flux / 100;
                                  const radius = stellar.radius * Math.sqrt(period) / 5;
                                  const density = mass / Math.pow(radius, 3) * 5.5;
                                  const temp = stellar.temp * Math.pow(flux, 0.25) / 2;
                                  setPlanetStats({ mass, radius, density, temp });
                                } else {
                                  // fallback: skip calculation if any value is missing
                                  setPlanetStats(null);
                                }
                              }}
                            >Calculate Planet Stats</button>
                          </>
                        )}
                      </div>
                    )}
                    {/* Default: show description if not replaced above */}
                    {((i !== 1 && i !== 2 && i !== 3 && i !== 4) || (investigationType !== "planet")) && i === currentStepIdx && (
                      <div
                        style={{
                          color: "#e4eff0",
                          fontSize: 15,
                          marginBottom: 6,
                        }}
                      >
                        {step.description}
                        {/* Always show classify button in third card for weather */}
                        {investigationType === "weather" && i === 2 && currentAnomaly && (
                          <div style={{ marginTop: 12 }}>
                            <a
                              href={`/structures/balloon/cloudspotting/db-${currentAnomaly.anomaly_id}/classify`}
                              style={{
                                display: "inline-block",
                                padding: "8px 18px",
                                background: "#78cce2",
                                color: "#181e2a",
                                borderRadius: 6,
                                fontWeight: 600,
                                fontSize: 15,
                                textDecoration: "none",
                                border: "1.5px solid #78cce2",
                                marginTop: 8,
                              }}
                            >
                              Classify This
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      right: -12,
                      top: 32,
                      width: 24,
                      height: 0,
                      borderTop: "2px solid #78cce2",
                      zIndex: 2,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div
            style={{
              position: "relative",
              width: pxHeight + 16,
              minWidth: pxHeight + 16,
              zIndex: 10,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: pxHeight / 2 - satSize / 2 + 8,
                top: satPos - satSize / 2,
                width: satSize,
                height: satSize,
                zIndex: 11,
                transition: "top 0.5s cubic-bezier(.4,1.6,.4,1)",
                pointerEvents: "none",
              }}
            >
              <svg
                width={satSize}
                height={satSize}
                viewBox="0 0 40 40"
                fill="none"
              >
                {/* Body */}
                <rect
                  x="16"
                  y="14"
                  width="8"
                  height="12"
                  rx="3"
                  fill="#78cce2"
                  stroke="#e4eff0"
                  strokeWidth="1.2"
                />
                {/* Solar panels */}
                <rect
                  x="6"
                  y="17"
                  width="8"
                  height="6"
                  rx="2"
                  fill="#232b3b"
                  stroke="#78cce2"
                  strokeWidth="1.1"
                />
                <rect
                  x="26"
                  y="17"
                  width="8"
                  height="6"
                  rx="2"
                  fill="#232b3b"
                  stroke="#78cce2"
                  strokeWidth="1.1"
                />
                {/* Antenna */}
                <rect x="19" y="8" width="2" height="8" rx="1" fill="#e4eff0" />
                <circle
                  cx="20"
                  cy="7"
                  r="2"
                  fill="#f2c572"
                  stroke="#e4eff0"
                  strokeWidth="0.8"
                />
                {/* Details */}
                <circle
                  cx="20"
                  cy="26"
                  r="2.2"
                  fill="#232b3b"
                  stroke="#e4eff0"
                  strokeWidth="0.7"
                />
              </svg>
            </div>
            <svg
              width={pxHeight}
              height={barEnd}
              style={{
                position: "relative",
                left: 8,
                top: 0,
                zIndex: 1,
                margin: "0 auto",
                display: "block",
              }}
            >
              <rect
                x={pxHeight / 2 - 4}
                y={barStart}
                width={8}
                height={barEnd - barStart}
                rx={4}
                fill="#232b3b"
              />
              <rect
                x={pxHeight / 2 - 4}
                y={barStart}
                width={8}
                height={satPos - barStart}
                rx={4}
                fill="#78cce2"
              />
              {steps.map((step, i) => (
                <circle
                  key={i}
                  cx={pxHeight / 2}
                  cy={barStart + i * segmentLength}
                  r={10}
                  fill={i <= currentStepIdx ? "#78cce2" : "#232b3b"}
                  stroke="#e4eff0"
                  strokeWidth={i === currentStepIdx ? 2.5 : 1.2}
                />
              ))}
            </svg>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              position: "static",
              zIndex: 5,
            }}
          >
            {steps.map(
              (step, i) =>
                i % 2 === 1 && (
                  <div
                    key={i}
                    style={{
                      minWidth: 140,
                      maxWidth: 220,
                      marginBottom: 32,
                      textAlign: "left",
                      position: "relative",
                      left: 0,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: -12,
                        top: 32,
                        width: 24,
                        height: 0,
                        borderTop: "2px solid #78cce2",
                        zIndex: 2,
                      }}
                    />
                    <div
                      style={{
                        background: "#181e2a",
                        border: "1.5px solid #78cce2",
                        borderRadius: 10,
                        boxShadow: "0 2px 8px #0006",
                        padding: 12,
                        minHeight: 48,
                        maxWidth: 220,
                        marginBottom: 8,
                        marginLeft: 12,
                      }}
                    >
                      <div
                        style={{
                          color: i <= currentStepIdx ? "#78cce2" : "#e4eff0",
                          fontWeight: 600,
                          fontSize: 15,
                          marginBottom: 4,
                        }}
                      >
                        {step.label}
                      </div>
                      {i === currentStepIdx && (
                        <div
                          style={{
                            color: "#e4eff0",
                            fontSize: 13,
                            marginBottom: 4,
                          }}
                        >
                          {step.description}
                        </div>
                      )}
                      {investigationType === "planet" &&
                        i >= 1 &&
                        i <= 3 &&
                        isStepActive(i) && (
                          <input
                            type="text"
                            value={inputs[i] || ""}
                            onChange={(e) =>
                              handleInputChange(i, e.target.value)
                            }
                            placeholder={`Enter value for ${step.label}`}
                            style={{
                              marginTop: 8,
                              width: "90%",
                              padding: 6,
                              borderRadius: 6,
                              border: "1.5px solid #78cce2",
                              background: "#232b3b",
                              color: "#e4eff0",
                              fontSize: 14,
                            }}
                          />
                        )}
                      {investigationType === "planet" && i === 4 && (
                        <div
                          style={{
                            marginTop: 10,
                            minHeight: 32,
                            color: "#e4eff0",
                            fontSize: 14,
                            fontStyle: "italic",
                            opacity: 0.7,
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                )
            )}
          </div>
  </div>
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            minHeight: 420,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "relative",
              width: pxWidth,
              minHeight: pxHeight + 340, // increased to allow space for above cards
              margin: "0 auto",
            }}
          >
            {/* Satellite icon above the progress bar */}
            <div
              style={{
                position: "absolute",
                left: satPos - satSize / 2,
                top: 140, // move satellite and bar down
                width: satSize,
                height: satSize,
                zIndex: 10,
                transition: "left 0.5s cubic-bezier(.4,1.6,.4,1)",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width={satSize}
                height={satSize}
                viewBox="0 0 40 40"
                fill="none"
                style={{
                  transform:
                    investigationType === "weather"
                      ? weatherDirection === "left"
                        ? "scaleX(-1)"
                        : "none"
                      : "none",
                  transition: "transform 0.4s cubic-bezier(.4,1.6,.4,1)",
                }}
              >
                <rect
                  x="16"
                  y="14"
                  width="8"
                  height="12"
                  rx="3"
                  fill="#78cce2"
                  stroke="#e4eff0"
                  strokeWidth="1.2"
                />
                <rect
                  x="6"
                  y="17"
                  width="8"
                  height="6"
                  rx="2"
                  fill="#232b3b"
                  stroke="#78cce2"
                  strokeWidth="1.1"
                />
                <rect
                  x="26"
                  y="17"
                  width="8"
                  height="6"
                  rx="2"
                  fill="#232b3b"
                  stroke="#78cce2"
                  strokeWidth="1.1"
                />
                <rect x="19" y="8" width="2" height="8" rx="1" fill="#e4eff0" />
                <circle
                  cx="20"
                  cy="7"
                  r="2"
                  fill="#f2c572"
                  stroke="#e4eff0"
                  strokeWidth="0.8"
                />
                <circle
                  cx="20"
                  cy="26"
                  r="2.2"
                  fill="#232b3b"
                  stroke="#e4eff0"
                  strokeWidth="0.7"
                />
              </svg>
              {/* Scanning animation for weather mission */}
              {isWeatherScanning && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "100%",
                    transform: "translate(-50%, 0)",
                    width: 0,
                    height: 0,
                    zIndex: 12,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    className="satellite-scan-animation"
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: "2px dashed #78cce2",
                      opacity: 0.7,
                      animation: "satellite-scan-pulse 1.2s infinite",
                    }}
                  />
                  <style>{`
                    @keyframes satellite-scan-pulse {
                      0% { transform: scale(0.7); opacity: 0.7; }
                      50% { transform: scale(1.2); opacity: 0.3; }
                      100% { transform: scale(0.7); opacity: 0.7; }
                    }
                  `}</style>
                </div>
              )}
            </div>
            {/* Progress bar */}
            <svg
              width={pxWidth}
              height={pxHeight}
              style={{
                position: "relative",
                left: 0,
                top: 140, // move bar down
                zIndex: 1,
                display: "block",
              }}
            >
              <rect
                x={barStart}
                y={pxHeight / 2 - 4}
                width={barEnd - barStart}
                height={8}
                rx={4}
                fill="#232b3b"
              />
              <rect
                x={barStart}
                y={pxHeight / 2 - 4}
                width={satPos - barStart}
                height={8}
                rx={4}
                fill="#78cce2"
              />
              {steps.map((step, i) => (
                <circle
                  key={i}
                  cx={barStart + i * segmentLength}
                  cy={pxHeight / 2}
                  r={10}
                  fill={i <= clampedStepIdx ? "#78cce2" : "#232b3b"}
                  stroke="#e4eff0"
                  strokeWidth={i === clampedStepIdx ? 2.5 : 1.2}
                />
              ))}
            </svg>
            {/* SVG connectors for all cards */}
            {!hideCards && (
              <svg
                width={pxWidth}
                height={240}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              >
                {steps.map((step, i) => {
                  // Even: below, Odd: above
                  const isAbove = i % 2 === 1;
                  const markerX = barStart + i * segmentLength;
                  const barY = 140 + pxHeight / 2; // bar center Y
                  const cardY = isAbove ? 40 : 140 + pxHeight + 100; // above: 40px, below: bar+100
                  return (
                    <line
                      key={i}
                      x1={markerX}
                      y1={barY}
                      x2={markerX}
                      y2={cardY}
                      stroke="#78cce2"
                      strokeWidth={2}
                    />
                  );
                })}
              </svg>
            )}
            {/* Cards absolutely positioned above or below the bar, alternating */}
            {!hideCards &&
              steps.map((step, i) => {
                // Alternate: even index below, odd index above
                const isAbove = i % 2 === 1;
                const cardY = isAbove ? 40 : 140 + pxHeight + 100;
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: `calc(${barStart + i * segmentLength}px - 130px)`,
                      top: cardY,
                      width: 260,
                      textAlign: "center",
                      zIndex: 3,
                      transition: "top 0.5s cubic-bezier(.4,1.6,.4,1)",
                    }}
                  >
                    <div
                      style={{
                        background: "#181e2a",
                        border: "1.5px solid #78cce2",
                        borderRadius: 10,
                        boxShadow: "0 2px 8px #0006",
                        padding: 16,
                        margin: "0 auto",
                        minHeight: 48,
                        maxWidth: 260,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          color: i <= clampedStepIdx ? "#78cce2" : "#e4eff0",
                          fontWeight: 600,
                          fontSize: 17,
                          marginBottom: 6,
                        }}
                      >
                        {step.label}
                      </div>
                      {/* 1st card: show image from classification if available (planet mode) */}
                      {investigationType === "planet" && i === 0 && firstImage && (
                        <div style={{ margin: "8px 0" }}>
                          <img src={firstImage} alt="Deployment" style={{ maxWidth: 180, borderRadius: 8, border: "1.5px solid #78cce2" }} />
                        </div>
                      )}
                      {/* 2nd card: show random stellar values */}
                      {investigationType === "planet" && i === 1 && stellar && (
                        <div style={{ color: "#e4eff0", fontSize: 15, margin: "8px 0" }}>
                          <div>Stellar Temp: <b>{stellar.temp} K</b></div>
                          <div>Stellar Radius: <b>{stellar.radius} R☉</b></div>
                          <div>Stellar Mass: <b>{stellar.mass} M☉</b></div>
                        </div>
                      )}
                      {/* 3rd card: input for orbital period */}
                      {investigationType === "planet" && i === 2 && elapsed >= 20 * 60 * 1000 && (
                        <div style={{ marginTop: 8 }}>
                          <input
                            type="number"
                            value={inputs[2] || ""}
                            onChange={e => handleInputChange(2, e.target.value)}
                            placeholder="Enter orbital period (days)"
                            style={{
                              width: "90%",
                              padding: 8,
                              borderRadius: 6,
                              border: "1.5px solid #78cce2",
                              background: "#232b3b",
                              color: "#e4eff0",
                              fontSize: 15,
                            }}
                          />
                        </div>
                      )}
                      {/* 4th card: show random flux value */}
                      {investigationType === "planet" && i === 3 && flux !== null && (
                        <div style={{ color: "#e4eff0", fontSize: 15, margin: "8px 0" }}>
                          Planetary Flux: <b>{flux} S⊕</b>
                        </div>
                      )}
                      {/* 5th card: calculate and show planet stats */}
                      {investigationType === "planet" && i === 4 && (
                        <div style={{ marginTop: 10, minHeight: 32, color: "#e4eff0", fontSize: 15, fontStyle: "italic", opacity: 0.9 }}>
                          {planetStats ? (
                            <>
                              <div>Mass: <b>{planetStats.mass.toFixed(2)} M⊕</b></div>
                              <div>Radius: <b>{planetStats.radius.toFixed(2)} R⊕</b></div>
                              <div>Density: <b>{planetStats.density.toFixed(2)} g/cm³</b></div>
                              <div>Temperature: <b>{planetStats.temp.toFixed(0)} K</b></div>
                              {/* Button to create classification and wipe linked_anomalies */}
                              <button
                                style={{
                                  marginTop: 16,
                                  padding: "8px 22px",
                                  borderRadius: 6,
                                  border: "1.5px solid #78cce2",
                                  background: creatingClassification ? "#78cce2" : "#232b3b",
                                  color: creatingClassification ? "#232b3b" : "#e4eff0",
                                  fontSize: 16,
                                  fontWeight: 600,
                                  cursor: creatingClassification ? "not-allowed" : "pointer",
                                  opacity: creatingClassification ? 0.7 : 1,
                                }}
                                disabled={creatingClassification}
                                onClick={async () => {
                                  if (!session?.user?.id) return;
                                  setCreatingClassification(true);
                                  setClassificationResult(null);
                                  try {
                                    // Find the current anomaly for this user (planet mode: use first linked_anomalies entry for this user, ignore automaton)
                                    const { data: linked, error: linkedErr } = await supabase
                                      .from("linked_anomalies")
                                      .select("*")
                                      .eq("author", session.user.id)
                                      .order("date", { ascending: false });
                                    if (linkedErr || !linked || linked.length === 0) {
                                      setClassificationResult("No linked anomaly found for this planet.");
                                      setCreatingClassification(false);
                                      return;
                                    }
                                    const anomalyId = linked[0].anomaly_id;
                                    const planetClassificationId = linked[0].classification_id;
                                    // Prepare stats as plain text
                                    const statsText = `Mass: ${planetStats.mass.toFixed(2)} M⊕\nRadius: ${planetStats.radius.toFixed(2)} R⊕\nDensity: ${planetStats.density.toFixed(2)} g/cm³\nTemperature: ${planetStats.temp.toFixed(0)} K`;
                                    // Insert new classification
                                    const { data: newClass, error: classErr } = await supabase
                                      .from("classifications")
                                      .insert([
                                        {
                                          content: statsText,
                                          anomaly: anomalyId,
                                          classificationType: "planetInspection",
                                          author: session.user.id,
                                          classificationConfiguration: {
                                            stats: planetStats,
                                            planet_classification_id: planetClassificationId,
                                          },
                                        },
                                      ])
                                      .select();
                                    if (classErr || !newClass || newClass.length === 0) {
                                      setClassificationResult("Failed to create classification.");
                                      setCreatingClassification(false);
                                      return;
                                    }
                                    // Wipe linked_anomalies for this user and automaton=WeatherSatellite
                                    const { error: wipeErr } = await supabase
                                      .from("linked_anomalies")
                                      .delete()
                                      .eq("author", session.user.id)
                                      .eq("automaton", "WeatherSatellite");
                                    if (wipeErr) {
                                      setClassificationResult("Classification created, but failed to wipe weather satellite anomalies.");
                                    } else {
                                      setClassificationResult("Classification created and weather satellite anomalies wiped.");
                                    }
                                  } catch (e) {
                                    setClassificationResult("Unexpected error: " + (e instanceof Error ? e.message : String(e)));
                                  }
                                  setCreatingClassification(false);
                                }}
                              >
                                {creatingClassification ? "Saving..." : "Save Classification & Reset Weather Satellite"}
                              </button>
                              {classificationResult && (
                                <div style={{ marginTop: 10, color: classificationResult.startsWith("Classification created") ? "#78cce2" : "#f66", fontWeight: 500 }}>
                                  {classificationResult}
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <button
                                style={{
                                  marginTop: 8,
                                  padding: "6px 18px",
                                  borderRadius: 6,
                                  border: "1.5px solid #78cce2",
                                  background: "#232b3b",
                                  color: "#e4eff0",
                                  fontSize: 15,
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  // Calculate planet stats using a made-up formula
                                  if (!stellar || flux === null || !inputs[2]) return;
                                  const period = parseFloat(inputs[2]);
                                  // Example formulas (not physically accurate):
                                  // Mass (M⊕): proportional to (stellar.mass * period * flux)
                                  // Radius (R⊕): proportional to (stellar.radius * Math.sqrt(period))
                                  // Density: mass / (radius^3) * 5.5
                                  // Temp: stellar.temp * Math.pow(flux, 0.25) / 2
                                  if (
                                    stellar &&
                                    typeof stellar.mass === "number" &&
                                    typeof stellar.radius === "number" &&
                                    typeof stellar.temp === "number"
                                  ) {
                                    const mass = stellar.mass * period * flux / 100;
                                    const radius = stellar.radius * Math.sqrt(period) / 5;
                                    const density = mass / Math.pow(radius, 3) * 5.5;
                                    const temp = stellar.temp * Math.pow(flux, 0.25) / 2;
                                    setPlanetStats({ mass, radius, density, temp });
                                  } else {
                                    setPlanetStats(null);
                                  }
                                }}
                              >Calculate Planet Stats</button>
                            </>
                          )}
                        </div>
                      )}
                      {/* Default: show description if not replaced above */}
                      {((i !== 1 && i !== 2 && i !== 3 && i !== 4) || (investigationType !== "planet")) && i === clampedStepIdx && (
                        <div
                          style={{
                            color: "#e4eff0",
                            fontSize: 15,
                            marginBottom: 6,
                          }}
                        >
                          {step.description}
                          {/* Always show classify button in third card for weather mode on desktop */}
                          {investigationType === "weather" && i === 2 && currentAnomaly && (
                            <div style={{ marginTop: 12 }}>
                              <a
                                href={`/structures/balloon/cloudspotting/db-${currentAnomaly.anomaly_id}/classify`}
                                style={{
                                  display: "inline-block",
                                  padding: "8px 18px",
                                  background: "#78cce2",
                                  color: "#181e2a",
                                  borderRadius: 6,
                                  fontWeight: 600,
                                  fontSize: 15,
                                  textDecoration: "none",
                                  border: "1.5px solid #78cce2",
                                  marginTop: 8,
                                }}
                              >
                                Classify This
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

            {/* Show segment text box below progress bar if on root route */}
            {isRoot && (
              <div
                style={{
                  marginTop: pxHeight + 220,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    background: "#232b3b",
                    border: "1.5px solid #78cce2",
                    borderRadius: 8,
                    color: "#e4eff0",
                    fontWeight: 500,
                    fontSize: 16,
                    padding: "10px 24px",
                    boxShadow: "0 2px 8px #0006",
                    marginTop: 8,
                    textAlign: "center",
                    minWidth: 180,
                    maxWidth: 400,
                  }}
                >
                  Segment:{" "}
                  <span style={{ color: "#78cce2", fontWeight: 700 }}>
                    {clampedStepIdx + 1} / {steps.length}
                  </span>{" "}
                  — <span>{steps[clampedStepIdx].label}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
