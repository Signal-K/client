import { loadCollections, pb } from "../pb.js";
import { gameMatcher, getGame, gameSwitcher } from "../games.js";
import { add, formatDate, fmtNum, h, icon, loader, toast } from "../ui.js";

const PER_PAGE = 30;

export function collectionsPage(ctx) {
    const name = ctx.params.collection || ctx.path[1];
    const state = {
        page: Number(ctx.query.get("page")) || 1,
        sort: ctx.query.get("sort") || "-@rowid",
        filter: ctx.query.get("filter") || "",
    };

    const list = h("nav", { class: "sidebar-content collections-list scrollable" });
    const search = h("input", { type: "text", placeholder: "Search collections...", oninput: () => renderList() });
    let collections = [];

    const renderList = () => {
        const q = search.value.replaceAll(" ", "").toLowerCase();
        const match = gameMatcher(getGame());
        const shown = collections.filter((c) =>
            (getGame() === "all" || (!c.system && match(c.name))) && (c.name + c.type).toLowerCase().includes(q)
        );
        const regular = shown.filter((c) => !c.system);
        const system = shown.filter((c) => c.system);
        const item = (c) =>
            h("a", {
                href: `#/collections/${c.name}`,
                class: `nav-item ${c.name === name ? "active" : ""}`,
                title: c.name,
            }, icon(c.type === "auth" ? "ri-group-line" : c.type === "view" ? "ri-table-line" : "ri-folder-2-line"),
                h("span", { class: "txt" }, c.name));
        list.replaceChildren(
            ...(regular.length
                ? [h("details", { class: "nav-group", open: true }, h("summary", null, getGame() === "all" ? "Collections" : "Collections in game"), regular.map(item))]
                : []),
            ...(system.length ? [h("details", { class: "nav-group", open: !!q }, h("summary", null, "System"), system.map(item))] : []),
            ...(!shown.length ? [h("p", { class: "txt-hint txt-center p-t-base" }, "No collections found.")] : []),
        );
    };

    const sidebar = h("aside", { class: "page-sidebar collections-sidebar" },
        h("div", { class: "sidebar-search" }, h("div", { class: "fields" }, h("div", { class: "field" }, search))),
        h("div", { class: "sidebar-content", style: "padding-bottom:0" }, gameSwitcher(() => renderList())),
        list,
    );

    const content = h("div", { class: "page-content full-height" });
    const root = h("div", { class: "page" }, sidebar, content);

    loadCollections().then((cols) => {
        collections = cols;
        renderList();
        if (name) renderRecords(content, collections.find((c) => c.name === name), state, ctx);
        else content.replaceChildren(h("p", { class: "txt-hint" }, "Pick a collection on the left."));
    }).catch((err) => {
        list.replaceChildren(h("p", { class: "txt-danger p-base" }, `Failed to load collections: ${err.message}`));
    });
    list.replaceChildren(h("div", { class: "txt-center p-base" }, loader()));
    if (!name) content.replaceChildren(h("p", { class: "txt-hint" }, "Loading..."));

    return root;
}

function visibleFields(col) {
    const fields = (col.fields || []).filter((f) => !f.hidden && f.type !== "password");
    const id = { name: "id", type: "text" };
    return [id, ...fields.filter((f) => f.name !== "id")];
}

function cell(field, value) {
    if (value == null || value === "" || (Array.isArray(value) && !value.length)) return h("span", { class: "txt-hint" }, "N/A");
    switch (field.type) {
        case "bool":
            return icon(value ? "ri-checkbox-circle-fill txt-success" : "ri-close-circle-line txt-hint");
        case "date":
        case "autodate":
            return h("span", { class: "txt-nowrap" }, formatDate(value));
        case "json": {
            const s = JSON.stringify(value);
            return h("span", { class: "txt-ellipsis", title: s, style: "max-width:280px;display:inline-block" }, s);
        }
        case "number":
            return h("span", null, fmtNum(value));
        default: {
            const s = Array.isArray(value) ? value.join(", ") : String(value);
            return h("span", { class: "txt-ellipsis", title: s, style: "max-width:280px;display:inline-block" }, s);
        }
    }
}

