/**
 * AAVSO (American Association of Variable Star Observers) API client.
 *
 * Provides access to variable star data — light curves, star parameters,
 * and observing campaigns. Used for Variable Star Classification missions.
 *
 * Docs: https://www.aavso.org/apis-aavso-resources
 * VSX: https://www.aavso.org/vsx/
 * VSP (chart plotter): https://www.aavso.org/apps/vsp/
 */

const VSX_BASE = "https://www.aavso.org/vsx/index.php";
const VSP_BASE = "https://www.aavso.org/apps/vsp/api";

export interface VariableStar {
  Name: string;
  AUID: string;
  RA2000: string;
  Declination2000: string;
  VariabilityType: string;
  Period: string | null;
  MaxMag: string;
  MinMag: string;
  Epoch: string | null;
  Category: string;
  OID: string;
}

export interface VariableStarChart {
  chartId: string;
  star: string;
  ra: string;
  dec: string;
  compStars: ComparisonStar[];
}

export interface ComparisonStar {
  auid: string;
  label: string;
  ra: string;
  dec: string;
  vmag: string;
}

/**
 * Variable star types and their game labels.
 * Used for classification tasks.
 */
export const VARIABLE_STAR_TYPES: Record<string, { label: string; description: string; color: string }> = {
  EW: {
    label: "Contact Binary",
    description: "Two stars orbiting so close they share their outer atmospheres. W UMa type.",
    color: "#88C0D0",
  },
  EB: {
    label: "Eclipsing Binary",
    description: "Stars whose orbital plane is aligned with our line of sight — one dims the other.",
    color: "#81A1C1",
  },
  EA: {
    label: "Algol Binary",
    description: "Detached eclipsing system with sharp ingress/egress. Named after Algol (Beta Persei).",
    color: "#5E81AC",
  },
  RRAB: {
    label: "RR Lyrae",
    description: "Old pulsating stars used as standard candles. Period under 1 day, asymmetric light curve.",
    color: "#EBCB8B",
  },
  DCEP: {
    label: "Cepheid Variable",
    description: "Pulsating supergiant — period directly relates to luminosity. Cosmic distance rulers.",
    color: "#D08770",
  },
  MIRA: {
    label: "Mira Variable",
    description: "Cool giant pulsating over months. Named after o Ceti (Mira), the 'Wonderful Star'.",
    color: "#BF616A",
  },
  SR: {
    label: "Semi-Regular",
    description: "Giant with a loosely periodic variation. Period and amplitude change cycle to cycle.",
    color: "#B48EAD",
  },
  UV: {
    label: "Flare Star",
    description: "Red dwarf with sudden brightening events from magnetic reconnection. UV Ceti type.",
    color: "#A3BE8C",
  },
  CV: {
    label: "Cataclysmic Variable",
    description: "White dwarf accreting mass from a companion — can produce novae and dwarf novae outbursts.",
    color: "#D08770",
  },
  GCAS: {
    label: "Gamma Cas Variable",
    description: "Hot rapidly-rotating Be star with circumstellar disk. Irregular brightness changes.",
    color: "#88C0D0",
  },
};

/**
 * Fetch variable stars near sky coordinates (cone search).
 * Returns stars suitable for classification campaigns.
 */
export async function fetchVariableStarsNear(
  ra: number,
  dec: number,
  radiusDeg = 5,
  limit = 10
): Promise<VariableStar[]> {
  const params = new URLSearchParams({
    view: "query.json",
    coords: `${ra} ${dec}`,
    geom: "r",
    size: String(radiusDeg),
    unit: "2", // degrees
    format: "json",
    num_results: String(limit),
  });

  const url = `${VSX_BASE}?${params}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error(`AAVSO VSX fetch failed: ${res.status}`);
  }

  const data = await res.json();
  return (data.VSXObjects?.VSXObject ?? []) as VariableStar[];
}

/**
 * Look up a specific variable star by name.
 */
export async function fetchVariableStarByName(name: string): Promise<VariableStar | null> {
  const params = new URLSearchParams({
    view: "api.object",
    ident: name,
    format: "json",
  });

  const url = `${VSX_BASE}?${params}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) return null;

  const data = await res.json();
  return (data.VSXObject ?? null) as VariableStar | null;
}

