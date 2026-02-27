describe("Frontend Supabase persistence", () => {
  let createdUserId = "";
  let testEmail = "";
  const testPassword = "testpassword123";

  before(() => {
    // Suppress NEXT_REDIRECT errors
    cy.on("uncaught:exception", (err) => {
      if (err.message.includes("NEXT_REDIRECT")) return false;
      if (err.message.includes("Invalid or unexpected token")) return false;
      return true;
    });
  });

  beforeEach(() => {
    cy.request({ url: "/", failOnStatusCode: false, timeout: 10_000 })
      .its("status")
      .should("be.lessThan", 500);
    cy.waitForSupabase();

    const tag = `ui-persist-${Date.now()}`;
    testEmail = `${tag}@example.com`;

    cy.task("createSupabaseTestUser", { email: testEmail, password: testPassword }).then((user: any) => {
      createdUserId = String(user.id);
      expect(createdUserId).to.not.equal("");
      cy.wait(500); // Allow user to be fully created
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
    cy.visit("/account", { timeout: 30000 });
    cy.wait(2000);

    const fillInput = (selector: string, value: string) => {
      cy.get(selector, { timeout: 30_000 })
        .should("be.visible")
        .should("not.be.disabled")
        .click({ force: true })
        .clear({ force: true })
        .type(value, { force: true, delay: 50 });
    };

    const waitForProfile = (expectedFullName: string, requireAvatar = false, attempts = 20): void => {
      cy.task("getSupabaseProfileById", { userId: createdUserId }).then((profile: any) => {
        const hasAvatar =
          typeof profile?.avatar_url === "string" &&
          profile.avatar_url.length > 0;
        const matched =
          profile &&
          typeof profile.username === "string" &&
          profile.username.length > 0 &&
          typeof profile.full_name === "string" &&
          profile.full_name.includes(expectedFullName) &&
          (!requireAvatar || hasAvatar);

        if (matched) {
          return;
        }

        if (attempts <= 1) {
          expect(profile, "profile row").to.not.equal(null);
          expect(profile?.username).to.be.a("string").and.not.equal("");
          expect(profile?.full_name).to.be.a("string").and.include(expectedFullName);
          if (requireAvatar) {
            expect(profile?.avatar_url).to.be.a("string").and.not.equal("");
          }
          return;
        }

        cy.wait(1000);
        waitForProfile(expectedFullName, requireAvatar, attempts - 1);
      });
    };

    fillInput('[data-testid="profile-username-input"]', username);
    fillInput('[data-testid="profile-firstname-input"]', firstName);

    cy.get('[data-testid="profile-avatar-input"]', { timeout: 20000 })
      .should("exist")
      .selectFile("cypress/fixtures/avatar-test.svg", { force: true });
    
    cy.wait(1000);
    cy.get('[data-testid="profile-save-button"]', { timeout: 20000 })
      .should("be.visible")
      .should("not.be.disabled")
      .click({ force: true });
    cy.wait(2000);

    cy.url({ timeout: 20_000 }).should("not.include", "/auth");

    waitForProfile(firstName, true);
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

    cy.visit("/account", { timeout: 30000 });
    cy.wait(2000);
    fillInput('[data-testid="profile-firstname-input"]', editedFirstName);
    cy.wait(1000);
    cy.get('[data-testid="profile-save-button"]', { timeout: 20000 })
      .should("be.visible")
      .should("not.be.disabled")
      .click({ force: true });
    cy.wait(2000);
    waitForProfile(editedFirstName, false);
    cy.task("getSupabaseProfileById", { userId: createdUserId }).then((profile: any) => {
      expect(profile, "updated profile row").to.not.equal(null);
      expect(profile.full_name).to.be.a("string").and.include(editedFirstName);
      expect(profile.username).to.be.a("string").and.not.equal("");
    });
  });
});
