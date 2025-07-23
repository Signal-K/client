describe('Authentication Flow', () => {
  beforeEach(() => {
    // Skip in CI/GitHub Actions
    if (Cypress.env('SKIP_USER_CREATION_TESTS')) {
      // @ts-ignore
      this.skip()
    }
  })

  it('user can register and login', () => {
    const email = `test-${Date.now()}@example.com`
    const password = 'testPassword123!'

    // Navigate to registration
    cy.visit('/auth/register')
    
    // Fill registration form
    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').type(password)
    cy.get('button[type="submit"]').click()
    
    // Should redirect to main page after successful registration
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    
    // Should see user dashboard elements
    cy.get('[data-testid="user-dashboard"]').should('be.visible')
  })
})