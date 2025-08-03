import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        baseUrl: process.env.CYPRESS_baseUrl || 'http://localhost:3000',
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
        video: process.env.CI ? true : false,
        screenshotOnRunFailure: true,
        defaultCommandTimeout: 10000,
        requestTimeout: 10000,
        responseTimeout: 10000,
        pageLoadTimeout: 30000,
        // Docker-specific settings
        chromeWebSecurity: false,
        retries: {
            runMode: 2,
            openMode: 0
        }
    },
    component: {
        devServer: {
            framework: 'next',
            bundler: 'webpack',
        },
    },
});