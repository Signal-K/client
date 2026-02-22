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
      ],
    },
  },
  resolve: {
    alias: [
      { find: "@/src", replacement: path.resolve(__dirname, "src") },
      { find: "@", replacement: path.resolve(__dirname, "src") },
    ],
  },
})
