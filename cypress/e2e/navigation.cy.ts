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
    cy.get('body').should('exist')
  })
})
