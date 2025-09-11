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
      if (!classErr && userClassifications)
        setClassifications(userClassifications);
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
        (c) =>
          c.anomaly?.toString() === entry.anomaly_id.toString() &&
          c.author === session?.user?.id
      );
    }
    return map;
  }, [sortedAnomalies, classifications, session?.user?.id]);

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
  const totalWeatherDuration =
    initialDuration + bounceSegments * weatherBounceDuration;

  // Calculate satellite position and direction for weather
  let weatherStepIdx = 0;
  let weatherStepProgress = 0;
  let weatherDirection: "right" | "left" = "right";
  let currentAnomalyIdx = 0;
  let currentAnomaly = sortedAnomalies[0];
  let anomalyPause = false;
  if (investigationType === "weather" && sortedAnomalies.length > 0) {
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
          .filter(
            (c) =>
              c.anomaly?.toString() === prevAnomaly.anomaly_id.toString() &&
              c.author === session?.user?.id
          )
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0];
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
        // Bounce logic: 2->1 (left), 1->2 (right), each 10 min
        const bounceElapsed = sinceClass;
        const bounceIdx = Math.floor(bounceElapsed / weatherBounceDuration);
        const bounceProgress =
          (bounceElapsed % weatherBounceDuration) / weatherBounceDuration;
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
    const nextStepTime =
      steps[Math.min(clampedStepIdx + 1, steps.length - 1)].time;
    const prevStepTime = steps[clampedStepIdx].time;
    stepProgress =
      nextStepTime > prevStepTime
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
    const planetTemp = stellarTemp * Math.sqrt(
      (stellarRadius * 696340) / (2 * semiMajorAxis * 1.496e11)
    );

    // Mass of the planet in Earth masses (using a simplified mass-radius relation)
    let planetMass;
    if (planetRadius < 1.6) {
      planetMass = Math.pow(planetRadius, 3.5);
    } else {
      planetMass = 1.5 * Math.pow(planetRadius, 1.5);
    }

    // Density in g/cm^3
    const planetDensity =
      (planetMass * 5.972e24) /
      ((4 / 3) * Math.PI * Math.pow(planetRadius * 6.371e6, 3)) /
      1000;

    let planetType = "unknown";
    if (planetRadius > 2.5 && planetMass > 5 && planetDensity < 1.5) {
      planetType = "gas-giant";
    } else if (planetRadius < 1.6 && planetMass > 0.5 && planetDensity > 3.5) {
      planetType = "rocky";
    } else if (
      planetRadius >= 1.0 &&
      planetRadius <= 2.5 &&
      planetDensity >= 1.5 &&
      planetDensity <= 3.5
    ) {
      planetType = "water-world";
    } else if (planetDensity >= 0.5 && planetDensity <= 2.0) {
      planetType = "ice";
    }

    if (session?.user?.id && supabase) {
      const content = `radius: ${planetRadius}, density: ${planetDensity}, temperature: ${planetTemp}, mass: ${planetMass}, type: ${planetType}, inputs: ${JSON.stringify(
        inputs
      )}`;
      // Find the latest linked anomaly for this user
      const { data: linked, error: linkedErr } = await supabase
        .from("linked_anomalies")
        .select("anomaly_id")
        .eq("author", session.user.id)
        .order("date", { ascending: false })
        .limit(1)
        .single();

      const anomalyId = linked?.anomaly_id;

      // After classification, clear linked_anomalies for this user and WeatherSatellite
      await supabase
        .from("linked_anomalies")
        .delete()
        .eq("author", session.user.id)
        .eq("automaton", "WeatherSatellite");

      await supabase.from("classifications").insert([
        {
          author: session.user.id,
          classificationtype: "planet-inspection",
          content,
          anomaly: anomalyId,
        },
      ]);

      // Refresh the page after clearing
      window.location.reload();
    }

    setPlanetStats({
      mass: planetMass,
      radius: planetRadius,
      density: planetDensity,
      temp: planetTemp,
      type: planetType,
    });
    setCreatingClassification(false);
  };

  const handleInputChange = (idx: number, value: string) => {
    setInputs((prev) => ({ ...prev, [idx]: value }));
  };

  // Determine which mission component to render
  if (investigationType === "planet") {
    return (
      <PlanetMission
        isVertical={isVertical}
        width={width}
        pxHeight={pxHeight}
        style={props.style}
        steps={steps}
        elapsed={elapsed}
        currentStepIdx={currentStepIdx}
        firstImage={firstImage}
        planetStats={planetStats}
        handleCalculate={handleCalculate}
        inputs={inputs}
        handleInputChange={handleInputChange}
        stellar={stellar}
        pxWidth={pxWidth}
        satPos={satPos}
        satSize={satSize}
        barEnd={barEnd}
        barStart={barStart}
        segmentLength={segmentLength}
        clampedStepIdx={clampedStepIdx}
        hideCards={hideCards}
        creatingClassification={creatingClassification}
      />
    );
  }

  if (investigationType === "weather") {
    return (
      <WeatherMission
        isVertical={isVertical}
        width={width}
        pxHeight={pxHeight}
        style={props.style}
        steps={steps}
        currentStepIdx={currentStepIdx}
        satPos={satPos}
        satSize={satSize}
        barEnd={barEnd}
        barStart={barStart}
        segmentLength={segmentLength}
        clampedStepIdx={clampedStepIdx}
        pxWidth={pxWidth}
        weatherDirection={weatherDirection}
        isWeatherScanning={isWeatherScanning}
        hideCards={hideCards}
      />
    );
  }

  return null;
}
