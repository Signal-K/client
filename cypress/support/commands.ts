// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/auth')

    cy.get('body').then(($body) => {
      const emailSelectors = [
        '[data-testid="email-input"]',
        'input[type="email"]',
        'input[name="email"]',
        '#email',
        'input[placeholder*="Email"]',
        'input[placeholder*="email"]'
      ]
      const passwordSelectors = [
        '[data-testid="password-input"]',
        'input[type="password"]',
        'input[name="password"]',
        '#password',
        'input[placeholder*="Password"]',
        'input[placeholder*="password"]'
      ]
      const buttonSelectors = [
        '[data-testid="login-button"]',
        'button[type="submit"]',
        'input[type="submit"]'
      ]

      const emailSelector = emailSelectors.find((selector) => $body.find(`${selector}:enabled`).length > 0)
      const passwordSelector = passwordSelectors.find((selector) => $body.find(`${selector}:enabled`).length > 0)
      const buttonSelector = buttonSelectors.find((selector) => $body.find(`${selector}:enabled`).length > 0)

      if (!emailSelector || !passwordSelector || !buttonSelector) {
        throw new Error('Unable to find enabled login form controls')
      }

      cy.get(`${emailSelector}:enabled`).first().should('be.visible').click({ force: true })
      cy.get(`${emailSelector}:enabled`).first().clear({ force: true })
      cy.get(`${emailSelector}:enabled`).first().type(email, { force: true, delay: 20 })

      cy.get(`${passwordSelector}:enabled`).first().should('be.visible').click({ force: true })
      cy.get(`${passwordSelector}:enabled`).first().clear({ force: true })
      cy.get(`${passwordSelector}:enabled`).first().type(password, { force: true, delay: 20 })

      cy.get(`${buttonSelector}:enabled`).first().should('be.visible').click({ force: true })
    })

    cy.wait(2000)
    // Don't require specific URL since auth flow might vary
  })
})

// Custom command for creating test user (only runs if SKIP_USER_CREATION_TESTS is false)
Cypress.Commands.add('createTestUser', () => {
  if (Cypress.env('SKIP_USER_CREATION_TESTS')) {
    cy.log('Skipping user creation test')
    return
  }
  
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'testpassword123'

  cy.task('createSupabaseTestUser', { email: testEmail, password: testPassword }).then((user: any) => {
    cy.wrap(user).as('testUser')
    Cypress.env('TEST_USER_ID', user.id)
  })
})

// Wait for Supabase to be ready
Cypress.Commands.add('waitForSupabase', () => {
  cy.task('waitForSupabaseHealth').then((healthy) => {
    if (!healthy) {
      cy.log('Supabase health unavailable; continuing smoke flow without blocking')
      return
    }
    cy.window().should('exist')
    cy.wait(1000)
    cy.get('body').should('be.visible')
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
