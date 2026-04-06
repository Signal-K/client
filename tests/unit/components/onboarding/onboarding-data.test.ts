import { describe, it, expect } from "vitest";
import { PROJECTS, SETUP_MAP } from "@/src/components/onboarding/onboarding-data";

describe("onboarding-data", () => {
  describe("PROJECTS", () => {
    it("exports an array of projects", () => {
      expect(Array.isArray(PROJECTS)).toBe(true);
      expect(PROJECTS.length).toBeGreaterThan(0);
    });

    it("each project has required fields", () => {
      for (const project of PROJECTS) {
        expect(project).toHaveProperty("id");
        expect(project).toHaveProperty("name");
        expect(project).toHaveProperty("icon");
        expect(project).toHaveProperty("description");
        expect(project).toHaveProperty("structure");
      }
    });

    it("includes planet-hunting project", () => {
      const ph = PROJECTS.find((p) => p.id === "planet-hunting");
      expect(ph).toBeDefined();
      expect(ph?.name).toBe("Planet Hunting");
      expect(ph?.structure).toBe("Telescope");
    });

    it("includes rover-training project", () => {
      const rt = PROJECTS.find((p) => p.id === "rover-training");
      expect(rt).toBeDefined();
      expect(rt?.name).toBe("Rover Training");
      expect(rt?.structure).toBe("Rover");
    });

    it("includes cloud-tracking project", () => {
      const ct = PROJECTS.find((p) => p.id === "cloud-tracking");
      expect(ct).toBeDefined();
      expect(ct?.name).toBe("Cloud Spotting");
      expect(ct?.structure).toBe("Satellite");
    });

    it("all projects have non-empty descriptions", () => {
      for (const project of PROJECTS) {
        expect(project.description.length).toBeGreaterThan(0);
      }
    });

    it("all projects have tailwind color/bg/border classes", () => {
      for (const project of PROJECTS) {
        expect(project.color).toMatch(/^text-/);
        expect(project.bg).toMatch(/^bg-/);
        expect(project.border).toMatch(/^border-/);
      }
    });
  });

  describe("SETUP_MAP", () => {
    it("is a record object", () => {
      expect(typeof SETUP_MAP).toBe("object");
    });

    it("maps planet-hunting to telescope setup route", () => {
      expect(SETUP_MAP["planet-hunting"]).toBe("/setup/telescope");
    });

    it("maps rover-training to rover setup route", () => {
      expect(SETUP_MAP["rover-training"]).toBe("/setup/rover");
    });

    it("maps cloud-tracking to satellite setup route", () => {
      expect(SETUP_MAP["cloud-tracking"]).toBe("/setup/satellite");
    });

    it("maps asteroid-hunting to telescope setup route", () => {
      expect(SETUP_MAP["asteroid-hunting"]).toBe("/setup/telescope");
    });

    it("maps ice-tracking to satellite setup route", () => {
      expect(SETUP_MAP["ice-tracking"]).toBe("/setup/satellite");
    });

    it("maps solar-monitoring to solar setup route", () => {
      expect(SETUP_MAP["solar-monitoring"]).toBe("/setup/solar");
    });

    it("all setup routes start with /setup/", () => {
      for (const route of Object.values(SETUP_MAP)) {
        expect(route).toMatch(/^\/setup\//);
      }
    });
  });
});
