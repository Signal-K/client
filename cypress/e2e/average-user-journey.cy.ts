describe('Average User Journey', () => {
  beforeEach(() => {
    // Mock successful auth
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: { id: 'test-user-avg', email: 'avg@user.com' },
      },
    }).as('getSession');

    // Mock profile
    cy.intercept('GET', '/api/gameplay/profile/me', {
      statusCode: 200,
      body: { 
        hasCompletedOnboarding: true,
        projectInterests: ['planet-hunting'] 
      },
    }).as('getProfile');

    // Mock initial game data
    cy.intercept('POST', '/api/gameplay/page-data', (req) => {
        req.reply({
            statusCode: 200,
            body: {
                profile: { username: "AvgSailor", classificationPoints: 100 },
                classifications: [],
                linkedAnomalies: [],
                activityFeed: [],
                visibleStructures: { telescope: true, satellites: false, rovers: false, solar: true }
            }
        })
    }).as('getPageData');
  });

  it('can navigate the station, deploy structures, and understand the loop', () => {
    cy.visit('/game');

    // 1. Verify "Home" (Base) state
    cy.contains('Sector Radar').should('be.visible');
    cy.contains('Station Systems').should('be.visible');

    // 2. Navigate to Telescope
    cy.contains('Telescope').click();
    cy.url().should('include', 'view=telescope');
    cy.contains('Telescope Control').should('be.visible');

    // 3. Simulate "Understanding" -> Check for help/context
    // Assuming there's some help text or clear CTA
    cy.contains('Deploy').should('exist'); // Button to deploy

    // 4. Return to Base
    cy.get('button[aria-label="Close viewport"]').click(); // Or however close is implemented
    cy.url().should('not.include', 'view=telescope');

    // 5. Check another system (Solar)
    cy.contains('Solar Array').click();
    cy.url().should('include', 'view=solar');
    cy.contains('Solar Output').should('exist'); // Hypothetical text

    // 6. Return (Retention Loop check - user comes back)
    cy.visit('/game'); // Simulate refresh/return
    cy.contains('Sector Radar').should('be.visible');
  });
});
