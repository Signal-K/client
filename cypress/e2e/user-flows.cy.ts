describe('User Flows', () => {
  it('auth page loads', () => {
    cy.visit('/auth')
    cy.get('body').should('exist')
  })

  it('root redirects or loads', () => {
    cy.request({ url: '/', failOnStatusCode: false }).its('status').should('be.oneOf', [200, 307, 302])
  })
})
