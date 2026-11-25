import PocketBase from "pocketbase";

const URL_KEY = "dashboardPbUrl";
const DEFAULT_URL = import.meta.env.VITE_PB_URL || "https://signal-k-pocketbase.fly.dev";

export function getPbUrl() {
    try {
        return localStorage.getItem(URL_KEY) || DEFAULT_URL;
    } catch {
        return DEFAULT_URL;
    }
}

export function setPbUrl(url) {
    try {
        localStorage.setItem(URL_KEY, url.replace(/\/+$/, ""));
    } catch { /* ignore */ }
}

// Fly stops idle machines, so the first request can take a while. Auto-cancel
// is off so overlapping page loads don't abort each other.
export const pb = new PocketBase(getPbUrl());
pb.autoCancellation(false);

export const isSignedIn = () => pb.authStore.isValid && pb.authStore.isSuperuser;

export async function signIn(email, password) {
    return pb.collection("_superusers").authWithPassword(email, password, { requestKey: null });
}

export function signOut() {
    pb.authStore.clear();
}

// Refresh the saved session on load; drops it when expired.
export async function restoreSession() {
    if (!isSignedIn()) return false;
    try {
        await pb.collection("_superusers").authRefresh();
        return true;
    } catch (err) {
        if (err?.status === 401 || err?.status === 403) {
            pb.authStore.clear();
            return false;
        }
        // Network or slow server: keep the saved token, the pages show their own errors.
        return true;
    }
}

// Round-trip time of /api/health, shown in the header so a sleeping or slow
// server is visible instead of looking like a broken page.
export async function ping() {
    const t0 = performance.now();
    try {
        const res = await fetch(`${getPbUrl()}/api/health`, { cache: "no-store" });
        return { ok: res.ok, ms: Math.round(performance.now() - t0) };
    } catch {
        return { ok: false, ms: Math.round(performance.now() - t0) };
    }
}

let collectionsPromise;
export function loadCollections(force = false) {
    if (!collectionsPromise || force) {
        collectionsPromise = pb.collections.getFullList({ sort: "name", requestKey: null });
        collectionsPromise.catch(() => (collectionsPromise = null));
    }
    return collectionsPromise;
}

export async function countRecords(name, filter) {
    const res = await pb.collection(name).getList(1, 1, { filter, skipTotal: false, fields: "id", requestKey: null });
    return res.totalItems;
}
