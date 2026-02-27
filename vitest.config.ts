import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "json-summary", "lcov"],
      all: true,
      include: [
        "src/**/*.{ts,tsx}",
      ],
      exclude: [
        "**/*.d.ts",
        "tests/**",
        "node_modules/**",
        ".next/**",
        "src/**/*.test.{ts,tsx}",
        "src/**/__tests__/**",
        "src/**/types/**",
        "src/app/**",
        "src/lib/server/**",
        // Complex mission/structure components - UI compositions with extensive deps
        "src/components/deployment/missions/structures/Astronomers/**",
        "src/components/deployment/missions/structures/Meteorologists/**",
        "src/components/deployment/missions/structures/BasePlate.tsx",
        "src/components/deployment/missions/structures/Stardust/Journal.tsx",
        // Complex telescope classification viewport
        "src/components/classification/telescope/blocks/**",
        // Complex project mission shells
        "src/components/projects/Telescopes/Sunspots/SunspotShell.tsx",
        "src/components/profile/setup/ProfileSetup.tsx",
        "src/components/sections/Section.tsx",
        // Provider/PWA with browser-specific APIs
        "src/components/providers/PostHogProvider.tsx",
        "src/components/pwa/PWAPrompt.tsx",
        // Complex annotation logic with browser canvas/touch APIs
        "src/components/projects/(classifications)/Annotating/useAnnotatorLogic.tsx",
      ],
      thresholds: {
        lines: 4,
        functions: 60,
        branches: 70,
        statements: 4,
      },
    },
  },
  resolve: {
    alias: [
      { find: "@/src", replacement: path.resolve(__dirname, "src") },
      { find: "@", replacement: path.resolve(__dirname, "src") },
    ],
  },
})
