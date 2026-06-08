describe('Smoke — public routes', () => {
  it('auth page loads', () => {
    cy.visit('/auth')
    cy.get('body').should('exist')
  })

  it('page has a title', () => {
    cy.visit('/auth')
    cy.title().should('not.be.empty')
  })

  it('root redirects or loads', () => {
    cy.request({ url: '/', failOnStatusCode: false }).its('status').should('be.oneOf', [200, 307, 302])
  })
})

describe('Smoke — API health', () => {
  it('next.js health endpoint responds', () => {
    cy.request({ url: '/_next/static', failOnStatusCode: false }).its('status').should('not.eq', 500)
  })
})
