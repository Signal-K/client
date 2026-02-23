import { describe, it, expect } from "vitest";
import { fragmentShader } from "@/src/shared/utils/generators/PH/fragment-shader";
import { vertexShader } from "@/src/shared/utils/generators/PH/vertex-shader";

describe("fragmentShader", () => {
  it("is a non-empty string", () => {
    expect(typeof fragmentShader).toBe("string");
    expect(fragmentShader.length).toBeGreaterThan(0);
  });

  it("contains uniform time declaration", () => {
    expect(fragmentShader).toContain("uniform float time");
  });

  it("contains vUv varying", () => {
    expect(fragmentShader).toContain("varying vec2 vUv");
  });

  it("contains snoise function", () => {
    expect(fragmentShader).toContain("float snoise");
  });
});

describe("vertexShader", () => {
  it("is a non-empty string", () => {
    expect(typeof vertexShader).toBe("string");
    expect(vertexShader.length).toBeGreaterThan(0);
  });

  it("contains uniform time declaration", () => {
    expect(vertexShader).toContain("uniform float time");
  });

  it("contains vNormal varying", () => {
    expect(vertexShader).toContain("varying vec3 vNormal");
  });

  it("contains surfaceRoughness uniform", () => {
    expect(vertexShader).toContain("uniform float surfaceRoughness");
  });
});
