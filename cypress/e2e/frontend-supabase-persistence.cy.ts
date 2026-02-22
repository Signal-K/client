describe("Frontend Supabase persistence", () => {
  let createdUserId = "";
  let testEmail = "";
  const testPassword = "testpassword123";

  beforeEach(() => {
    cy.request({ url: "/", failOnStatusCode: false, timeout: 10_000 })
      .its("status")
      .should("be.oneOf", [200, 304]);
    cy.waitForSupabase();

    const tag = `ui-persist-${Date.now()}`;
    testEmail = `${tag}@example.com`;

    cy.task("createSupabaseTestUser", { email: testEmail, password: testPassword }).then((user: any) => {
      createdUserId = String(user.id);
      expect(createdUserId).to.not.equal("");
    });
  });

  afterEach(() => {
    if (!createdUserId) return;
    cy.task("cleanupSupabaseTestUser", { userId: createdUserId });
    createdUserId = "";
  });

  it("updates profile via UI and persists row + avatar object in Supabase", () => {
    const username = `u${Date.now()}`;
    const firstName = "Baseline";
    const editedFirstName = "Updated";

    cy.login(testEmail, testPassword);
    cy.visit("/account");

    const fillInput = (selector: string, value: string) => {
      // Break chains around .clear() to avoid Cypress "page updated" detachment errors
      cy.get(selector, { timeout: 20_000 })
        .should("be.visible")
        .then(($el) => {
          cy.wrap($el).click({ force: true });
        });

      cy.get(selector).clear({ force: true });
      cy.get(selector).type(value, { force: true });
    };

    const waitForProfile = (expectedFullName: string, attempts = 8): void => {
      cy.task("getSupabaseProfileById", { userId: createdUserId }).then((profile: any) => {
        const matched =
          profile &&
          typeof profile.username === "string" &&
          profile.username.length > 0 &&
          typeof profile.full_name === "string" &&
          profile.full_name.includes(expectedFullName) &&
          typeof profile.avatar_url === "string" &&
          profile.avatar_url.length > 0;

        if (matched) {
          return;
        }

        if (attempts <= 1) {
          expect(profile, "profile row").to.not.equal(null);
          expect(profile?.username).to.be.a("string").and.not.equal("");
          expect(profile?.full_name).to.be.a("string").and.include(expectedFullName);
          return;
        }

        cy.wait(500);
        waitForProfile(expectedFullName, attempts - 1);
      });
    };

    fillInput('[data-testid="profile-username-input"]', username);
    fillInput('[data-testid="profile-firstname-input"]', firstName);

    cy.get('[data-testid="profile-avatar-input"]').selectFile("cypress/fixtures/avatar-test.svg", {
      force: true,
    });
    cy.get('[data-testid="profile-save-button"]').click({ force: true });

    cy.url({ timeout: 20_000 }).should("not.include", "/auth");

    waitForProfile(firstName);
    cy.task("getSupabaseProfileById", { userId: createdUserId }).then((profile: any) => {
      expect(profile, "profile row").to.not.equal(null);
      expect(profile.username).to.be.a("string").and.not.equal("");
      expect(profile.full_name).to.be.a("string").and.include(firstName);
      expect(profile.avatar_url).to.be.a("string").and.include("/storage/v1/object/public/avatars/");

      const marker = "/storage/v1/object/public/avatars/";
      const avatarPath = String(profile.avatar_url).split(marker)[1];
      expect(avatarPath, "avatar object path").to.be.a("string").and.not.equal("");

      cy.task("checkStorageObjectExists", {
        bucket: "avatars",
        objectPath: avatarPath,
      }).should("eq", true);
    });

    cy.visit("/account");
    fillInput('[data-testid="profile-firstname-input"]', editedFirstName);
    cy.get('[data-testid="profile-save-button"]').click({ force: true });

    waitForProfile(editedFirstName);
    cy.task("getSupabaseProfileById", { userId: createdUserId }).then((profile: any) => {
      expect(profile, "updated profile row").to.not.equal(null);
      expect(profile.full_name).to.be.a("string").and.include(editedFirstName);
      expect(profile.username).to.be.a("string").and.not.equal("");
    });
  });
});
