describe('Average User Journey', () => {
  let createdUserId = "";
  const password = "testpassword123";
  const returningUserPreferences = {
    projectInterests: ["planet-hunting", "solar-monitoring"],
    hasCompletedOnboarding: true,
    hasSeenStructureGuide: true,
    hasSeenDeploymentTutorial: true,
    hasSeenMineralGuide: true,
    completedTutorials: {
      "init-seen": true,
      "telescope-deploy": true,
      "satellite-deploy": true,
      "rover-deploy": true,
      "solar-deploy": true,
    },
    structureOrder: ["telescope", "satellite", "rover", "solar"],
    telescopeFocus: null,
    lastPreferencesAsked: new Date().toISOString(),
    deviceId: "cypress-average-user",
  };

  beforeEach(() => {
    const email = `avg-${Date.now()}@testing.com`;

    cy.task("createSupabaseTestUser", { email, password }).then((user: any) => {
      createdUserId = String(user.id);
      expect(createdUserId).to.not.equal("");
    });

    cy.login(email, password);

    // Mock profile
    cy.intercept('GET', '/api/gameplay/profile/me', {
      statusCode: 200,
      body: { 
        hasCompletedOnboarding: true,
        projectInterests: ['planet-hunting'] 
      },
    }).as('getProfile');

    // Mock initial game data
    cy.intercept('GET', '/api/gameplay/page-data', (req) => {
        req.reply({
            statusCode: 200,
            body: {
                profile: { username: "AvgSailor", classificationPoints: 100 },
                classifications: [],
                linkedAnomalies: [],
                activityFeed: [],
                otherClassifications: [],
                visibleStructures: { telescope: true, satellites: false, rovers: false, balloons: true },
                hubLeaderboard: { entries: [], currentUser: null },
                referralCode: null,
                referralCount: 0,
                hasReferral: false,
                hasRoverMineralDeposits: false,
                incompletePlanet: null,
                planetTargets: [],
            }
        })
    }).as('getPageData');
  });

  afterEach(() => {
    if (!createdUserId) return;
    cy.task("cleanupSupabaseTestUser", { userId: createdUserId });
    createdUserId = "";
  });

  it('can navigate the station, deploy structures, and understand the loop', () => {
    const visitGameAsReturningUser = () => {
      cy.visit('/game', {
        onBeforeLoad(win) {
          win.localStorage.setItem("star-sailors-device-id", returningUserPreferences.deviceId);
          win.localStorage.setItem("star-sailors-preferences", JSON.stringify(returningUserPreferences));
        },
      });
    };

    visitGameAsReturningUser();
    cy.wait('@getPageData');

    // 1. Verify "Home" (Base) state
    cy.contains('Sector Radar').should('be.visible');
    cy.contains('Station Systems').should('be.visible');

    // 2. Navigate to Telescope
    cy.contains('[role="button"]', 'Telescope').click();
    cy.url().should('include', 'view=telescope');
    cy.contains('Telescope Array').should('be.visible');

    // 3. Simulate "Understanding" -> Check for help/context
    // Assuming there's some help text or clear CTA
    cy.contains('Deploy').should('exist'); // Button to deploy

    // 4. Return to Base
    cy.get('button[aria-label="Return to mission control"]').click();
    cy.url().should('not.include', 'view=telescope');
    visitGameAsReturningUser();
    cy.wait('@getPageData');
    cy.contains('Station Systems').should('be.visible');

    // 5. Check another system (Solar)
    cy.contains('[role="button"]', 'Solar Array').scrollIntoView().should('be.visible').click();
    cy.url().should('include', 'view=solar');
    cy.contains('Solar Watch').should('exist');

    // 6. Return (Retention Loop check - user comes back)
    visitGameAsReturningUser();
    cy.contains('Sector Radar').should('be.visible');
  });
});
