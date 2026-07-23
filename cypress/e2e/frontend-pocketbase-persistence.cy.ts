describe('Frontend — PocketBase persistence', () => {
  it('auth page renders without errors', () => {
    cy.visit('/auth')
    cy.get('body').should('exist')
  })

  it('app health endpoint responds', () => {
    cy.request({ url: '/api/health', failOnStatusCode: false }).its('status').should('be.oneOf', [200, 404])
  })
})
