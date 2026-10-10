// Space Week 2026 sky event cards for the Garden (SSC-41, SSC-44).
// Link-out only: every card sends the player to a live Atlas page or a named
// live external activity. No badge backend lives here; badges are granted in
// Atlas (ASV-127) and Landnam (SSL-491).

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

/** True from the Space Week opening until the cards come down. */
export function spaceWeekOpen(now: number): boolean {
  return Number.isFinite(now) && now >= Date.parse(SPACE_WEEK_START_UTC) && now < Date.parse(SKY_CARDS_END_UTC);
}

/** Cards pinned right now: each goes live on its own date and all end after 11 Oct. */
export function activeSkyCards(now: number): SkyEventCard[] {
  if (!spaceWeekOpen(now)) return [];
  return SKY_EVENT_CARDS.filter((card) => now >= Date.parse(card.startUtc));
}
