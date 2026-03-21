describe('Onboarding Flow', () => {
  beforeEach(() => {
    // Mock authentication
    cy.intercept('GET', '/api/auth/session', {
      statusCode: 200,
      body: {
        user: { id: 'test-user', email: 'test@example.com' },
      },
    }).as('getSession');

    // Mock user preferences to force onboarding state
    cy.intercept('GET', '/api/gameplay/profile/me', {
      statusCode: 200,
      body: { 
        hasCompletedOnboarding: false,
        projectInterests: [] 
      },
    }).as('getProfile');
  });

  it('completes the onboarding flow successfully', () => {
    // 1. Start at onboarding page
    cy.visit('/onboarding');
    
    // 2. Initial "Station Arrival" screen
    cy.contains('Station Arrival').should('be.visible');
    cy.contains('Power Up Station').click();

    // 3. Project Selection
    cy.contains('Select your first project').should('be.visible');
    
    // Select "Planet Hunting"
    cy.contains('Planet Hunting').click();
    cy.contains('Continue').click();

    // 4. Structure Intro (Telescope)
    cy.contains('Telescope initialised').should('be.visible');
    cy.contains('Start Deployment').click();

    // 5. Verify redirection to setup
    cy.url().should('include', '/setup/telescope');
  });
});
