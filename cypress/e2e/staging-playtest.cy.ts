const secret = Cypress.env('STAGING_PLAYTEST_AUTH_SECRET')
const enabled = Cypress.env('STAGING_PLAYTEST_ENABLED') === true && typeof secret === 'string' && secret.length > 0
const endpoint = '/api/v1/test/playtest'
const headers = { 'x-staging-playtest-secret': secret }

// Opt-in, staging-only (SSC-33). Provisions a namespaced Clerk user, plays
// garden onboarding plus one instrument build, then proves cleanup removed it.
if (enabled) {
  describe('Staging playtest account lifecycle', () => {
    let userId: string | undefined

    it('rejects requests without the operator secret', () => {
      cy.request({ method: 'POST', url: endpoint, failOnStatusCode: false }).its('status').should('eq', 404)
      cy.request({ method: 'POST', url: endpoint, headers: { 'x-staging-playtest-secret': 'wrong' }, failOnStatusCode: false })
        .its('status')
        .should('eq', 404)
    })

    it('plays garden onboarding and builds an instrument with a fresh account', () => {
      cy.intercept('GET', '/api/v1/classifications*').as('edgeClassifications')
      cy.request({ method: 'POST', url: endpoint, headers }).then(({ body }) => {
        userId = body.userId
        expect(body.ticket).to.be.a('string')
        cy.visit(`/auth?__clerk_ticket=${encodeURIComponent(body.ticket)}`)
      })
      cy.location('pathname', { timeout: 30000 }).should('eq', '/game')

      // Edge API rollout: the signed-in game must read its classifications from the Worker.
      cy.wait('@edgeClassifications', { timeout: 30000 }).then(({ request, response }) => {
        expect(request.headers.authorization).to.match(/^Bearer /)
        expect(response?.statusCode).to.eq(200)
      })

      cy.get('[role="dialog"]', { timeout: 30000 }).contains('A fresh garden')
      cy.contains('button', 'Hunt planets').click()
      cy.contains('button', 'Mark my plots').click()

      // The onboarding coach banner floats over the first plot at Cypress's default
      // viewport, so click the plot and slot directly rather than through the banner.
      cy.get('button[aria-label$="· plot"]', { timeout: 15000 }).first().click({ force: true })
      cy.contains('button', /^Place .* · \d+ CR$/).click()
      cy.get('button[data-slot][aria-label^="Place"]').first().click({ force: true })
      cy.get('[data-id="ssc.structure.telescope"]').should('not.have.class', 'isPlot')
    })

    // The Worker stops short of Cloudflare's 50-subrequest cap and answers 503
    // with the user kept intact, so cleanup is safe to repeat until it finishes.
    const cleanup = (attempt = 1): Cypress.Chainable =>
      cy.request({ method: 'DELETE', url: endpoint, headers, body: { userId }, failOnStatusCode: false }).then((res) => {
        if (res.status === 503 && attempt < 5) return cleanup(attempt + 1)
        expect(res.status).to.eq(200)
        expect(res.body.deleted).to.eq(true)
      })

    after(() => {
      if (!userId) return
      cleanup()
      // A second delete must 404: the account no longer exists.
      cy.request({ method: 'DELETE', url: endpoint, headers, body: { userId }, failOnStatusCode: false })
        .its('status')
        .should('eq', 404)
    })
  })
}
