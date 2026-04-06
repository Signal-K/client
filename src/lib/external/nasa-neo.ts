/**
 * NASA NeoWs (Near Earth Object Web Service) API client.
 * Also pulls from the Minor Planet Center (MPC) for real asteroid data.
 *
 * Used for the Daily Minor Planet and asteroid detection missions.
 *
 * Docs: https://api.nasa.gov/
 * MPC: https://www.minorplanetcenter.net/
 */

const NEOWS_BASE = "https://api.nasa.gov/neo/rest/v1";
const NASA_API_KEY = process.env.NASA_API_KEY ?? "DEMO_KEY";

export interface NearEarthObject {
  id: string;
  name: string;
  nasaJplUrl: string;
  absoluteMagnitude: number;
  estimatedDiameter: {
    min: number;
    max: number;
  };
  isPotentiallyHazardous: boolean;
  closeApproaches: CloseApproach[];
  orbitClass: string;
}

export interface CloseApproach {
  date: string;
  relativeVelocityKmh: number;
  missDistanceKm: number;
  orbitingBody: string;
}

export interface NeoFeed {
  elementCount: number;
  neos: NearEarthObject[];
  startDate: string;
  endDate: string;
}

function formatDate(d: Date): string {
  return d.toISOString().substring(0, 10);
}

/**
 * Fetch Near Earth Objects approaching within the next N days.
 * Used for the "Threat Assessment" mechanic in the Daily Minor Planet mission.
 */
