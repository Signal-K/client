describe('Working Routes', () => {
  const routes = ['/auth', '/research', '/game', '/planets', '/contributions']

  routes.forEach((route) => {
    it(`${route} responds`, () => {
      cy.request({ url: route, failOnStatusCode: false }).its('status').should('be.oneOf', [200, 307, 302, 308])
    })
  })
})
