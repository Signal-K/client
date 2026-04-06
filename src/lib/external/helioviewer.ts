/**
 * Helioviewer API client — real-time solar imagery from SDO, SOHO, and STEREO.
 *
 * Provides high-resolution solar images in multiple wavelengths for
 * sunspot classification and solar event detection missions.
 *
 * Docs: https://api.helioviewer.org/docs/v2/
 * Base: https://api.helioviewer.org/v2/
 */

const HELIOVIEWER_BASE = "https://api.helioviewer.org/v2";

export interface HelioviewerDataSource {
  sourceId: number;
  observatory: string;
  instrument: string;
  detector: string;
  measurement: string;
  label: string;
}

export interface HelioviewerImage {
  id: string;
  date: string;
  name: string;
  scale: number;
  sourceId: number;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

/**
 * SDO AIA wavelength source IDs for Helioviewer.
 * Each wavelength reveals different layers of the Sun's atmosphere.
 */
export const SDO_SOURCES = {
  /** 304Å — Chromosphere / transition region. Shows prominences and filaments. */
  aia304: 10,
  /** 171Å — Corona. Shows coronal loops and quiet corona structures. */
  aia171: 13,
  /** 193Å — Hot flare plasma + corona. Best for flare detection. */
  aia193: 14,
  /** 211Å — Hot active regions. Shows coronal holes. */
  aia211: 15,
  /** 131Å — Very hot flare plasma. Shows X-ray bright points. */
  aia131: 9,
  /** 335Å — Hot active regions. Good for sunspot classification. */
  aia335: 11,
  /** 94Å — Extremely hot flare plasma. */
  aia94: 8,
  /** HMI Intensitygram — White light photosphere. Best for sunspot counting. */
  hmiIntensitygram: 18,
  /** HMI Magnetogram — Magnetic field map. Shows active region complexity. */
  hmiMagnetogram: 19,
} as const;

export type SdoSourceKey = keyof typeof SDO_SOURCES;

/**
 * Get the closest solar image to a given date/time.
 */
export async function fetchClosestSolarImage(
  date: Date,
  sourceId: number = SDO_SOURCES.hmiIntensitygram
): Promise<HelioviewerImage | null> {
  const isoDate = date.toISOString().replace("T", " ").substring(0, 19);
  const params = new URLSearchParams({
    date: isoDate,
    sourceId: String(sourceId),
  });

  const url = `${HELIOVIEWER_BASE}/getClosestImage/?${params}`;
  const res = await fetch(url, { next: { revalidate: 300 } });

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.id) return null;

  // Build image URL
  const imageUrl = `${HELIOVIEWER_BASE}/downloadImage/?id=${data.id}`;
  const thumbnailUrl = `${HELIOVIEWER_BASE}/downloadImage/?id=${data.id}&scale=4`;

  return {
    id: data.id,
    date: data.date ?? isoDate,
    name: data.name ?? "",
    scale: data.scale ?? 1,
    sourceId,
    url: imageUrl,
    thumbnailUrl,
    width: data.width ?? 4096,
    height: data.height ?? 4096,
  };
}

/**
 * Get latest solar images across multiple wavelengths for the sunspot classification mission.
 * Returns a multi-panel view of current solar conditions.
 */
export async function fetchCurrentSolarPanel(): Promise<{
  intensitygram: HelioviewerImage | null;
  magnetogram: HelioviewerImage | null;
  corona171: HelioviewerImage | null;
  flare193: HelioviewerImage | null;
}> {
  const now = new Date();

  const [intensitygram, magnetogram, corona171, flare193] = await Promise.allSettled([
    fetchClosestSolarImage(now, SDO_SOURCES.hmiIntensitygram),
    fetchClosestSolarImage(now, SDO_SOURCES.hmiMagnetogram),
    fetchClosestSolarImage(now, SDO_SOURCES.aia171),
    fetchClosestSolarImage(now, SDO_SOURCES.aia193),
  ]);

  return {
    intensitygram: intensitygram.status === "fulfilled" ? intensitygram.value : null,
    magnetogram: magnetogram.status === "fulfilled" ? magnetogram.value : null,
    corona171: corona171.status === "fulfilled" ? corona171.value : null,
    flare193: flare193.status === "fulfilled" ? flare193.value : null,
  };
}

/**
 * Get available data sources — useful for discovering new instruments.
 */
export async function fetchDataSources(): Promise<HelioviewerDataSource[]> {
  const res = await fetch(`${HELIOVIEWER_BASE}/getDataSources/`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];

  const data = await res.json();

  // Flatten nested source tree into flat array
  const sources: HelioviewerDataSource[] = [];
  for (const [observatory, instruments] of Object.entries(data)) {
    for (const [instrument, detectors] of Object.entries(instruments as Record<string, unknown>)) {
      for (const [detector, measurements] of Object.entries(detectors as Record<string, unknown>)) {
        for (const [measurement, sourceData] of Object.entries(measurements as Record<string, unknown>)) {
          const src = sourceData as { sourceId: number };
          sources.push({
            sourceId: src.sourceId,
            observatory,
            instrument,
            detector,
            measurement,
            label: `${observatory} ${instrument} ${measurement}`,
          });
        }
      }
    }
  }

  return sources;
}

/**
 * Sunspot classification scheme (Mount Wilson).
 * Used by NOAA/SWPC and the in-game Solar Observatory.
 */
export const SUNSPOT_CLASSIFICATIONS = {
  alpha: {
    label: "Alpha (α)",
    description: "A single unipolar sunspot group. Low flare probability.",
    flareProbability: "low",
    color: "#88C0D0",
  },
  beta: {
    label: "Beta (β)",
    description: "Bipolar group with distinct positive and negative polarities. Moderate activity.",
    flareProbability: "moderate",
    color: "#EBCB8B",
  },
  gamma: {
    label: "Gamma (γ)",
    description: "Complex group with irregular polarity. High potential for C/M-class flares.",
    flareProbability: "high",
    color: "#D08770",
  },
  betaGamma: {
    label: "Beta-Gamma (βγ)",
    description: "Bipolar with complex mixing. Good candidate for M-class flares.",
    flareProbability: "high",
    color: "#D08770",
  },
  betaDelta: {
    label: "Beta-Delta (βδ)",
    description: "Bipolar with umbrae of opposite polarity sharing penumbra. X-class flare risk.",
    flareProbability: "very-high",
    color: "#BF616A",
  },
  betaGammaDelta: {
    label: "Beta-Gamma-Delta (βγδ)",
    description: "Maximum complexity. Imminent risk of major X-class flares.",
    flareProbability: "extreme",
    color: "#BF616A",
  },
  delta: {
    label: "Delta (δ)",
    description: "Opposite polarity umbrae in single penumbra. Most flare-productive configuration.",
    flareProbability: "extreme",
    color: "#BF616A",
  },
} as const;

export type SunspotClassification = keyof typeof SUNSPOT_CLASSIFICATIONS;
