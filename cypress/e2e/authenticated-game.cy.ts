const authEnabled = Cypress.env('E2E_TEST_AUTH_ENABLED') === true
const testUserEmail = Cypress.env('E2E_TEST_USER_EMAIL')

// This suite is deliberately opt-in. It only exists when the environment has
// both the test-only ticket endpoint enabled and a pre-created Clerk fixture.
// The regular unauthenticated suite remains runnable without privileged auth.
if (authEnabled && typeof testUserEmail === 'string' && testUserEmail.length > 0) {
  describe('Authenticated game boot', () => {
    beforeEach(() => {
      cy.request('POST', '/api/test/auth/login', { email: testUserEmail }).then(({ body }) => {
        expect(body).to.have.property('ticket').and.be.a('string')
        cy.visit(`/auth?__clerk_ticket=${encodeURIComponent(body.ticket)}`)
        cy.location('pathname', { timeout: 30000 }).should('eq', '/game')
      })
    })

    it('loads the authenticated game shell', () => {
      cy.contains(/control station|game|planet/i).should('exist')
    })

    it('loads protected game data and profile contracts', () => {
      cy.request('/api/gameplay/page-data').then((pageData) => {
        expect(pageData.status).to.eq(200)
        expect(pageData.body).to.be.an('object')
      })

      cy.request('/api/gameplay/profile/me').then((profile) => {
        expect(profile.status).to.eq(200)
        expect(profile.body).to.include.all.keys(
          'avatar_url',
          'username',
          'full_name',
          'referral_code',
          'location',
        )
      })
    })
  })
}