/**
 * Get a comparison star chart for a variable star observation session.
 * Returns comparison star positions and magnitudes for photometric measurement.
 */
export async function fetchStarChart(
  starName: string,
  fovArcmin = 60,
  magLimit = 14.5
): Promise<VariableStarChart | null> {
  const params = new URLSearchParams({
    star: starName,
    fov: String(fovArcmin),
    maglimit: String(magLimit),
  });

  const url = `${VSP_BASE}/chart/?${params}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.chartid) return null;

  return {
    chartId: data.chartid,
    star: data.star ?? starName,
    ra: data.ra ?? "",
    dec: data.dec ?? "",
    compStars: (data.photometry ?? []).map((s: Record<string, string>) => ({
      auid: s.auid,
      label: s.label,
      ra: s.ra,
      dec: s.dec,
      vmag: s.bands?.find?.((b: Record<string, string>) => b.band === "V")?.mag ?? "",
    })),
  };
}

/**
 * Curated list of variable stars for in-game classification tasks.
 * Selected for educational value, visibility, and variety of types.
 */
export const CAMPAIGN_VARIABLE_STARS: Array<{
  name: string;
  type: string;
  period: string;
  magnitude: string;
  constellation: string;
  description: string;
  ra: number;
  dec: number;
}> = [
  {
    name: "Delta Cephei",
    type: "DCEP",
    period: "5.37 days",
    magnitude: "3.5–4.4",
    constellation: "Cepheus",
    description: "The prototype Cepheid. Its period-luminosity relationship underpins cosmic distance measurement.",
    ra: 337.29,
    dec: 58.41,
  },
  {
    name: "Mira",
    type: "MIRA",
    period: "332 days",
    magnitude: "2.0–10.1",
    constellation: "Cetus",
    description: "The 'Wonderful Star'. Visible to the naked eye near maximum, invisible near minimum.",
    ra: 34.84,
    dec: -2.98,
  },
  {
    name: "Algol",
    type: "EA",
    period: "2.87 days",
    magnitude: "2.1–3.4",
    constellation: "Perseus",
    description: "The Demon Star — an eclipsing binary dimming every 2.87 days as the fainter star transits.",
    ra: 47.04,
    dec: 40.96,
  },
  {
    name: "RR Lyrae",
    type: "RRAB",
    period: "0.57 days",
    magnitude: "7.1–8.1",
    constellation: "Lyra",
    description: "Prototype of the RR Lyrae class. Old halo star used to measure galactic structure.",
    ra: 290.66,
    dec: 42.78,
  },
  {
    name: "SS Cygni",
    type: "CV",
    period: "7.2 hrs (orbital)",
    magnitude: "7.7–12.4",
    constellation: "Cygnus",
    description: "The most-observed dwarf nova. Brightens by 4 magnitudes every few weeks during outburst.",
    ra: 325.68,
    dec: 43.59,
  },
  {
    name: "Eta Aquilae",
    type: "DCEP",
    period: "7.18 days",
    magnitude: "3.5–4.4",
    constellation: "Aquila",
    description: "A bright Cepheid — naked-eye target for measuring the rate of cosmic expansion.",
    ra: 298.12,
    dec: 0.99,
  },
  {
    name: "W UMa",
    type: "EW",
    period: "0.33 days",
    magnitude: "7.8–8.5",
    constellation: "Ursa Major",
    description: "Prototype contact binary. The two stars orbit so close they share an outer atmosphere.",
    ra: 159.08,
    dec: 55.62,
  },
  {
    name: "U Geminorum",
    type: "CV",
    period: "4.25 hrs (orbital)",
    magnitude: "8.2–14.9",
    constellation: "Gemini",
    description: "Prototype dwarf nova. Quiescent at mag 14.9, brightening to 8.2 at unpredictable intervals.",
    ra: 118.77,
    dec: 22.00,
  },
];
