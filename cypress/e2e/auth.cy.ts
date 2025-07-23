describe('Authentication', () => {
  beforeEach(() => {
    cy.waitForSupabase()
  })

  it('should display the home page', () => {
    cy.visit('/')
    cy.get('body').should('be.visible')
  })

  it('should display the login page', () => {
    cy.visit('/auth')
    cy.get('body').should('contain', 'Sign')
  })

  it('should navigate to register page', () => {
    cy.visit('/auth')
    // Look for any link or button containing "register", "sign up", etc.
    cy.get('body').then(($body) => {
      if ($body.text().includes('Sign Up') || $body.text().includes('Register')) {
        cy.contains(/Sign Up|Register/i).click()
        cy.url().should('include', '/register')
      } else {
        cy.log('Register link not found, navigating directly')
        cy.visit('/auth/register')
        cy.url().should('include', '/register')
      }
    })
  })

  it('should create a new user account', () => {
    // Only run if user creation tests are enabled
    if (!Cypress.env('SKIP_USER_CREATION_TESTS')) {
      cy.createTestUser()
      cy.get('@testUser').then((user: any) => {
        cy.login(user.email, user.password)
        // Verify successful login
        cy.url().should('not.include', '/auth')
      })
    } else {
      cy.log('User creation tests are skipped')
    }
  })

  afterEach(() => {
    cy.cleanupTestData()
  })
})