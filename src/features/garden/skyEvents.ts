// Space Week 2026 sky events for the Garden (SSC-41, SSC-42). These cards
// are link-outs: no event request, polling, or player write is added here.

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

const ATLAS = "https://youratlas.cc/app/profile";
const LANDNAM = "https://playlandnam.space/game";

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

/** Cards go live on their own date and all leave after 11 Oct. */
export function activeSkyCards(now: number): SkyEventCard[] {
  if (!Number.isFinite(now) || now >= Date.parse(SKY_CARDS_END_UTC)) return [];
  return SKY_EVENT_CARDS.filter((card) => now >= Date.parse(card.startUtc));
}
