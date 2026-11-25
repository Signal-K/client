// Collection names carry their game as a prefix (enforced for new collections
// by backend/collection_namespace.go). Keep this list in step with that file.
const SS_NAMES = new Set([
    "subjects", "subject_classifications", "classifications", "celestial_bodies",
    "sky_events", "leaderboard_stats", "asteroid_candidates", "asteroid_classifications",
]);

// Landnam's collections arrived with the SSL-877 merge, so they are matched by
// name here. Extend when the real list is known.
const LANDNAM_NAMES = new Set([
    "missions_catalog", "missions", "contractors", "mineral_deposits",
    "user_mineral_inventory", "inventory", "routes", "survey_rewards",
]);

const claimed = (n) =>
    n.startsWith("atlas_") || n.startsWith("ss_") || SS_NAMES.has(n) || n.startsWith("lm_") ||
    n.startsWith("landnam_") || LANDNAM_NAMES.has(n) || n.startsWith("hm_") || n.startsWith("platform_");

export const GAMES = [
    { id: "all", label: "All", match: () => true },
    { id: "atlas", label: "Atlas", match: (n) => n.startsWith("atlas_") },
    { id: "star-sailors", label: "Star Sailors", match: (n) => n.startsWith("ss_") || SS_NAMES.has(n) },
    {
        id: "landnam", label: "Landnam",
        match: (n) => n.startsWith("lm_") || n.startsWith("landnam_") || LANDNAM_NAMES.has(n),
    },
    { id: "hm", label: "Haphazard Martians", match: (n) => n.startsWith("hm_") },
    { id: "platform", label: "Platform", match: (n) => n.startsWith("platform_") },
    { id: "shared", label: "Shared", match: (n) => !claimed(n) },
];

const KEY = "dashboardGame";

export function getGame() {
    try {
        const id = localStorage.getItem(KEY);
        if (GAMES.some((g) => g.id === id)) return id;
    } catch { /* ignore */ }
    return "all";
}

export function setGame(id) {
    try {
        localStorage.setItem(KEY, id);
    } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent("gamechange", { detail: id }));
}

export const gameMatcher = (id) => (GAMES.find((g) => g.id === id) || GAMES[0]).match;

// Chip row shared by the Collections, Metrics and Missions pages.
import { h } from "./ui.js";
export function gameSwitcher(onChange) {
    const wrap = h("div", { class: "game-switcher" });
    const render = () => {
        wrap.replaceChildren(...GAMES.map((g) =>
            h("button", {
                type: "button",
                class: `btn sm ${getGame() === g.id ? "" : "secondary outline"}`,
                textContent: g.label,
                onclick: () => {
                    setGame(g.id);
                    render();
                    onChange?.(g.id);
                },
            })
        ));
    };
    render();
    return wrap;
}