export async function fetchNeoFeed(startDate?: Date, endDate?: Date): Promise<NeoFeed> {
  const start = startDate ?? new Date();
  const end = endDate ?? new Date(start.getTime() + 7 * 86400000);

  const params = new URLSearchParams({
    start_date: formatDate(start),
    end_date: formatDate(end),
    api_key: NASA_API_KEY,
  });

  const url = `${NEOWS_BASE}/feed?${params}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error(`NeoWs feed failed: ${res.status}`);
  }

  const data = await res.json();

  const neosByDate = data.near_earth_objects as Record<string, unknown[]>;
  const allNeos: NearEarthObject[] = [];

  for (const [, dayNeos] of Object.entries(neosByDate)) {
    for (const raw of dayNeos) {
      const r = raw as Record<string, unknown>;
      const approaches = (r.close_approach_data as Record<string, unknown>[] ?? []).map(
        (ca) => {
          const c = ca as Record<string, unknown>;
          const vel = c.relative_velocity as Record<string, string>;
          const dist = c.miss_distance as Record<string, string>;
          return {
            date: String(c.close_approach_date ?? ""),
            relativeVelocityKmh: parseFloat(vel?.kilometers_per_hour ?? "0"),
            missDistanceKm: parseFloat(dist?.kilometers ?? "0"),
            orbitingBody: String(c.orbiting_body ?? "Earth"),
          };
        }
      );

      const diam = r.estimated_diameter as Record<string, Record<string, number>>;
      const km = diam?.kilometers ?? { estimated_diameter_min: 0, estimated_diameter_max: 0 };

      allNeos.push({
        id: String(r.id ?? ""),
        name: String(r.name ?? ""),
        nasaJplUrl: String(r.nasa_jpl_url ?? ""),
        absoluteMagnitude: Number(r.absolute_magnitude_h ?? 0),
        estimatedDiameter: {
          min: km.estimated_diameter_min ?? 0,
          max: km.estimated_diameter_max ?? 0,
        },
        isPotentiallyHazardous: Boolean(r.is_potentially_hazardous_asteroid),
        closeApproaches: approaches,
        orbitClass: String(
          (r.orbital_data as Record<string, unknown>)?.orbit_class as Record<string, string> ?
            ((r.orbital_data as Record<string, unknown>)?.orbit_class as Record<string, string>)?.orbit_class_type ?? "MBA"
          : "MBA"
        ),
      });
    }
  }

  return {
    elementCount: data.element_count ?? allNeos.length,
    neos: allNeos,
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
}

/**
 * Fetch a specific asteroid by its NASA JPL small body ID.
 */
export async function fetchNeoById(asteroidId: string): Promise<NearEarthObject | null> {
  const params = new URLSearchParams({ api_key: NASA_API_KEY });
  const url = `${NEOWS_BASE}/neo/${asteroidId}?${params}`;

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) return null;

  const r = await res.json() as Record<string, unknown>;
  const approaches = (r.close_approach_data as Record<string, unknown>[] ?? []).map(
    (ca) => {
      const c = ca as Record<string, unknown>;
      const vel = c.relative_velocity as Record<string, string>;
      const dist = c.miss_distance as Record<string, string>;
      return {
        date: String(c.close_approach_date ?? ""),
        relativeVelocityKmh: parseFloat(vel?.kilometers_per_hour ?? "0"),
        missDistanceKm: parseFloat(dist?.kilometers ?? "0"),
        orbitingBody: String(c.orbiting_body ?? "Earth"),
      };
    }
  );

  const diam = r.estimated_diameter as Record<string, Record<string, number>>;
  const km = diam?.kilometers ?? { estimated_diameter_min: 0, estimated_diameter_max: 0 };

  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    nasaJplUrl: String(r.nasa_jpl_url ?? ""),
    absoluteMagnitude: Number(r.absolute_magnitude_h ?? 0),
    estimatedDiameter: {
      min: km.estimated_diameter_min ?? 0,
      max: km.estimated_diameter_max ?? 0,
    },
    isPotentiallyHazardous: Boolean(r.is_potentially_hazardous_asteroid),
    closeApproaches: approaches,
    orbitClass: "NEA",
  };
}

/**
 * Get today's potentially hazardous asteroids for the threat-board mechanic.
 */
export async function fetchTodaysPHAs(): Promise<NearEarthObject[]> {
  const feed = await fetchNeoFeed(new Date(), new Date());
  return feed.neos.filter((neo) => neo.isPotentiallyHazardous);
}

/**
 * Asteroid classification for in-game taxonomy.
 * Based on the Tholen and SMASS spectral classification systems.
 */
export const ASTEROID_SPECTRAL_TYPES = {
  C: {
    label: "C-type (Carbonaceous)",
    description: "Most common asteroid type (~75%). Dark, primitive composition — remnants of early solar system material.",
    rarity: "common",
    color: "#6B7280",
    mineralHint: "Carbon compounds, clay minerals, water ice",
  },
  S: {
    label: "S-type (Silicaceous)",
    description: "Second most common (~17%). Stony-iron composition. Source of most meteorites found on Earth.",
    rarity: "common",
    color: "#D08770",
    mineralHint: "Olivine, pyroxene, iron-nickel",
  },
  M: {
    label: "M-type (Metallic)",
    description: "Rare metallic asteroids (~10%). Possibly exposed cores of differentiated bodies. Enormous mineral value.",
    rarity: "rare",
    color: "#88C0D0",
    mineralHint: "Iron-nickel alloy, platinum group metals",
  },
  B: {
    label: "B-type (Primitive Carbonaceous)",
    description: "Subset of C-type with bluish spectrum. Possibly cometary nuclei. Ryugu and Bennu are B-types.",
    rarity: "uncommon",
    color: "#5E81AC",
    mineralHint: "Hydrated silicates, organic compounds",
  },
  V: {
    label: "V-type (Vestoid)",
    description: "Fragments of asteroid Vesta's basaltic crust. Igneous history indicates differentiation.",
    rarity: "uncommon",
    color: "#B48EAD",
    mineralHint: "Pyroxene, basalt, howardite",
  },
  D: {
    label: "D-type (Dark Outer Belt)",
    description: "Very dark, reddish outer-belt asteroids. Trojans and Hildas. May preserve primordial solar nebula material.",
    rarity: "rare",
    color: "#BF616A",
    mineralHint: "Organic compounds, tholins, silicates",
  },
  X: {
    label: "X-type (Uncertain)",
    description: "Ambiguous spectrum — could be E, M, or P class. Requires spectroscopic follow-up to confirm.",
    rarity: "uncommon",
    color: "#EBCB8B",
    mineralHint: "Unknown — spectrum inconclusive",
  },
} as const;

export type AsteroidSpectralType = keyof typeof ASTEROID_SPECTRAL_TYPES;
