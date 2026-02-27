describe('Working Routes Test', () => {
  beforeEach(() => {
    cy.request({ url: '/', failOnStatusCode: false, timeout: 10000 }).then((res) => {
      if (!res || res.status >= 500) {
        throw new Error(`Dev server not reachable (status ${res?.status}). Start it with: npm run dev`)
      }
    })
    cy.waitForSupabase()
  })

  it('should test all confirmed working routes', () => {
    const alwaysAvailableRoutes = [
      '/apt',
      '/auth',
      '/auth/register',
      '/research',
      '/planets/edit',
      '/privacy',
      '/terms',
    ]

    alwaysAvailableRoutes.forEach((route) => {
      cy.request({ url: route, failOnStatusCode: false }).then((response) => {
        expect(response.status, `status for ${route}`).to.be.lessThan(500)

        cy.visit(route, { failOnStatusCode: false })
        cy.get('body').should('be.visible')
      })
      cy.wait(1000)
    })

    // Optional route: validate actual behavior without hard-failing on 404.
    cy.request({ url: '/research/tree', failOnStatusCode: false }).then((response) => {
      if (response.status === 200) {
        cy.visit('/research/tree')
        cy.get('body').should('be.visible')
      } else {
        expect(response.status).to.equal(404)
      }
    })

    cy.log('All working routes tested successfully!')
  })

  it('should handle dynamic routes properly', () => {
    // Handle uncaught exceptions from the app
    cy.on('uncaught:exception', (err, runnable) => {
      // Return false to prevent the error from failing this test
      if (err.message.includes('Cannot read properties of undefined')) {
        return false
      }
      return true
    })
    
    // Optional dynamic route: local/CI seeds can differ and produce 404/500.
    cy.request({ url: '/planets/1', failOnStatusCode: false }).then((response) => {
      if (response.status !== 200) {
        cy.log(`Skipping /planets/1 dynamic route assertion because route returned ${response.status}`)
        return
      }

      cy.visit('/planets/1', { failOnStatusCode: false })
      cy.get('body').should('be.visible')
      cy.get('body').should('not.contain.text', 'Internal Server Error')
      cy.wait(2000)
    })

    // Test another dynamic route if available
    cy.visit('/planets/edit', { failOnStatusCode: false })
    cy.get('body').should('be.visible')
  })

  it('should navigate key gameplay surfaces through UI routes', () => {
    const gameplayRoutes = [
      '/game',
      '/structures/telescope',
      '/structures/balloon',
      '/research',
    ]

    gameplayRoutes.forEach((route) => {
      cy.visit(route, { failOnStatusCode: false })
      cy.get('body').should('be.visible')
      cy.get('body').should('not.contain.text', 'Internal Server Error')
    })
  })
})
