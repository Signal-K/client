import { describe, it, expect } from "vitest";
import { cn } from "@/src/shared/utils";

describe("cn (class name utility)", () => {
  it("returns a single class unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("merges multiple class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("ignores falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("ignores empty string", () => {
    expect(cn("a", "", "b")).toBe("a b");
  });

  it("handles conditional objects", () => {
    expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe("text-red-500");
  });

  it("resolves tailwind conflicting classes (last wins)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("resolves conflicting text color classes", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles array-style inputs", () => {
    expect(cn(["a", "b"], "c")).toBe("a b c");
  });

  it("handles mixed conditional and static classes", () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn("base", isActive && "active", isDisabled && "disabled")).toBe("base active");
  });

  it("returns empty string when all inputs are falsy", () => {
    expect(cn(false, undefined, null, "")).toBe("");
  });
});
