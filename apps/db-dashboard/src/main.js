import "./css/main.css";
import { isSignedIn, ping, pb, restoreSession, signOut } from "./pb.js";
import { h, icon } from "./ui.js";
import { loginPage } from "./pages/login.js";
import { collectionsPage } from "./pages/collections.js";
import { metricsPage } from "./pages/metrics.js";
import { missionsPage } from "./pages/missions.js";

const app = document.getElementById("app");
const NAV = [
    { href: "#/metrics", label: "Metrics", icon: "ri-line-chart-line" },
    { href: "#/missions", label: "Missions", icon: "ri-rocket-line" },
    { href: "#/collections", label: "Collections", icon: "ri-database-2-line" },
];

const SCHEME_KEY = "dashboardColorScheme";
function applyScheme() {
    let scheme = "";
    try { scheme = localStorage.getItem(SCHEME_KEY) || ""; } catch { /* ignore */ }
    if (!scheme) scheme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.setAttribute("data-color-scheme", scheme);
    return scheme;
}
applyScheme();

function route() {
    const hash = location.hash.replace(/^#/, "") || "/metrics";
    const [pathPart, queryPart = ""] = hash.split("?");
    const path = pathPart.split("/").filter(Boolean);
    return { path, query: new URLSearchParams(queryPart), params: { collection: path[0] === "collections" ? decodeURIComponent(path[1] || "") : "" } };
}

function header(active) {
    const pingEl = h("span", { class: "ping txt-hint txt-sm", title: "Server response time" }, "checking server…");
    const refreshPing = async () => {
        pingEl.textContent = "checking server…";
        pingEl.className = "ping txt-hint txt-sm";
        const r = await ping();
        pingEl.textContent = r.ok ? `server ${r.ms} ms` : "server unreachable";
        pingEl.className = `ping txt-sm ${r.ok ? (r.ms > 3000 ? "txt-warning" : "txt-hint") : "txt-danger"}`;
    };
    pingEl.addEventListener("click", refreshPing);
    refreshPing();

    return h("header", { class: "app-header accent-surface" },
        h("a", { href: "#/", class: "logo" }, h("img", { src: "/images/logo_white.svg", alt: "Star Sailors" })),
        h("nav", { class: "app-main-nav" }, NAV.map((n) =>
            h("a", { href: n.href, class: `header-link ${active === n.href.slice(2) ? "active" : ""}` }, icon(n.icon), h("span", { class: "txt" }, n.label)))),
        h("div", { class: "flex-fill app-header-separator" }),
        pingEl,
        h("button", {
            type: "button", class: "header-link", title: "Color scheme",
            onclick: () => {
                const next = document.documentElement.getAttribute("data-color-scheme") === "dark" ? "light" : "dark";
                try { localStorage.setItem(SCHEME_KEY, next); } catch { /* ignore */ }
                applyScheme();
            },
        }, icon("ri-contrast-2-line")),
        h("span", { class: "header-link logged-user txt-normal" }, h("span", { class: "superuser-name txt-ellipsis" }, pb.authStore.record?.email || "")),
        h("button", { type: "button", class: "header-link", title: "Logout", onclick: () => { signOut(); render(); } }, icon("ri-logout-circle-line")),
    );
}

function render() {
    if (!isSignedIn()) {
        app.replaceChildren(loginPage(() => render()));
        return;
    }
    const r = route();
    const section = r.path[0] || "metrics";
    let page;
    if (section === "collections") page = collectionsPage(r);
    else if (section === "missions") page = missionsPage(r);
    else page = metricsPage(r);
    const view = h("div", { class: "app-view" }, page);
    app.replaceChildren(header(section), view);
}

window.addEventListener("hashchange", render);
restoreSession().then(render);
