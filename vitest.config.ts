import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text-summary", "json-summary", "lcov"],
      include: [
        "src/lib/gameplay/**/*.ts",
        "src/utils/mineralAnalysis.ts",
        "src/utils/solarEventUtils.ts",
        "hooks/useNPSManagement.ts",
      ],
      exclude: ["**/*.d.ts", "tests/**", "node_modules/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
