describe('Planets', () => {
  it('planets page loads', () => {
    cy.visit('/planets')
    cy.get('body').should('exist')
  })

  it('planets edit page loads', () => {
    cy.visit('/planets/edit')
    cy.get('body').should('exist')
  })
})
