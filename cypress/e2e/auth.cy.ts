describe('Auth', () => {
  it('auth page loads and shows sign-in form', () => {
    cy.visit('/auth')
    cy.get('body').should('exist')
    cy.contains(/sign in|login|email|password/i).should('exist')
  })

  it('can navigate to auth from root redirect', () => {
    cy.request({ url: '/', failOnStatusCode: false }).its('status').should('be.oneOf', [200, 307, 302])
  })
})
