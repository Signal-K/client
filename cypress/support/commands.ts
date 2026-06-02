// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.request({
      method: 'POST',
      url: '/api/test/auth/login',
      body: { email, password },
      failOnStatusCode: true,
    })

    cy.visit('/game', { timeout: 30000 })
    // Verify we're not on auth page anymore
    cy.url({ timeout: 15000 }).should('not.include', '/auth')
  })
})

// Custom command for creating test user (only runs if SKIP_USER_CREATION_TESTS is false)
Cypress.Commands.add('createTestUser', () => {
  if (Cypress.env('SKIP_USER_CREATION_TESTS')) {
    cy.log('Skipping user creation test')
    return
  }
  
  const testEmail = `test-${Date.now()}@testing.com`
  const testPassword = 'testpassword123'

  cy.task('createSupabaseTestUser', { email: testEmail, password: testPassword }).then((user: any) => {
    cy.wrap(user).as('testUser')
    Cypress.env('TEST_USER_ID', user.id)
  })
})

// Wait for Supabase to be ready
Cypress.Commands.add('waitForSupabase', () => {
  cy.task('waitForSupabaseHealth', null, { timeout: 10000 }).then((healthy) => {
    if (!healthy) {
      cy.log('⚠ Supabase health check failed; continuing anyway')
    }
    cy.wait(1000)
  })
})

// Cleanup test data (useful for local testing)
Cypress.Commands.add('cleanupTestData', () => {
  if (Cypress.env('SKIP_USER_CREATION_TESTS')) return

  const userId = Cypress.env('TEST_USER_ID')
  if (userId) {
    cy.task('cleanupSupabaseTestUser', { userId })
    Cypress.env('TEST_USER_ID', null)
  }
})
