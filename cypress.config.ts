import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        supportFile: 'cypress/support/e2e.ts',
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
        env: {
            SKIP_USER_CREATION_TESTS: process.env.SKIP_USER_CREATION_TESTS === 'true',
        },
        viewportWidth: 1280,
        viewportHeight: 720,
        video: false,
        screenshotOnRunFailure: true,
    },
    component: {
        devServer: {
            framework: 'next',
            bundler: 'webpack',
        },
    },
});