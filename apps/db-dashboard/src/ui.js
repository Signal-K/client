// Tiny DOM helper: h("div", { class: "x", onclick }, child, [children]...)
export function h(tag, props, ...kids) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
        if (v == null || v === false) continue;
        if (k === "class") el.className = v;
        else if (k.startsWith("on")) el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === "style" || k.startsWith("data-") || k.startsWith("aria-")) el.setAttribute(k, v);
        else if (k in el) el[k] = v;
        else el.setAttribute(k, v === true ? "" : v);
    }
    add(el, kids);
    return el;
}

export function add(el, kids) {
    for (const k of kids.flat(Infinity)) {
        if (k == null || k === false) continue;
        el.append(k.nodeType ? k : document.createTextNode(String(k)));
    }
    return el;
}

export const icon = (name) => h("i", { class: name, "aria-hidden": "true" });

export const loader = () => h("span", { class: "loader" });

export function toast(message, kind = "") {
    let wrap = document.querySelector(".toasts-wrapper");
    if (!wrap) {
        wrap = h("div", { class: "toasts-wrapper" });
        document.body.append(wrap);
    }
    const el = h("div", { class: `toast ${kind}` }, h("div", { class: "content" }, message));
    wrap.append(el);
    setTimeout(() => el.remove(), 4000);
}

export function formatDate(value) {
    if (!value) return "";
    const d = new Date(String(value).replace(" ", "T"));
    return isNaN(d) ? String(value) : d.toLocaleString();
}

export function fmtNum(n) {
    return typeof n === "number" ? n.toLocaleString() : String(n ?? "–");
}

// Runs async fns with a limit so the (small) production machine isn't flooded.
export async function pool(items, limit, fn) {
    const out = new Array(items.length);
    let i = 0;
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (i < items.length) {
            const idx = i++;
            out[idx] = await fn(items[idx], idx);
        }
    }));
    return out;
}
