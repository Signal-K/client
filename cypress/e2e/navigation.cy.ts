describe('Navigation', () => {
  beforeEach(() => {
    cy.waitForSupabase()
    cy.visit('/')
  })

  it('should load the home page', () => {
    // Unauthenticated landings can stay on "/" or redirect to "/apt".
    cy.url().should('satisfy', (url) => {
      return url.endsWith('/') || url.includes('/apt')
    })
    cy.get('body').should('be.visible')
  })

  it('should navigate to planets edit page', () => {
    cy.visit('/planets/edit', { failOnStatusCode: false })
    cy.url().should('include', '/planets/edit')
  })

  it('should navigate to research page', () => {
    cy.visit('/research')
    cy.url().should('include', '/research')
  })

  it('should navigate to account page (if authenticated)', () => {
    cy.visit('/account')
    // Should either show account page or redirect to auth
    cy.url().should('satisfy', (url) => {
      return url.includes('/account') || url.includes('/auth')
    })
  })

  it('should handle 404 pages gracefully', () => {
    cy.visit('/non-existent-page', { failOnStatusCode: false })
    // Should show some kind of error or redirect
    cy.get('body').should('be.visible')
  })
})
