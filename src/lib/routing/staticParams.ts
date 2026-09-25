// SSC-31: the Cloudflare build is a static export, so each dynamic page is
// exported once with every param set to this placeholder and the Worker serves
// that HTML for any real id. The params baked into that page are therefore the
// placeholder; the real ones only exist in the browser URL.
export const STATIC_PARAM_PLACEHOLDER = "__static__";

/** generateStaticParams() result exporting a dynamic page once. */
export function placeholderParams<K extends string>(...names: K[]): Array<Record<K, string>> {
  return [Object.fromEntries(names.map((name) => [name, STATIC_PARAM_PLACEHOLDER])) as Record<K, string>];
}

/** Reads `[name]` segments of `pattern` (e.g. "/posts/[id]") from `pathname`. */
export function matchRouteParams(pattern: string, pathname: string): Record<string, string> | null {
  const expected = pattern.split("/").filter(Boolean);
  const actual = pathname.split("/").filter(Boolean);
  if (expected.length !== actual.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < expected.length; i++) {
    const param = expected[i].match(/^\[(\w+)\]$/);
    let segment: string;
    try {
      segment = decodeURIComponent(actual[i]);
    } catch {
      return null;
    }
    if (param) {
      if (segment === STATIC_PARAM_PLACEHOLDER) return null;
      params[param[1]] = segment;
    } else if (expected[i] !== segment) {
      return null;
    }
  }
  return params;
}
