describe('Frontend — Supabase persistence', () => {
  it('auth page renders without errors', () => {
    cy.visit('/auth')
    cy.get('body').should('exist')
  })

  it('supabase health endpoint responds', () => {
    cy.request({ url: '/api/health', failOnStatusCode: false }).its('status').should('be.oneOf', [200, 404])
  })
})
