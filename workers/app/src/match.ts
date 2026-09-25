import type { RouteSegment } from "./generated/api-routes";

export type Params = Record<string, string | string[]>;

/** Matches a decoded-segment path against a generated pattern. Tables are pre-sorted most specific first. */
export function matchSegments(segments: RouteSegment[], parts: string[]): Params | null {
  const params: Params = {};
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (seg.kind === "rest") {
      const rest = parts.slice(i);
      if (rest.length === 0) return null;
      params[seg.name] = rest;
      return params;
    }
    const part = parts[i];
    if (part === undefined) return null;
    if (seg.kind === "literal") {
      if (seg.value !== part) return null;
    } else {
      params[seg.name] = part;
    }
  }
  return parts.length === segments.length ? params : null;
}

export function pathParts(pathname: string): string[] | null {
  try {
    return pathname.split("/").filter(Boolean).map(decodeURIComponent);
  } catch {
    return null;
  }
}
