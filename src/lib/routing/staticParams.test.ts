import { describe, expect, it } from "vitest";

import { STATIC_PARAM_PLACEHOLDER, matchRouteParams, placeholderParams } from "./staticParams";

describe("placeholderParams", () => {
  it("exports each dynamic page once with every param set to the placeholder", () => {
    expect(placeholderParams("project", "id")).toEqual([{ project: STATIC_PARAM_PLACEHOLDER, id: STATIC_PARAM_PLACEHOLDER }]);
  });
});

describe("matchRouteParams", () => {
  it("reads params from the real URL", () => {
    expect(matchRouteParams("/posts/[id]", "/posts/42")).toEqual({ id: "42" });
    expect(matchRouteParams("/structures/balloon/[project]/[id]/[mission]", "/structures/balloon/clouds/an-7/one")).toEqual({
      project: "clouds",
      id: "an-7",
      mission: "one",
    });
  });

  it("decodes segments and ignores a trailing slash", () => {
    expect(matchRouteParams("/posts/[id]", "/posts/a%20b/")).toEqual({ id: "a b" });
  });

  it("returns null for other routes, malformed escapes and the export placeholder", () => {
    expect(matchRouteParams("/posts/[id]", "/posts/surveyor/1")).toBeNull();
    expect(matchRouteParams("/posts/[id]", "/planets/1")).toBeNull();
    expect(matchRouteParams("/posts/[id]", "/posts/%E0%A4%A")).toBeNull();
    expect(matchRouteParams("/posts/[id]", `/posts/${STATIC_PARAM_PLACEHOLDER}`)).toBeNull();
  });
});
