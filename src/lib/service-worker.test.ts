import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

type FetchEventLike = {
  request: {
    method: string;
    mode: string;
    url: string;
  };
  respondWith: ReturnType<typeof vi.fn>;
};

function loadFetchHandler() {
  const handlers = new Map<string, (event: FetchEventLike) => void>();
  const serviceWorkerSource = readFileSync(
    new URL("../../public/service-worker.js", import.meta.url),
    "utf8"
  );
  const selfMock = {
    location: { origin: "https://starsailors.space" },
    addEventListener: (type: string, handler: (event: FetchEventLike) => void) => {
      handlers.set(type, handler);
    },
    skipWaiting: vi.fn(),
    clients: { claim: vi.fn() },
  };
  const cachesMock = {
    match: vi.fn().mockResolvedValue(undefined),
    open: vi.fn(),
    keys: vi.fn(),
    delete: vi.fn(),
  };
  const fetchMock = vi.fn().mockResolvedValue(new Response("ok"));

  new Function("self", "caches", "fetch", "Response", serviceWorkerSource)(
    selfMock,
    cachesMock,
    fetchMock,
    Response
  );

  const handler = handlers.get("fetch");
  if (!handler) throw new Error("Service worker did not register a fetch handler");
  return handler;
}

function createEvent(path: string, mode = "cors"): FetchEventLike {
  return {
    request: {
      method: "GET",
      mode,
      url: `https://starsailors.space${path}`,
    },
    respondWith: vi.fn(),
  };
}

describe("service worker request routing", () => {
  it("does not intercept Next.js RSC requests on application routes", () => {
    const event = createEvent("/game?_rsc=station");

    loadFetchHandler()(event);

    expect(event.respondWith).not.toHaveBeenCalled();
  });

  it("does not intercept API or Next.js runtime requests", () => {
    const handler = loadFetchHandler();
    const apiEvent = createEvent("/api/gameplay/page-data");
    const chunkEvent = createEvent("/_next/static/chunks/app/game.js");

    handler(apiEvent);
    handler(chunkEvent);

    expect(apiEvent.respondWith).not.toHaveBeenCalled();
    expect(chunkEvent.respondWith).not.toHaveBeenCalled();
  });

  it("keeps the offline fallback for document navigations", () => {
    const event = createEvent("/game", "navigate");

    loadFetchHandler()(event);

    expect(event.respondWith).toHaveBeenCalledOnce();
  });
});
