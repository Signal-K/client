describe('Contributions — critical paths', () => {
  it('user profile page loads', () => {
    cy.visit('/contributions')
    cy.get('body').should('exist')
  })

  it('page has a title', () => {
    cy.visit('/contributions')
    cy.title().should('not.be.empty')
  })
})
