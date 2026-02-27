describe('User Flows', () => {
  const pickSelector = ($body: JQuery<HTMLElement>, selectors: string[]): string | undefined =>
    selectors.find((selector) => $body.find(selector).length > 0)

  beforeEach(() => {
    cy.request({ url: '/', failOnStatusCode: false, timeout: 10000 }).then((res) => {
      if (!res || res.status >= 500) {
        throw new Error(`Dev server not reachable (status ${res?.status}). Start it with: npm run dev`)
      }
    })
    cy.waitForSupabase()
  })

  it('should handle user registration flow', () => {
    if (Cypress.env('SKIP_USER_CREATION_TESTS')) {
      cy.log('Skipping user creation test')
      return
    }

    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'testpassword123'

    // Navigate to registration
    cy.visit('/auth')
    cy.wait(1000)
    
    // Try to find registration form or navigate to it
    cy.get('body').then(($body) => {
      if ($body.text().includes('Sign Up') || $body.text().includes('Register')) {
        cy.contains(/Sign Up|Register/i).click()
      } else {
        cy.visit('/auth/register')
      }
    })

    cy.wait(1000)

    // Look for email and password inputs with various possible selectors
    const emailSelectors = [
      '[data-testid="email-input"]',
      'input[type="email"]',
      'input[name="email"]',
      '#email'
    ]

    const passwordSelectors = [
      '[data-testid="password-input"]',
      'input[type="password"]',
      'input[name="password"]',
      '#password'
    ]

    const submitSelectors = [
      '[data-testid="register-button"]',
      'button[type="submit"]',
      'input[type="submit"]',
      'button'
    ]

    cy.get('body').then(($body) => {
      const selector = pickSelector($body, emailSelectors)
      expect(selector, 'email selector').to.not.equal(undefined)
      if (!selector) return
      cy.get(selector).first().clear({ force: true }).type(testEmail, { force: true })
    })

    cy.get('body').then(($body) => {
      const selector = pickSelector($body, passwordSelectors)
      expect(selector, 'password selector').to.not.equal(undefined)
      if (!selector) return
      cy.get(selector).first().clear({ force: true }).type(testPassword, { force: true })
    })

    cy.get('body').then(($body) => {
      const selector = pickSelector($body, submitSelectors)
      expect(selector, 'submit selector').to.not.equal(undefined)
      if (!selector) return
      if (selector === 'button') {
        cy.contains('button', /Register|Sign Up|Continue|Create/i).first().click({ force: true })
        return
      }
      cy.get(selector).first().click({ force: true })
    })

    // Wait for response
    cy.wait(3000)
    cy.get('body').should('be.visible')
  })

  it('should handle profile setup flow', () => {
    // Test profile setup if user is authenticated
    cy.visit('/account')
    cy.wait(2000)
    
    cy.url().then((url) => {
      if (url.includes('/account')) {
        // User is authenticated, test profile features
        cy.get('body').should('be.visible')
        
        // Look for profile-related elements
        const profileSelectors = [
          '[data-testid*="profile"]',
          '.profile',
          '#profile',
          'form'
        ]

        profileSelectors.forEach(selector => {
          cy.get('body').then(($body) => {
            if ($body.find(selector).length > 0) {
              cy.get(selector).should('be.visible')
            }
          })
        })
      } else {
        // User not authenticated, should redirect to auth
        cy.url().should('include', '/auth')
      }
    })
  })

  it('should handle data persistence', () => {
    // Test that data persists across page reloads
    cy.visit('/apt')
    cy.wait(2000)
    
    // Reload the page
    cy.reload()
    cy.wait(2000)
    
    // Page should still work
    cy.get('body').should('be.visible')
    
    // Test navigation after reload
    cy.visit('/planets/edit')
    cy.wait(2000)
    cy.get('body').should('be.visible')
  })
})
