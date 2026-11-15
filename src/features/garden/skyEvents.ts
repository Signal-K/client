// Sky events for the Garden: Space Week 2026 (SSC-41, SSC-42, SSC-44), then the
// Leonids and Geminids meteor seasons, which link out to Landnam's shower runs.
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
export const LEONIDS_EVENT_ID = "leonids-2026";
export const GEMINIDS_EVENT_ID = "geminids-2026";

/** Inclusive start, exclusive end (UTC). */
const EVENT_WINDOWS: Record<string, { startUtc: string; endUtc: string }> = {
  [SATURN_EVENT_ID]: { startUtc: "2026-10-04T00:00:00Z", endUtc: "2026-10-11T00:00:00Z" },
  // Same windows as Landnam's web/lib/data/sky-events.ts, so the tier matches across games.
  [LEONIDS_EVENT_ID]: { startUtc: "2026-11-06T00:00:00Z", endUtc: "2026-12-01T00:00:00Z" },
  [GEMINIDS_EVENT_ID]: { startUtc: "2026-12-13T00:00:00Z", endUtc: "2026-12-15T00:00:00Z" },
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

/** Space Week opens on 4 Oct; the banner and every card come down after 11 Oct (exclusive end, UTC). */
export const SPACE_WEEK_START_UTC = "2026-10-04T00:00:00Z";
export const SKY_CARDS_END_UTC = "2026-10-12T00:00:00Z";

const ATLAS = "https://youratlas.cc/";
const ATLAS_BADGES = "https://youratlas.cc/app/profile";
const LANDNAM = "https://playlandnam.space/?from=garden-wsw";

/** Banner links shown above the cards for the whole event: the other two games. */
export const SPACE_WEEK_LINKS: ReadonlyArray<SkyEventLink> = [
  { label: "Atlas badges", href: ATLAS_BADGES },
  { label: "Play Landnam", href: LANDNAM },
];

export const SKY_EVENT_CARDS: ReadonlyArray<SkyEventCard> = [
  {
    id: "saturn-opposition",
    startUtc: "2026-10-07T00:00:00Z",
    title: "Saturn at opposition",
    body: "Saturn is closest and brightest tonight. Log it in Atlas to earn the Saturn badge.",
    links: [{ label: "Earn the Saturn badge in Atlas", href: ATLAS }],
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

/** A run of sky cards under one banner, shown from `startUtc` until `endUtc` (exclusive, UTC). */
export interface SkySeason {
  id: string;
  title: string;
  startUtc: string;
  endUtc: string;
  links: ReadonlyArray<SkyEventLink>;
  cards: ReadonlyArray<SkyEventCard>;
}

const RADIO_METEOR_ZOO = "https://www.zooniverse.org/projects/zooniverse/radio-meteor-zoo";
const landnamShower = (from: string) => `https://playlandnam.space/?from=${from}`;

export const SKY_SEASONS: ReadonlyArray<SkySeason> = [
  {
    id: "space-week-2026",
    title: "World Space Week · 4–10 Oct",
    startUtc: SPACE_WEEK_START_UTC,
    endUtc: SKY_CARDS_END_UTC,
    links: SPACE_WEEK_LINKS,
    cards: SKY_EVENT_CARDS,
  },
  {
    id: LEONIDS_EVENT_ID,
    title: "Leonids · 6–30 Nov",
    startUtc: "2026-11-06T00:00:00Z",
    endUtc: "2026-12-01T00:00:00Z",
    links: [{ label: "Play Landnam", href: landnamShower("garden-leonids") }],
    cards: [
      {
        id: "leonids-run",
        startUtc: "2026-11-06T00:00:00Z",
        title: "Leonids shower run",
        body: "Fly the Leonids shower run in Landnam and catch debris fragments. Gold badge until 30 Nov, silver after.",
        links: [{ label: "Fly the Leonids run", href: landnamShower("garden-leonids") }],
      },
      {
        id: "leonids-peak",
        startUtc: "2026-11-16T00:00:00Z",
        title: "Leonids peak night",
        body: "The shower peaks on the night of 16–17 Nov. Look east after midnight, or classify radio meteor echoes.",
        links: [{ label: "Radio Meteor Zoo", href: RADIO_METEOR_ZOO }],
      },
    ],
  },
  {
    id: GEMINIDS_EVENT_ID,
    title: "Geminids · 4–20 Dec",
    startUtc: "2026-12-04T00:00:00Z",
    endUtc: "2026-12-21T00:00:00Z",
    links: [{ label: "Play Landnam", href: landnamShower("garden-geminids") }],
    cards: [
      {
        id: "geminids-run",
        startUtc: "2026-12-04T00:00:00Z",
        title: "Geminids are coming",
        body: "The year's richest shower peaks on 13–14 Dec. Gold Geminids badges in Landnam are only on those two nights.",
        links: [{ label: "Get ready in Landnam", href: landnamShower("garden-geminids") }],
      },
      {
        id: "geminids-peak",
        startUtc: "2026-12-13T00:00:00Z",
        title: "Geminids peak",
        body: "Fly the Geminids shower run now for gold, and count meteors from mid-evening onwards.",
        links: [
          { label: "Fly the Geminids run", href: landnamShower("garden-geminids") },
          { label: "Radio Meteor Zoo", href: RADIO_METEOR_ZOO },
        ],
      },
    ],
  },
];

const inWindow = (now: number, startUtc: string, endUtc: string) =>
  Number.isFinite(now) && now >= Date.parse(startUtc) && now < Date.parse(endUtc);

/** True from the Space Week opening until the cards come down. */
export function spaceWeekOpen(now: number): boolean {
  return inWindow(now, SPACE_WEEK_START_UTC, SKY_CARDS_END_UTC);
}

/** The season whose banner is up right now, or null between seasons. */
export function activeSkySeason(now: number): SkySeason | null {
  return SKY_SEASONS.find((season) => inWindow(now, season.startUtc, season.endUtc)) ?? null;
}

/** Cards pinned right now: each goes live on its own date and all come down with their season. */
export function activeSkyCards(now: number): SkyEventCard[] {
  const season = activeSkySeason(now);
  return season ? season.cards.filter((card) => now >= Date.parse(card.startUtc)) : [];
}

/** Rubin Comet Catchers: live Zooniverse, link-out only (SSC-42). */
export const COMET_CATCHERS = {
  title: "Rubin Comet Catchers",
  body: "Hunt comets in Rubin Observatory images. Saturn's moon Phoebe is a captured comet-like body, so you are looking for its cousins.",
  href: "https://www.zooniverse.org/projects/orionnau/rubin-comet-catchers",
} as const;
