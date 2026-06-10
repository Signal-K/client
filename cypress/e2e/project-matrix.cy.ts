describe('Project Matrix', () => {
  it('project matrix page loads', () => {
    cy.visit('/project-matrix')
    cy.get('body').should('exist')
  })

  it('page has a title', () => {
    cy.visit('/project-matrix')
    cy.title().should('not.be.empty')
  })
})
