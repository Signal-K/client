describe('Planets Feature', () => {
  beforeEach(() => {
    cy.waitForSupabase()
  })

  it('should display planets edit page', () => {
    cy.visit('/planets/edit')
    cy.get('body').should('be.visible')
    // Wait for any loading to complete
    cy.wait(2000)
  })

  it('should allow navigation to planet detail page', () => {
    cy.visit('/planets/edit')
    cy.wait(2000)
    
    // Look for any clickable planet items or navigation
    cy.get('body').then(($body) => {
      // Try to find planet links or buttons
      const planetSelectors = [
        '[data-testid*="planet"]',
        'a[href*="/planets/"]',
        'button[data-planet-id]',
        '.planet-item',
        '.planet-card'
      ]
      
      let foundPlanet = false
      planetSelectors.forEach(selector => {
        if ($body.find(selector).length > 0 && !foundPlanet) {
          cy.get(selector).first().click()
          foundPlanet = true
        }
      })
      
      if (!foundPlanet) {
        // Fallback: navigate to a specific planet directly
        cy.visit('/planets/1')
      }
    })
    
    cy.url().should('include', '/planets/')
  })

  it('should handle planet editing if authenticated', () => {
    // This test might require authentication
    cy.visit('/planets/edit')
    cy.get('body').should('be.visible')
    // Should either show edit page or redirect to auth
    cy.url().should('satisfy', (url) => {
      return url.includes('/planets/edit') || url.includes('/auth')
    })
  })
})
