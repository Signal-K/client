import { countRecords, loadCollections, pb } from "../pb.js";
import { GAMES, gameMatcher, getGame, gameSwitcher } from "../games.js";
import { fmtNum, h, loader, pool } from "../ui.js";

const DAYS = 30;
const MAX_PAGES = 10; // 500 rows each: bounds the load on the small production machine

// What "activity" means per game. A series counts rows by their `created` date.
const SERIES = {
    shared: [{ label: "New users", collection: "users" }],
    atlas: [
        { label: "Observations", collection: "atlas_observations" },
        { label: "Discoveries", collection: "atlas_discoveries" },
        { label: "Push subscriptions", collection: "atlas_push_subscriptions" },
        { label: "Photo challenge entries", collection: "atlas_photo_challenge_submissions" },
    ],
    "star-sailors": [
        { label: "Classifications", collection: "classifications" },
        { label: "Subject classifications", collection: "subject_classifications" },
        { label: "Saturn storm classifications", collection: "ss_saturn_storm_classifications" },
        { label: "Signal Garden classifications", collection: "ss_signal_garden_classifications" },
    ],
    landnam: [{ label: "Landnam Minimal players", collection: "lm_progress" }],
    hm: [
        { label: "Runs", collection: "hm_runs" },
        { label: "Terrain labels", collection: "hm_labels" },
        { label: "Saves", collection: "hm_saves" },
    ],
    platform: [{ label: "Contributions", collection: "platform_contributions" }],
};

const dayKey = (d) => d.toISOString().slice(0, 10);

async function dailyCounts(collection) {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);
    since.setUTCDate(since.getUTCDate() - (DAYS - 1));
    const buckets = new Map();
    for (let i = 0; i < DAYS; i++) {
        const d = new Date(since);
        d.setUTCDate(d.getUTCDate() + i);
        buckets.set(dayKey(d), 0);
    }
    let truncated = false;
    for (let page = 1; page <= MAX_PAGES; page++) {
        const res = await pb.collection(collection).getList(page, 500, {
            filter: `created >= "${dayKey(since)} 00:00:00.000Z"`,
            fields: "created", skipTotal: true, requestKey: null,
        });
        for (const r of res.items) {
            const k = String(r.created).slice(0, 10);
            if (buckets.has(k)) buckets.set(k, buckets.get(k) + 1);
        }
        if (res.items.length < 500) break;
        if (page === MAX_PAGES) truncated = true;
    }
    return { days: [...buckets], truncated };
}

function bars(days) {
    const w = 300, hgt = 56, gap = 2, bw = (w - gap * (days.length - 1)) / days.length;
    const max = Math.max(1, ...days.map(([, n]) => n));
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", `0 0 ${w} ${hgt}`);
    svg.setAttribute("class", "spark");
    days.forEach(([day, n], i) => {
        const bh = n ? Math.max(2, (n / max) * (hgt - 4)) : 1;
        const r = document.createElementNS(ns, "rect");
        r.setAttribute("x", i * (bw + gap));
        r.setAttribute("y", hgt - bh);
        r.setAttribute("width", bw);
        r.setAttribute("height", bh);
        r.setAttribute("rx", 1.5);
        r.setAttribute("fill", "var(--accentColor)");
        r.setAttribute("opacity", n ? "1" : ".25");
        const t = document.createElementNS(ns, "title");
        t.textContent = `${day}: ${n}`;
        r.append(t);
        svg.append(r);
    });
    return svg;
}

function stat(label, value) {
    return h("div", { class: "stat" }, h("div", { class: "stat-value" }, fmtNum(value)), h("div", { class: "stat-label" }, label));
}

