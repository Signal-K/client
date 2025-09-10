import React, { useEffect, useMemo, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import useSatelliteProgressShared from "./useSatelliteProgressShared";
import { SharedSatelliteProps } from "./types";

export default function PlanetSatelliteProgressBar(props: SharedSatelliteProps) {
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

  const SOLAR_RADIUS_IN_EARTH_RADII = 109.2;
  const EARTH_DENSITY = 5.51;

  const deploy = typeof deployTime === "string" ? new Date(deployTime) : deployTime;
  const current = now || new Date();
  const elapsed = Math.max(0, current.getTime() - deploy.getTime());

  const steps = [
    {
      label: "Identify orbital period of your planet",
      description: "Satellite deployed and in transit.",
      time: 0,
    },
    {
      label: "Identify stellar temperature & radius",
      description: "Finding star’s temperature and radius",
      time: 10 * 60 * 1000,
    },
    {
      label: "Input orbital period",
      description: "Find the period by looking at the dips you annotated.",
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

  const totalDuration = steps[steps.length - 1].time;

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  useEffect(() => {
    for (let i = 0; i < steps.length; i++) {
      if (elapsed >= steps[i].time) setCurrentStepIdx(i);
    }
  }, [elapsed]);

  const clampedElapsed = Math.min(elapsed, totalDuration);
  const clampedStepIdx = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < steps.length; i++) {
      if (clampedElapsed >= steps[i].time) idx = i;
    }
    return idx;
  }, [clampedElapsed]);

  const nextStepTime = steps[Math.min(clampedStepIdx + 1, steps.length - 1)].time;
  const prevStepTime = steps[clampedStepIdx].time;
  const stepProgress =
    nextStepTime > prevStepTime
      ? (clampedElapsed - prevStepTime) / (nextStepTime - prevStepTime)
      : 1;

  const satProgress = Math.min(clampedStepIdx + stepProgress, steps.length - 1);
  const satPos = barStart + segmentLength * satProgress;

  const [firstImage, setFirstImage] = useState<string | undefined>(undefined);
  const [stellar, setStellar] = useState<{
    temp: number | null;
    radius: number | null;
    mass?: number | null;
  } | null>(null);
  const [inputs, setInputs] = useState<{ [key: number]: string }>({});
  const [planetStats, setPlanetStats] = useState<null | {
    mass: number;
    radius: number;
    density: number;
    temp: number;
    type?: string;
  }>(null);

  useEffect(() => {
    async function fetchFirstImage() {
      if (!session?.user?.id) return;
      const { data: linked } = await supabase
        .from("linked_anomalies")
        .select("classification_id")
        .eq("author", session.user.id)
        .order("date", { ascending: false });
      if (!linked || linked.length === 0) return;
      const classificationId = linked[0].classification_id;
      if (!classificationId) return;
      const { data: classData } = await supabase
        .from("classifications")
        .select("media")
        .eq("id", classificationId)
        .single();
      if (!classData?.media) return;

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
  }, [session?.user?.id]);

  useEffect(() => {
    async function fetchStellarFromAnomaly() {
      if (!session?.user?.id) return;
      const { data: linked } = await supabase
        .from("linked_anomalies")
        .select("anomaly_id")
        .eq("author", session.user.id)
        .order("date", { ascending: false });
      if (!linked || linked.length === 0) {
        setStellar(null);
        return;
      }
      const anomalyId = linked[0].anomaly_id;
      if (!anomalyId) {
        setStellar(null);
        return;
      }
      const { data: anomaly } = await supabase
        .from("anomalies")
        .select("anomalyConfiguration")
        .eq("id", anomalyId)
        .single();
      if (!anomaly?.anomalyConfiguration) {
        setStellar(null);
        return;
      }
      let config = anomaly.anomalyConfiguration;
      if (typeof config === "string") {
        try {
          config = JSON.parse(config);
        } catch {
          config = {};
        }
      }
      let mass = config.stellar_mass;
      if (mass == null || isNaN(Number(mass)) || !Number.isFinite(Number(mass))) {
        mass = 1.2;
      }
      setStellar({
        temp: config.stellar_temperature ?? null,
        radius: config.stellar_radius ?? null,
        mass: Number(mass),
      });
    }
    fetchStellarFromAnomaly();
  }, [session?.user?.id, supabase]);

  function calculateSemiMajorAxisAU(periodDays: number, stellarMass: number) {
    const periodYears = periodDays / 365.25;
    return Math.cbrt(periodYears ** 2 * stellarMass);
  }

  function calculatePlanetRadius(fluxPPM: number, stellarRadius: number) {
    const transitDepth = fluxPPM / 1_000_000;
    return (
      stellarRadius * Math.sqrt(transitDepth) * SOLAR_RADIUS_IN_EARTH_RADII
    );
  }

  function calculatePlanetTemperature(
    stellarTemp: number,
    stellarRadius: number,
    semiMajorAxisAU: number
  ) {
    return stellarTemp * Math.sqrt(stellarRadius / (2 * semiMajorAxisAU));
  }

  function estimatePlanetMass(planetRadius: number): number {
    return planetRadius < 4
      ? 2.69 * Math.pow(planetRadius, 0.93)
      : 1.6 * Math.pow(planetRadius, 1.5);
  }

  function calculatePlanetDensity(planetMass: number, planetRadius: number): number {
    return EARTH_DENSITY * (planetMass / Math.pow(planetRadius, 3));
  }

  function classifyPlanetType({
    radius,
    mass,
    density,
    temperature,
  }: {
    radius: number;
    mass: number;
    density: number;
    temperature?: number;
  }): "terrestrial" | "ocean" | "ice" | "gaseous" {
    if (radius > 2.5 && mass > 5 && density < 1.5) return "gaseous";
    if (radius < 1.6 && mass > 0.5 && density > 3.5) return "terrestrial";
    if (radius >= 1.0 && radius <= 2.5 && density >= 1.5 && density <= 3.5) return "ocean";
    if (density >= 0.5 && density <= 2.0) return "ice";
    return "terrestrial";
  }

  const handleCalculate = () => {
    if (!stellar || !stellar.radius || !stellar.temp || !stellar.mass) return;
    const period = parseFloat(inputs[2]);
    const fluxInput = parseFloat(inputs[3]);
    if (isNaN(period) || isNaN(fluxInput)) return;
    const semiMajorAxis = calculateSemiMajorAxisAU(period, stellar.mass);
    const planetRadius = calculatePlanetRadius(fluxInput, stellar.radius);
    const planetTemp = calculatePlanetTemperature(
      stellar.temp,
      stellar.radius,
      semiMajorAxis
    );
    const planetMass = estimatePlanetMass(planetRadius);
    const planetDensity = calculatePlanetDensity(planetMass, planetRadius);
    const planetType = classifyPlanetType({
      radius: planetRadius,
      mass: planetMass,
      density: planetDensity,
      temperature: planetTemp,
    });
    setPlanetStats({
      mass: planetMass,
      radius: planetRadius,
      density: planetDensity,
      temp: planetTemp,
      type: planetType,
    });
  };

  return (
    <div style={{ width, height }}>
      {/* UI rendering stubbed - will match original layout */}
      Planet Progress Bar here (TODO: render cards and visuals)
    </div>
  );
}