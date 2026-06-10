describe('Research', () => {
  it('research page loads', () => {
    cy.visit('/research')
    cy.get('body').should('exist')
  })

  it('page has a title', () => {
    cy.visit('/research')
    cy.title().should('not.be.empty')
  })
})
