import React, { useEffect } from "react";
import { useState, useMemo } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import PlanetMission from "./PlanetMission";
import WeatherMission from "./WeatherMission";

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

  const session = useSession();
  const supabase = useSupabaseClient();
  const [inputs, setInputs] = useState<{ [key: number]: string }>({});
  const [planetStats, setPlanetStats] = useState<{
    mass: number;
    radius: number;
    density: number;
    temp: number;
    type: string;
  } | null>(null);
  const [creatingClassification, setCreatingClassification] = useState(false);
  const [stellar, setStellar] = useState<{
    radius: number;
    mass: number;
    temp: number;
  } | null>(null);

  // --- Accurate constants and functions for planet calculations ---
  const SOLAR_RADIUS_IN_EARTH_RADII = 109.2;
  const EARTH_DENSITY = 5.51;

  function calculateSemiMajorAxisAU(
    periodDays: number,
    stellarMass: number // in M☉
  ): number {
    const periodYears = periodDays / 365.25;
    return Math.cbrt(periodYears ** 2 * stellarMass);
  }

  function calculatePlanetRadius(
    fluxPPM: number,
    stellarRadius: number // in R☉
  ): number {
    const transitDepth = fluxPPM / 1_000_000;
    return (
      stellarRadius * Math.sqrt(transitDepth) * SOLAR_RADIUS_IN_EARTH_RADII
    );
  }

  function calculatePlanetTemperature(
    stellarTemp: number,
    stellarRadius: number, // in R☉
    semiMajorAxisAU: number
  ): number {
    return stellarTemp * Math.sqrt(stellarRadius / (2 * semiMajorAxisAU));
  }

  function estimatePlanetMass(planetRadius: number): number {
    return planetRadius < 4
      ? 2.69 * Math.pow(planetRadius, 0.93)
      : 1.6 * Math.pow(planetRadius, 1.5);
  }

  function calculatePlanetDensity(
    planetMass: number,
    planetRadius: number
  ): number {
    return EARTH_DENSITY * (planetMass / Math.pow(planetRadius, 3));
  }

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
        try {
          config = JSON.parse(config);
        } catch {
          config = {};
        }
      }
      let mass = config.stellar_mass;
      // If mass is null, undefined, not a number, or not an int, set default to 1.2
      if (
        mass === null ||
        mass === undefined ||
        isNaN(Number(mass)) ||
        !Number.isFinite(Number(mass))
      ) {
        mass = 1.2;
      }
      setStellar({
        temp: config.stellar_temperature ?? null,
        radius: config.stellar_radius ?? null,
        mass: Number(mass),
      });
    }
    fetchStellarFromAnomaly();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [investigationType, session?.user?.id, supabase]);

  const [allWeatherSatEntries, setAllWeatherSatEntries] = useState<any[]>([]);
  const [deploymentCount, setDeploymentCount] = useState<number | null>(null);
  const [anomalyClassified, setAnomalyClassified] = useState<{
    [anomalyId: string]: boolean;
  }>({});
  const [classifications, setClassifications] = useState<any[]>([]);
  const [pauseIdx, setPauseIdx] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(now || new Date());
  const current = currentTime;

  // --- State for calculated weather values ---
  const [weatherProgress, setWeatherProgress] = useState({
    weatherStepIdx: 0,
    weatherStepProgress: 0,
    weatherDirection: "right" as "right" | "left",
    currentAnomaly: null as any,
    anomalyPause: false,
    waitingForNextAnomaly: false,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
        .select("*, anomaly:anomalies(id, anomalySet)")
        .eq("automaton", "WeatherSatellite")
        .eq("author", session.user.id);
      if (!allErr && allEntries) setAllWeatherSatEntries(allEntries);
      else setAllWeatherSatEntries([]);
      // Fetch all classifications for this user
      const { data: userClassifications, error: classErr } = await supabase
        .from("classifications")
        .select("id, anomaly, author, created_at")
        .eq("author", session.user.id);
      if (!classErr && userClassifications)
        setClassifications(userClassifications);
      else setClassifications([]);
    }
    fetchDeploymentData();

    // Refetch when page gains focus (user comes back from classification page)
    const handleFocus = () => {
      fetchDeploymentData();
    };
    window.addEventListener("focus", handleFocus);

    // Also poll every 5 seconds to catch updates
    const interval = setInterval(fetchDeploymentData, 5000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
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
        (c) =>
          c.anomaly?.toString() === entry.anomaly_id.toString() &&
          c.author === session?.user?.id
      );
    }
    return map;
  }, [sortedAnomalies, classifications, session?.user?.id]);

  // Calculate weather classification progress
  const weatherProgress_count = useMemo(() => {
    if (investigationType !== "weather") return { classified: 0, total: 0 };
    
    const classified = Object.values(anomalyClassifiedMap).filter(Boolean).length;
    const total = sortedAnomalies.length;
    
    return { classified, total };
  }, [investigationType, anomalyClassifiedMap, sortedAnomalies]);

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
      description:
        "Find the period by looking at the dips you annotated in the first card.",
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

  // Bounce logic: after reaching step 2, bounce between 1 and 2 N times
  const weatherBounceCount = 4; // number of bounces (forward+back = 1 bounce)
  const weatherBounceDuration = 10 * 60 * 1000; // 10 minutes per segment

  // NEW, SIMPLIFIED LOGIC FOR WEATHER ANOMALY AVAILABILITY
  useEffect(() => {
    if (investigationType !== "weather") return;

    console.log("=== WEATHER SATELLITE DEBUG ===");
    console.log("Sorted anomalies:", sortedAnomalies);
    console.log("Anomaly classified map:", anomalyClassifiedMap);
    console.log("Classifications:", classifications);

    const ONE_HOUR_MS = 60 * 60 * 1000;
    const elapsedMs = Math.max(0, currentTime.getTime() - deploy.getTime());

    // Find the first unclassified anomaly
    const nextAnomaly = sortedAnomalies.find(
      (anomaly) => !anomalyClassifiedMap[anomaly.anomaly_id]
    );

    console.log("Next unclassified anomaly:", nextAnomaly);
    console.log("Elapsed ms:", elapsedMs, "Need:", ONE_HOUR_MS);

    if (!nextAnomaly) {
      // All anomalies are classified, or there are no anomalies
      setWeatherProgress({
        weatherStepIdx: 1,
        weatherStepProgress: 1,
        weatherDirection: "right",
        currentAnomaly: null,
        anomalyPause: false,
        waitingForNextAnomaly: true, // Show scanning for next event
      });
      setTimeRemaining(null);
      return;
    }

    // Check if enough time has passed for the *first* anomaly
    const isReadyForClassification = elapsedMs >= ONE_HOUR_MS;

    if (isReadyForClassification) {
      // Time is up, ready to classify
      setWeatherProgress({
        weatherStepIdx: 2, // Move to the "Finish scanning" step
        weatherStepProgress: 1,
        weatherDirection: "right",
        currentAnomaly: nextAnomaly,
        anomalyPause: true, // This should show the classification button
        waitingForNextAnomaly: false,
      });
      setTimeRemaining(null);
    } else {
      // Still waiting for the 1-hour mark
      const remainingMs = ONE_HOUR_MS - elapsedMs;
      setTimeRemaining(remainingMs);
      setWeatherProgress({
        weatherStepIdx: 1, // Stay on "Commence scanning"
        weatherStepProgress: elapsedMs / ONE_HOUR_MS, // Show progress towards 1 hour
        weatherDirection: "right",
        currentAnomaly: nextAnomaly,
        anomalyPause: false,
        waitingForNextAnomaly: true, // Show "scanning" message
      });
    }
  }, [
    currentTime,
    deploy,
    investigationType,
    sortedAnomalies,
    anomalyClassifiedMap,
  ]);

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
      label: weatherProgress.waitingForNextAnomaly
        ? "Scanning for next event"
        : "Finish scanning, cloud or storm identified",
      description: weatherProgress.waitingForNextAnomaly
        ? `Scanning for the next weather event is underway. Time remaining: ${
            timeRemaining
              ? `${Math.floor(timeRemaining / 60000)}m ${Math.floor(
                  (timeRemaining % 60000) / 1000
                )}s`
              : "..."
          }`
        : `Identified: ${
            weatherProgress.currentAnomaly?.anomaly?.anomalySet ?? "Cloud or storm"
          }`,
      time: 20 * 60 * 1000,
    },
  ];

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
    const nextStepTime =
      steps[Math.min(clampedStepIdx + 1, steps.length - 1)].time;
    const prevStepTime = steps[clampedStepIdx].time;
    stepProgress =
      nextStepTime > prevStepTime
        ? (clampedElapsed - prevStepTime) / (nextStepTime - prevStepTime)
        : 1;
  } else {
    steps = weatherSteps;
    const initialDuration = weatherSteps[2].time; // 20 min
    const bounceSegments = weatherBounceCount * 2;
    totalDuration = initialDuration + bounceSegments * weatherBounceDuration;
    elapsed = Math.max(0, currentTime.getTime() - deploy.getTime());
    currentStepIdx = weatherProgress.weatherStepIdx;
    clampedElapsed = Math.min(elapsed, totalDuration);
    clampedStepIdx = weatherProgress.weatherStepIdx;
    stepProgress = weatherProgress.weatherStepProgress;
  }

  // Convert height/width to numbers for calculations (default fallback)
  const pxHeight = typeof height === "number" ? height : 16;
  const pxWidth = typeof width === "number" ? width : 180;
  // For vertical layout, swap width/height logic
  const isVertical = isMobile;
  const stepCount = steps.length;
  const barStart = (pxHeight * 1.2) / 2;
  const barEnd = isVertical
    ? pxHeight - (pxHeight * 1.2) / 2 + (stepCount - 1) * 120
    : pxWidth - (pxHeight * 1.2) / 2;
  const segmentLength = (barEnd - barStart) / (stepCount - 1);
  // Clamp satellite position so it never goes past the end of the bar
  let satProgress = clampedStepIdx + stepProgress;
  if (satProgress > steps.length - 1) satProgress = steps.length - 1;
  const satPos = barStart + segmentLength * satProgress;
  const satSize = isVertical ? 40 : 48;
  const hideCards = false;

  const isWeatherScanning =
    investigationType === "weather" && clampedStepIdx % 2 === 1;

  const handleCalculate = async () => {
    if (creatingClassification) return;

    setCreatingClassification(true);
    // Existing handleCalculate logic...
    const orbitalPeriod = parseFloat(inputs[2]);
    const transitDepth = parseFloat(inputs[3]);

    if (isNaN(orbitalPeriod) || isNaN(transitDepth)) {
      alert("Please enter valid numbers for orbital period and transit depth.");
      setCreatingClassification(false);
      return;
    }

    if (!stellar) {
      alert("Stellar data is not available.");
      setCreatingClassification(false);
      return;
    }

    const stellarRadius = stellar.radius; // in solar radii
    const stellarMass = stellar.mass; // in solar masses
    const stellarTemp = stellar.temp; // in Kelvin

    // Radius of the planet in Earth radii
    const planetRadius = stellarRadius * 109.2 * Math.sqrt(transitDepth);

    // Semi-major axis in AU
    const semiMajorAxis = Math.pow(
      (stellarMass * orbitalPeriod * orbitalPeriod) / 365.25 / 365.25,
      1 / 3
    );

    // Planet temperature in Kelvin
    const planetTemp =
      stellarTemp *
      Math.sqrt((stellarRadius * 696340) / (2 * semiMajorAxis * 1.496e11));

    // Mass of the planet in Earth masses (using a simplified mass-radius relation)
    let planetMass;
    if (planetRadius < 1.5) {
      // For rocky planets
      planetMass = Math.pow(planetRadius, 1.0 / 0.56);
    } else {
      // For gaseous planets
      planetMass = Math.pow(10, -0.25 + 0.64 * Math.log10(planetRadius));
    }

    const planetDensity = calculatePlanetDensity(planetMass, planetRadius);

    const planetType =
      planetDensity > 3
        ? "Terrestrial"
        : planetRadius > 10
        ? "Gas Giant"
        : "Super-Earth";

    setPlanetStats({
      mass: planetMass,
      radius: planetRadius,
      density: planetDensity,
      temp: planetTemp,
      type: planetType,
    });

    // Create a new classification in the database
    const { data, error } = await supabase
      .from("classifications")
      .insert([
        {
          author: session?.user?.id,
          classification_type: "planet-discovery",
          anomaly: classification?.id,
          metadata: {
            planet_mass: planetMass,
            planet_radius: planetRadius,
            planet_density: planetDensity,
            planet_temp: planetTemp,
            planet_type: planetType,
            orbital_period: orbitalPeriod,
            transit_depth: transitDepth,
          },
        },
      ])
      .select();

    if (error) {
      console.error("Error creating classification:", error);
      alert("Failed to save your findings. Please try again.");
    } else {
      console.log("Classification created:", data);
      // Maybe show a success message to the user
    }

    setCreatingClassification(false);
  };

  if (investigationType === "planet") {
    return (
      <PlanetMission
        isVertical={isMobile}
        steps={steps}
        clampedStepIdx={clampedStepIdx}
        currentStepIdx={currentStepIdx}
        stepProgress={stepProgress}
        pxHeight={pxHeight}
        pxWidth={pxWidth}
        satPos={satPos}
        satSize={satSize}
        hideCards={hideCards}
        inputs={inputs}
        handleCalculate={handleCalculate}
        planetStats={planetStats}
        creatingClassification={creatingClassification}
        barStart={barStart}
        barEnd={barEnd}
        segmentLength={segmentLength}
        firstImage={firstImage}
        stellar={stellar}
        elapsed={elapsed}
        width={width}
        handleInputChange={(idx: number, value: string) => {
          setInputs((prev) => ({ ...prev, [idx]: value }));
        }}
      />
    );
  }

  return (
    <WeatherMission
      isVertical={isMobile}
      steps={steps}
      clampedStepIdx={clampedStepIdx}
      currentStepIdx={currentStepIdx}
      stepProgress={stepProgress}
      pxHeight={pxHeight}
      pxWidth={pxWidth}
      satPos={satPos}
      satSize={satSize}
      hideCards={hideCards}
      barStart={barStart}
      barEnd={barEnd}
      segmentLength={segmentLength}
      isWeatherScanning={isWeatherScanning}
      weatherDirection={weatherProgress.weatherDirection}
      anomalyPause={weatherProgress.anomalyPause}
      currentAnomaly={weatherProgress.currentAnomaly}
      width={width}
      classifiedCount={weatherProgress_count.classified}
      totalAnomalies={weatherProgress_count.total}
    />
  );
}
