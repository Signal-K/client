/**
 * Panoptes API client — Zooniverse's backend platform.
 *
 * All active Zooniverse citizen science projects (Galaxy Zoo, Kilonova Seekers,
 * Planet Hunters TESS, Space Warps, Backyard Worlds, etc.) are served via this API.
 *
 * Docs: https://zooniverse.github.io/panoptes/
 * Base: https://www.zooniverse.org/api/
 */

const PANOPTES_BASE = "https://www.zooniverse.org/api";
const ACCEPT_HEADER = "application/vnd.api+json; version=1";

export interface PanoptesSubject {
  id: string;
  metadata: Record<string, string | number | boolean | null>;
  locations: Array<Record<string, string>>; // e.g. { "image/png": "https://..." }
  created_at: string;
  updated_at: string;
  set_member_subjects_count: number;
  subject_sets?: PanoptesSubjectSet[];
}

export interface PanoptesSubjectSet {
  id: string;
  display_name: string;
}

export interface PanoptesWorkflow {
  id: string;
  display_name: string;
  tasks: Record<string, PanoptesTask>;
  version: string;
}

export interface PanoptesTask {
  type: "drawing" | "single" | "multiple" | "survey" | "text";
  instruction: string;
  question?: string;
  answers?: Array<{ label: string; value: string }>;
  tools?: Array<{ type: string; label: string; color: string }>;
}

export interface PanoptesProject {
  id: string;
  display_name: string;
  slug: string;
  description: string;
  introduction: string;
}

/** Known Zooniverse workflow IDs for projects we integrate */
export const PANOPTES_WORKFLOWS = {
  /** Galaxy Zoo: JWST COSMOS — galaxy morphology classification */
  galaxyZoo: "28504",
  /** Kilonova Seekers — real-time transient detection from GOTO telescope */
  kilonovaSeekersReal: "26399",
  kilonovaSeekersArtifact: "26398",
  /** Space Warps: ESA Euclid — gravitational lens detection */
  spaceWarpsEuclid: "27056",
  /** Planet Hunters TESS — exoplanet transit marking */
  planetHuntersTESS: "6490",
  /** Backyard Worlds: Cool Neighbors — brown dwarf hunting */
  backyardWorlds: "20033",
  /** Jovian Vortex Hunter — Jupiter storm tracking */
  jovianVortexHunter: "13726",
  /** Cloudspotting on Mars */
  cloudspottingMars: "15549",
} as const;

export type ZooniverseProjectKey = keyof typeof PANOPTES_WORKFLOWS;

/**
 * Fetch the next batch of subjects queued for a workflow.
 * Returns images the player needs to classify — core gameplay loop.
 */
export async function fetchQueuedSubjects(
  workflowId: string,
  limit = 5,
  bearerToken?: string
): Promise<PanoptesSubject[]> {
  const url = `${PANOPTES_BASE}/subjects/queued?workflow_id=${workflowId}&page_size=${limit}`;

  const headers: HeadersInit = {
    Accept: ACCEPT_HEADER,
    "Content-Type": "application/json",
  };
  if (bearerToken) {
    headers["Authorization"] = `Bearer ${bearerToken}`;
  }

  const res = await fetch(url, { headers, next: { revalidate: 60 } });
  if (!res.ok) {
    throw new Error(`Panoptes subjects fetch failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return (data.subjects ?? []) as PanoptesSubject[];
}

/**
 * Fetch a single subject by ID.
 */
export async function fetchSubjectById(
  subjectId: string,
  bearerToken?: string
): Promise<PanoptesSubject | null> {
  const url = `${PANOPTES_BASE}/subjects/${subjectId}`;

  const headers: HeadersInit = {
    Accept: ACCEPT_HEADER,
    "Content-Type": "application/json",
  };
  if (bearerToken) {
    headers["Authorization"] = `Bearer ${bearerToken}`;
  }

  const res = await fetch(url, { headers, next: { revalidate: 300 } });
  if (!res.ok) return null;

  const data = await res.json();
  return (data.subjects?.[0] ?? null) as PanoptesSubject | null;
}

/**
 * Fetch workflow definition — includes task instructions and answer options.
 */
export async function fetchWorkflow(workflowId: string): Promise<PanoptesWorkflow | null> {
  const url = `${PANOPTES_BASE}/workflows/${workflowId}`;

  const res = await fetch(url, {
    headers: { Accept: ACCEPT_HEADER },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;

  const data = await res.json();
  return (data.workflows?.[0] ?? null) as PanoptesWorkflow | null;
}

/**
 * Submit a classification to Panoptes.
 * Requires a valid bearer token (user must be authenticated with Zooniverse).
 */
export async function submitPanoptesClassification(
  workflowId: string,
  subjectId: string,
  annotations: Record<string, unknown>[],
  bearerToken: string
): Promise<{ id: string } | null> {
  const res = await fetch(`${PANOPTES_BASE}/classifications`, {
    method: "POST",
    headers: {
      Accept: ACCEPT_HEADER,
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({
      classifications: {
        annotations,
        metadata: { started_at: new Date().toISOString(), finished_at: new Date().toISOString() },
        links: {
          project: PANOPTES_WORKFLOWS.galaxyZoo, // dynamically set per project
          workflow: workflowId,
          subjects: [subjectId],
        },
      },
    }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.classifications?.[0] ?? null;
}

/**
 * Extract the primary image URL from a Panoptes subject's locations array.
 */
export function getSubjectImageUrl(subject: PanoptesSubject): string | null {
  const locations = subject.locations ?? [];
  for (const loc of locations) {
    for (const [, url] of Object.entries(loc)) {
      if (typeof url === "string" && url.startsWith("http")) return url;
    }
  }
  return null;
}

/**
 * Extract all image URLs (multi-frame subjects like Backyard Worlds flipbooks).
 */
export function getSubjectImageUrls(subject: PanoptesSubject): string[] {
  const locations = subject.locations ?? [];
  const urls: string[] = [];
  for (const loc of locations) {
    for (const [, url] of Object.entries(loc)) {
      if (typeof url === "string" && url.startsWith("http")) urls.push(url);
    }
  }
  return urls;
}
