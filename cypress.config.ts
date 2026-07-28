import { defineConfig } from "cypress";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_baseUrl || "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      // Authenticated E2E access is provided by the Clerk test-ticket route.
      // Keep the flag available to specs without maintaining a second auth
      // provider or a direct database client inside Cypress.
      config.env.SKIP_USER_CREATION_TESTS = process.env.SKIP_USER_CREATION_TESTS === "true";
      config.env.E2E_TEST_AUTH_ENABLED = process.env.E2E_TEST_AUTH_ENABLED === "true";
      config.env.E2E_TEST_USER_EMAIL = process.env.E2E_TEST_USER_EMAIL || "";
      config.env.POCKETBASE_URL =
        process.env.POCKETBASE_URL ||
        process.env.NEXT_PUBLIC_POCKETBASE_URL ||
        "http://localhost:8095";
      return config;
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: Boolean(process.env.CI),
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 60000,
    responseTimeout: 60000,
    pageLoadTimeout: 120000,
    numTestsKeptInMemory: 0,
    experimentalMemoryManagement: true,
    chromeWebSecurity: false,
    retries: {
      runMode: 2,
      openMode: 0,
    },
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});
