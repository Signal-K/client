// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import code coverage support (disabled - incompatible with Cypress 14)
// import '@cypress/code-coverage/support';

// Import commands.ts using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Ignore Next.js internal errors that are not real failures
Cypress.on('uncaught:exception', (err) => {
  // Next.js throws NEXT_REDIRECT internally when redirect() is called in a
  // server component — this is expected behaviour, not a bug.
  if (err.message.includes('NEXT_REDIRECT')) {
    return false
  }
})

// Add custom assertions
declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom commands here if needed
      login(email: string, password: string): Chainable<void>
      createTestUser(): Chainable<void>
      waitForSupabase(): Chainable<void>
      cleanupTestData(): Chainable<void>
    }
  }
}