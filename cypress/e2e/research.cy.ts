describe('Research Features', () => {
  beforeEach(() => {
    cy.waitForSupabase()
  })

  it('should display research page', () => {
    cy.visit('/research')
    cy.get('body').should('be.visible')
    cy.wait(2000)
  })

  it('should navigate to research tree if available', () => {
    cy.visit('/research/tree')
    cy.get('body').should('be.visible')
    cy.url().should('include', '/research/tree')
  })

  it('should handle research interactions', () => {
    cy.visit('/research')
    cy.wait(2000)
    
    // Look for interactive research elements
    cy.get('body').then(($body) => {
      const researchSelectors = [
        '[data-testid*="research"]',
        '.research-item',
        '.research-card',
        'button[data-research-id]'
      ]
      
      researchSelectors.forEach(selector => {
        if ($body.find(selector).length > 0) {
          cy.get(selector).first().should('be.visible')
        }
      })
    })
  })
})
