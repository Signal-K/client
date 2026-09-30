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
      // A freshly written Worker secret can take a few seconds to reach every edge, and the
      // endpoint answers 404 until then. A 404 provisions nothing, so retrying is safe.
      const provision = (attempt = 1): Cypress.Chainable<Cypress.Response<any>> =>
        cy.request({ method: 'POST', url: endpoint, headers, failOnStatusCode: false }).then((res) => {
          if (res.status === 404 && attempt < 8) return cy.wait(5000).then(() => provision(attempt + 1))
          expect(res.status).to.eq(200)
          return cy.wrap(res)
        })
      provision().then(({ body }) => {
        userId = body.userId
        expect(body.ticket).to.be.a('string')
        cy.visit(`/auth?__clerk_ticket=${encodeURIComponent(body.ticket)}`)
      })
      cy.location('pathname', { timeout: 30000 }).should('eq', '/game')

      // Edge API rollout: the game reads most data lazily, so prove the Worker directly with the
      // signed-in Clerk session's own token (issuer, authorized party and identity all checked).
      cy.window({ timeout: 30000 })
        .should((win) => expect((win as any).Clerk?.session, 'Clerk session').to.exist)
        .then((win) => cy.wrap((win as any).Clerk.session.getToken(), { timeout: 15000 }))
        .then((token) => {
          const auth = { authorization: `Bearer ${token}` }
          const claims = JSON.parse(atob(String(token).split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
          const seen = `azp=${claims.azp} iss=${claims.iss}`
          cy.request({ url: '/api/v1/research/summary', headers: auth, failOnStatusCode: false }).then(({ status, body }) => {
            expect(status, `research summary (${seen}) ${JSON.stringify(body)}`).to.eq(200)
            expect(body.authenticated).to.eq(true)
          })
          cy.request({ url: `/api/v1/classifications?author=${encodeURIComponent(userId as string)}&limit=5`, headers: auth })
            .its('status')
            .should('eq', 200)

          // SSC-38: repeat the signed-in reads so the per-route CPU measurement has warm-isolate
          // samples, not just the one cold call. Statuses are not asserted here.
          for (let i = 0; i < 5; i++) {
            for (const path of ['/api/v1/research/summary', '/api/gameplay/hub/bootstrap', '/api/gameplay/active-planet']) {
              cy.request({ url: path, headers: auth, failOnStatusCode: false })
            }
          }
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