async function seriesCard(s, known) {
    const card = h("div", { class: "metric-card" }, h("div", { class: "metric-title" }, s.label, h("span", { class: "txt-hint txt-sm" }, ` ${s.collection}`)), h("div", { class: "txt-center p-sm" }, loader()));
    if (!known.has(s.collection)) {
        card.lastChild.replaceWith(h("p", { class: "txt-hint txt-sm" }, "Collection not found on this server."));
        return card;
    }
    try {
        const [total, daily] = await Promise.all([countRecords(s.collection), dailyCounts(s.collection)]);
        const counts = daily.days.map(([, n]) => n);
        const last = (n) => counts.slice(-n).reduce((a, b) => a + b, 0);
        card.lastChild.replaceWith(
            h("div", { class: "stats" }, stat("total", total), stat("24h", last(1)), stat("7d", last(7)), stat("30d", last(30))),
            bars(daily.days),
            h("div", { class: "txt-hint txt-sm" }, daily.truncated ? `Last ${DAYS} days (capped at ${MAX_PAGES * 500} rows)` : `Last ${DAYS} days`),
        );
    } catch (err) {
        card.lastChild.replaceWith(h("p", { class: "txt-hint txt-sm" }, "No daily data (" + (err?.response?.message || err.message) + ")."));
    }
    return card;
}

export function metricsPage() {
    const body = h("div", { class: "metrics-body" });
    const root = h("div", { class: "page" }, h("div", { class: "page-content" },
        h("header", { class: "page-header" }, h("h5", null, "Metrics"), h("span", { class: "flex-fill" }), gameSwitcher(() => render())),
        body));

    let token = 0;
    async function render() {
        const my = ++token;
        const game = getGame();
        body.replaceChildren(h("div", { class: "txt-center p-base" }, loader()));
        let cols;
        try {
            cols = await loadCollections();
        } catch (err) {
            body.replaceChildren(h("div", { class: "alert danger" }, `Could not load collections: ${err.message}`));
            return;
        }
        if (my !== token) return;
        const known = new Set(cols.map((c) => c.name));
        const ids = game === "all" ? GAMES.map((g) => g.id).filter((id) => SERIES[id]) : [game];
        const sections = [];
        for (const id of ids) {
            const g = GAMES.find((x) => x.id === id);
            const series = SERIES[id] || [];
            sections.push(h("h6", { class: "m-t-base m-b-sm" }, g.label));
            const sectionGrid = h("div", { class: "metric-grid" });
            sections.push(sectionGrid);
            // cards load lazily, a few at a time
            // placeholders keep the cards in the order defined above
            const slots = series.map(() => h("div"));
            sectionGrid.append(...slots);
            pool(series, 2, async (s, i) => {
                const el = await seriesCard(s, known);
                if (my === token) slots[i].replaceWith(el);
            });
            if (!series.length) sectionGrid.append(h("p", { class: "txt-hint" }, "No activity series defined for this game yet."));
        }
        body.replaceChildren(...sections);

        // Collection sizes for the selected game(s)
        const match = gameMatcher(game);
        const mine = cols.filter((c) => !c.system && c.type !== "view" && (game === "all" || match(c.name)));
        const sizes = h("tbody");
        const sizeSection = h("div", null,
            h("h6", { class: "m-t-lg m-b-sm" }, "Collection sizes"),
            h("table", null, h("thead", null, h("tr", null, h("th", null, "Collection"), h("th", { style: "text-align:right" }, "Records"))), sizes));
        body.append(sizeSection);
        const rows = [];
        await pool(mine, 4, async (c) => {
            let n = "–";
            try { n = await countRecords(c.name); } catch { /* keep dash */ }
            if (my !== token) return;
            rows.push([c.name, n]);
            rows.sort((a, b) => (typeof b[1] === "number" ? b[1] : -1) - (typeof a[1] === "number" ? a[1] : -1));
            sizes.replaceChildren(...rows.map(([name, count]) =>
                h("tr", null, h("td", null, h("a", { href: `#/collections/${name}` }, name)), h("td", { style: "text-align:right" }, fmtNum(count)))));
        });
    }
    render();
    return root;
}
