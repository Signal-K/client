describe('Navigation', () => {
  it('auth page loads', () => {
    cy.visit('/auth')
    cy.get('body').should('exist')
  })

  it('research page loads', () => {
    cy.visit('/research')
    cy.get('body').should('exist')
  })

  it('game page loads', () => {
    cy.visit('/game')
    cy.location('pathname').should('eq', '/auth')
    cy.location('search').then((search) => {
      expect(new URLSearchParams(search).get('next')).to.eq('/game')
    })
    cy.contains(/sign in|login|email|password/i).should('exist')
  })
})
