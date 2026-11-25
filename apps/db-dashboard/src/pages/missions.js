import { pb } from "../pb.js";
import { fmtNum, h, loader } from "../ui.js";

const MAX_ROWS = 5000;

async function fetchAll(collection, fields, sort) {
    const out = [];
    for (let page = 1; out.length < MAX_ROWS; page++) {
        const res = await pb.collection(collection).getList(page, 500, { fields, sort, skipTotal: true, requestKey: null });
        out.push(...res.items);
        if (res.items.length < 500) break;
    }
    return out;
}

function section(title, hint, load) {
    const body = h("div", null, h("div", { class: "txt-center p-base" }, loader()));
    const el = h("section", { class: "m-b-lg" }, h("h6", { class: "m-b-sm" }, title, hint ? h("span", { class: "txt-hint txt-sm" }, `  ${hint}`) : null), body);
    load().then((node) => body.replaceChildren(node)).catch((err) =>
        body.replaceChildren(h("p", { class: "txt-hint" }, `Not available: ${err?.response?.message || err.message}`)));
    return el;
}

function simpleTable(head, rows, empty = "No data.") {
    return h("table", null,
        h("thead", null, h("tr", null, head.map((c, i) => h("th", { style: i ? "text-align:right" : "" }, c)))),
        h("tbody", null, rows.length ? rows.map((r) => h("tr", null, r.map((c, i) => h("td", { style: i ? "text-align:right" : "" }, c)))) : h("tr", null, h("td", { colSpan: head.length, class: "txt-hint txt-center" }, empty))));
}

export function missionsPage() {
    const content = h("div", { class: "page-content" },
        h("header", { class: "page-header" }, h("h5", null, "Missions")),

        h("h5", { class: "m-b-sm" }, "Landnam"),
        section("Mission catalog", "missions_catalog", async () => {
            const res = await pb.collection("missions_catalog").getList(1, 100, { sort: "sequence", requestKey: null });
            const skip = new Set(["collectionId", "collectionName", "created", "updated"]);
            const keys = Object.keys(res.items[0] || {}).filter((k) => !skip.has(k)).slice(0, 8);
            return simpleTable(keys, res.items.map((r) => keys.map((k) => typeof r[k] === "object" ? JSON.stringify(r[k]) : String(r[k] ?? ""))));
        }),
        section("Landnam Minimal progress", "lm_progress", async () => {
            const rows = await fetchAll("lm_progress", "done,earned,runs", "-id");
            const chapters = new Map();
            const runs = new Map();
            let earned = 0;
            for (const r of rows) {
                for (const c of r.done || []) chapters.set(c, (chapters.get(c) || 0) + 1);
                for (const [type, n] of Object.entries(r.runs || {})) runs.set(type, (runs.get(type) || 0) + Number(n || 0));
                earned += Number(r.earned || 0);
            }
            return h("div", null,
                h("p", { class: "txt-hint m-b-sm" }, `${fmtNum(rows.length)} players, ${fmtNum(earned)} francs earned in Minimal.`),
                h("div", { class: "grid-2col" },
                    simpleTable(["Chapter", "Players finished"], [...chapters].sort((a, b) => a[0] - b[0]).map(([c, n]) => [`Chapter ${c}`, fmtNum(n)])),
                    simpleTable(["Mission type", "Runs"], [...runs].sort((a, b) => b[1] - a[1]).map(([t, n]) => [t, fmtNum(n)]))));
        }),

        h("h5", { class: "m-b-sm m-t-lg" }, "Haphazard Martians"),
        section("Levels", "hm_runs", async () => {
            const rows = await fetchAll("hm_runs", "level,won,stars,score,user", "-id");
            const byLevel = new Map();
            for (const r of rows) {
                const l = byLevel.get(r.level) || { n: 0, won: 0, stars: 0, score: 0, users: new Set() };
                l.n++;
                if (r.won) { l.won++; l.stars += r.stars || 0; l.score += r.score || 0; }
                l.users.add(r.user);
                byLevel.set(r.level, l);
            }
            const table = simpleTable(
                ["Level", "Attempts", "Players", "Win rate", "Avg stars (wins)", "Avg score (wins)"],
                [...byLevel].sort((a, b) => a[0] - b[0]).map(([lvl, l]) => [
                    `Level ${lvl}`, fmtNum(l.n), fmtNum(l.users.size), `${Math.round((l.won / l.n) * 100)}%`,
                    l.won ? (l.stars / l.won).toFixed(1) : "–", l.won ? fmtNum(Math.round(l.score / l.won)) : "–",
                ]),
                "No runs yet.");
            return h("div", null, rows.length >= MAX_ROWS ? h("p", { class: "txt-hint txt-sm m-b-sm" }, `Based on the first ${fmtNum(MAX_ROWS)} runs.`) : null, table);
        }),
    );
    return h("div", { class: "page" }, content);
}
