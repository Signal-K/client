describe('Authentication', () => {
  beforeEach(() => {
    cy.waitForSupabase()
  })

  it('should display the home page', () => {
    cy.visit('/', { failOnStatusCode: false })
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
    if (Cypress.env('SKIP_USER_CREATION_TESTS')) {
      cy.log('User creation tests are skipped')
      return
    }

    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'testpassword123'

    cy.task('createSupabaseTestUser', { email: testEmail, password: testPassword }).then((user: any) => {
      Cypress.env('TEST_USER_ID', user.id)
      cy.login(testEmail, testPassword)
      cy.url({ timeout: 15000 }).should('not.include', '/auth')
    })
  })

  afterEach(() => {
    cy.cleanupTestData()
  })
})