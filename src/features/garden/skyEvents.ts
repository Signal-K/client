// Space Week 2026 sky events for the Garden (SSC-41, SSC-42).
// Badge rule shared with Landnam (SSL-491): gold during the event period,
// silver any time after, nothing before it opens. Event ids match Landnam's
// sky-events.ts so a badge means the same thing in every game.

export type BadgeTier = "gold" | "silver";

export interface SkyBadge {
  eventId: string;
  tier: BadgeTier;
  earnedAt: number;
}

export const SATURN_EVENT_ID = "saturn-night-2026";

/** Inclusive start, exclusive end (UTC). */
const EVENT_WINDOWS: Record<string, { startUtc: string; endUtc: string }> = {
  [SATURN_EVENT_ID]: { startUtc: "2026-10-04T00:00:00Z", endUtc: "2026-10-11T00:00:00Z" },
};

/** Gold during the event period, silver after it, null before it opens or for an unknown event. */
export function badgeTierFor(eventId: string, at: number): BadgeTier | null {
  const win = EVENT_WINDOWS[eventId];
  if (!win || !Number.isFinite(at)) return null;
  if (at < Date.parse(win.startUtc)) return null;
  return at < Date.parse(win.endUtc) ? "gold" : "silver";
}

/** Idempotent grant: returns the same map when nothing changes; never downgrades gold. */
export function grantSkyBadge(
  badges: Record<string, SkyBadge> | undefined,
  eventId: string,
  at: number,
): Record<string, SkyBadge> | undefined {
  const tier = badgeTierFor(eventId, at);
  if (!tier) return badges;
  const existing = badges?.[eventId];
  if (existing && (existing.tier === "gold" || tier === "silver")) return badges;
  return { ...badges, [eventId]: { eventId, tier, earnedAt: at } };
}

export interface SkyEventLink {
  label: string;
  href: string;
}

export interface SkyEventCard {
  id: string;
  /** Inclusive start (UTC). */
  startUtc: string;
  title: string;
  body: string;
  links: ReadonlyArray<SkyEventLink>;
}

/** Every card comes down after 11 Oct (exclusive end, UTC). */
export const SKY_CARDS_END_UTC = "2026-10-12T00:00:00Z";

const ATLAS = "https://youratlas.cc/";
const LANDNAM = "https://playlandnam.space/";

export const SKY_EVENT_CARDS: ReadonlyArray<SkyEventCard> = [
  {
    id: "saturn-opposition",
    startUtc: "2026-10-07T00:00:00Z",
    title: "Saturn at opposition",
    body: "Saturn is closest and brightest tonight. Log it in Atlas to earn the Saturn badge.",
    links: [
      { label: "Earn the Saturn badge in Atlas", href: ATLAS },
      { label: "Classify Saturn in Landnám", href: LANDNAM },
    ],
  },
  {
    id: "evening-shower",
    startUtc: "2026-10-08T00:00:00Z",
    title: "Evening meteor shower",
    body: "Count meteors from your window, or help classify radio meteor echoes.",
    links: [{ label: "Radio Meteor Zoo", href: "https://www.zooniverse.org/projects/zooniverse/radio-meteor-zoo" }],
  },
  {
    id: "dark-sky",
    startUtc: "2026-10-10T00:00:00Z",
    title: "Dark-sky night",
    body: "Globe at Night closes 11 Oct. Submit what you can see, or find M31 in Atlas.",
    links: [
      { label: "Globe at Night", href: "https://www.globeatnight.org/" },
      { label: "Find M31 in Atlas", href: ATLAS },
    ],
  },
];

/** Cards pinned right now: each goes live on its own date and all end after 11 Oct. */
export function activeSkyCards(now: number): SkyEventCard[] {
  if (!Number.isFinite(now) || now >= Date.parse(SKY_CARDS_END_UTC)) return [];
  return SKY_EVENT_CARDS.filter((card) => now >= Date.parse(card.startUtc));
}

/** Rubin Comet Catchers: live Zooniverse, link-out only (SSC-42). */
export const COMET_CATCHERS = {
  title: "Rubin Comet Catchers",
  body: "Hunt comets in Rubin Observatory images. Saturn's moon Phoebe is a captured comet-like body, so you are looking for its cousins.",
  href: "https://www.zooniverse.org/projects/orionnau/rubin-comet-catchers",
} as const;
