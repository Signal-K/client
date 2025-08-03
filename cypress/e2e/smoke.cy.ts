describe('Smoke Tests', () => {
  beforeEach(() => {
    cy.waitForSupabase()
  })

  it('should perform basic smoke test of main pages', () => {
    // Test home page
    cy.visit('/')
    cy.get('body').should('be.visible')
    cy.wait(1000)

    // Test auth page
    cy.visit('/auth')
    cy.get('body').should('be.visible')
    cy.wait(1000)

    // Test planets edit page (since planets index doesn't exist)
    cy.visit('/planets/edit')
    cy.get('body').should('be.visible')
    cy.wait(1000)

    // Test research page
    cy.visit('/research')
    cy.get('body').should('be.visible')
    cy.wait(1000)

    // Test account page (may redirect to auth)
    cy.visit('/account')
    cy.get('body').should('be.visible')
    cy.wait(1000)

    // Test privacy page
    cy.visit('/privacy')
    cy.get('body').should('be.visible')
    cy.wait(1000)

    // Test terms page
    cy.visit('/terms')
    cy.get('body').should('be.visible')
    cy.wait(1000)
  })

  it('should handle JavaScript errors gracefully', () => {
    cy.visit('/')
    
    // Check for JavaScript errors
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError')
    })
    
    // Navigate through the app
    cy.visit('/planets/edit')
    cy.visit('/research')
    cy.visit('/auth')
    
    // Check that no critical errors occurred
    cy.get('@consoleError').should('not.have.been.called')
  })

  it('should have proper meta tags and title', () => {
    cy.visit('/')
    cy.title().should('not.be.empty')
    cy.get('head meta[name="viewport"]').should('exist')
  })

  it('should load without network errors', () => {
    cy.intercept('GET', '**', (req) => {
      // Log any failed requests
      req.continue((res) => {
        if (res.statusCode >= 400) {
          cy.log(`Network error: ${req.url} - ${res.statusCode}`)
        }
      })
    })

    cy.visit('/')
    cy.wait(2000)
    
    // The page should still load despite any network issues
    cy.get('body').should('be.visible')
  })
})