async function renderRecords(content, col, state, ctx) {
    if (!col) {
        content.replaceChildren(h("p", { class: "txt-danger" }, "Collection not found."));
        return;
    }
    const fields = visibleFields(col);
    const tableWrap = h("div", { class: "table-wrapper", style: "overflow:auto;flex:1" });
    const footer = h("div", { class: "page-footer-bar" });
    const filterInput = h("input", {
        type: "text",
        value: state.filter,
        placeholder: 'Search term or filter like created >= "2026-11-01" && level = 3',
        onkeydown: (e) => {
            if (e.key === "Enter") {
                state.filter = filterInput.value.trim();
                state.page = 1;
                load();
            }
        },
    });
    const refresh = h("button", { type: "button", class: "btn secondary circle", title: "Refresh", onclick: () => load() }, icon("ri-refresh-line"));
    const header = h("header", { class: "page-header" },
        h("nav", { class: "breadcrumbs" }, h("div", { class: "breadcrumb-item" }, "Collections"), h("div", { class: "breadcrumb-item" }, col.name)),
        refresh,
        h("div", { class: "field", style: "flex:1;min-width:240px" }, filterInput),
    );
    content.replaceChildren(header, tableWrap, footer);

    const searchable = (col.fields || []).filter((f) => ["text", "email", "url", "editor"].includes(f.type)).map((f) => f.name);

    async function load() {
        tableWrap.replaceChildren(h("div", { class: "txt-center p-base" }, loader()));
        let filter = state.filter;
        if (filter && !/[=<>~!&|()]/.test(filter) && searchable.length) {
            const term = filter.replaceAll('"', '\\"');
            filter = searchable.map((n) => `${n} ~ "${term}"`).join(" || ");
        }
        try {
            const res = await pb.collection(col.name).getList(state.page, PER_PAGE, {
                sort: state.sort, filter, requestKey: null,
            });
            const sortBy = (name) => {
                state.sort = state.sort === name ? `-${name}` : name;
                state.page = 1;
                load();
            };
            const th = (f) =>
                h("th", { class: "sortable", style: "cursor:pointer;white-space:nowrap", onclick: () => sortBy(f.name) },
                    f.name,
                    state.sort === f.name ? icon("ri-arrow-up-s-line") : state.sort === `-${f.name}` ? icon("ri-arrow-down-s-line") : null);
            const table = h("table", { class: "table-compact" },
                h("thead", null, h("tr", null, fields.map(th))),
                h("tbody", null, res.items.length
                    ? res.items.map((r) =>
                        h("tr", { class: "row-link", style: "cursor:pointer", onclick: () => showRecord(col, r, fields) },
                            fields.map((f) => h("td", null, cell(f, r[f.name]))))
                    )
                    : h("tr", null, h("td", { colSpan: fields.length, class: "txt-center txt-hint p-base" }, "No records found."))),
            );
            tableWrap.replaceChildren(table);
            footer.replaceChildren(
                h("span", { class: "txt-hint" }, `${fmtNum(res.totalItems)} record${res.totalItems === 1 ? "" : "s"}`),
                h("span", { class: "flex-fill" }),
                h("button", { class: "btn sm secondary", disabled: state.page <= 1, onclick: () => { state.page--; load(); } }, icon("ri-arrow-left-s-line"), "Prev"),
                h("span", { class: "txt-hint" }, ` ${state.page} / ${Math.max(res.totalPages, 1)} `),
                h("button", { class: "btn sm secondary", disabled: state.page >= res.totalPages, onclick: () => { state.page++; load(); } }, "Next", icon("ri-arrow-right-s-line")),
            );
        } catch (err) {
            tableWrap.replaceChildren(h("div", { class: "alert danger" }, err?.response?.message || err.message));
            if (err?.status === 401) toast("Session expired. Sign in again.", "danger");
        }
    }
    load();
}

function showRecord(col, record, fields) {
    const json = JSON.stringify(record, null, 2);
    const close = () => overlay.remove();
    const overlay = h("div", { class: "overlay-panel-wrapper record-view-overlay", onclick: (e) => e.target === overlay && close() },
        h("div", { class: "record-view-panel" },
            h("div", { class: "record-view-head" },
                h("h5", null, `${col.name} / ${record.id}`),
                h("button", { class: "btn sm secondary circle", onclick: close, title: "Close" }, icon("ri-close-line"))),
            h("div", { class: "record-view-body" },
                h("table", null, h("tbody", null, fields.map((f) =>
                    h("tr", null, h("th", { style: "width:30%;vertical-align:top" }, f.name), h("td", { style: "white-space:pre-wrap;word-break:break-word" },
                        record[f.name] != null && typeof record[f.name] === "object" ? JSON.stringify(record[f.name], null, 2) : String(record[f.name] ?? "")))))),
                h("h6", { class: "m-t-base" }, "Raw JSON"),
                h("pre", { class: "record-json" }, json),
                h("button", { class: "btn sm secondary", onclick: () => { navigator.clipboard?.writeText(json); toast("Copied"); } }, icon("ri-file-copy-line"), "Copy JSON"))),
    );
    document.body.append(overlay);
}
