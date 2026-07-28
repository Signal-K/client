describe('API — authentication contracts', () => {
  it('reports an unauthenticated session without exposing user data', () => {
    cy.request({
      url: '/api/auth/session',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body).to.deep.equal({ authenticated: false })
    })
  })

  it('rejects the authenticated game data endpoint when signed out', () => {
    cy.request({
      url: '/api/gameplay/page-data',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body).to.deep.equal({ error: 'Unauthorized' })
    })
  })

  it('rejects profile reads when signed out', () => {
    cy.request({
      url: '/api/gameplay/profile/me',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body).to.deep.equal({ error: 'Unauthorized' })
    })
  })

  it('validates required active-planet input before querying data', () => {
    cy.request({
      url: '/api/gameplay/active-planet',
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body).to.deep.equal({ error: 'Missing userId' })
    })
  })

  it('validates active-planet location before authenticating or querying data', () => {
    cy.request({
      method: 'POST',
      url: '/api/gameplay/active-planet',
      body: { userId: 'e2e-user', location: 'not-a-number' },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(400)
      expect(response.body).to.deep.equal({ error: 'Invalid location' })
    })
  })

  it('keeps the test auth backdoor disabled by default', () => {
    cy.request({
      method: 'POST',
      url: '/api/test/auth/login',
      body: { email: 'e2e-disabled@example.com' },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404)
      expect(response.body).to.deep.equal({ error: 'Not found' })
    })
  })
})
