describe('Onboarding Flow', () => {
  let createdUserId = "";
  const password = "testpassword123";

  beforeEach(() => {
    const email = `onboarding-${Date.now()}@testing.com`;

    cy.task("createSupabaseTestUser", { email, password }).then((user: any) => {
      createdUserId = String(user.id);
      expect(createdUserId).to.not.equal("");
    });

    cy.login(email, password);
    cy.window().then((win) => {
      win.localStorage.setItem("star-sailors-preferences", JSON.stringify({
        projectInterests: [],
        hasCompletedOnboarding: false,
        hasSeenStructureGuide: false,
        hasSeenDeploymentTutorial: false,
        hasSeenMineralGuide: false,
        completedTutorials: { "init-seen": true },
        structureOrder: ["telescope", "satellite", "rover", "solar"],
        telescopeFocus: null,
        lastPreferencesAsked: null,
        deviceId: "cypress-onboarding",
      }));
      win.localStorage.removeItem("ss_onboarding_step");
      win.localStorage.removeItem("ss_onboarding_project");
    });
  });

  afterEach(() => {
    if (!createdUserId) return;
    cy.task("cleanupSupabaseTestUser", { userId: createdUserId });
    createdUserId = "";
  });

  it('completes the onboarding flow successfully', () => {
    cy.intercept('GET', '/api/gameplay/profile/me', {
      statusCode: 200,
      body: { username: null },
    }).as('getOnboardingProfile');
    cy.intercept('GET', '/setup/telescope*').as('getTelescopeSetup');

    // 1. Start at onboarding page
    cy.visit('/onboarding');
    
    // 2. Initial power-up screen
    cy.contains('System').should('be.visible');
    cy.contains('Power Up Station').click();

    // 3. Project Selection
    cy.contains('Select your first project').should('be.visible');
    
    // Select "Planet Hunting"
    cy.contains('Planet Hunting').click();
    cy.contains('Continue').click();

    // 4. Structure Intro (Telescope)
    cy.contains('Telescope').should('be.visible');
    cy.contains('initialised.').should('be.visible');
    cy.contains('Start Deployment').click();

    // 5. Verify redirection to setup
    cy.wait('@getTelescopeSetup');
  });
});
