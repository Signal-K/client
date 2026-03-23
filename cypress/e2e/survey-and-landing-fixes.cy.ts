/**
 * Minimal smoke tests for the frontend fixes:
 *  1. VariantSwitcher is gone — no "V2 Dark / V3 Editorial / …" bar on the landing page
 *  2. Landing page has a direct "Launch" CTA visible in the mobile header
 *     (users must not need the hamburger menu to reach the game)
 *  3. Unauthenticated users are NOT redirected away from "/" (landing stays up)
 *  4. "/game" redirects unauthenticated users away (protected route still gated)
 */

describe("Landing page & survey UX fixes", () => {
  beforeEach(() => {
    cy.waitForSupabase();
  });

  // ── 1. No VariantSwitcher ────────────────────────────────────────────────
  it("landing page does not render the variant-switcher nav bar", () => {
    cy.visit("/");
    // The VariantSwitcher used an aria-label of "Landing page variant switcher"
    cy.get('[aria-label="Landing page variant switcher"]').should("not.exist");
    // Also confirm the variant labels are absent
    cy.contains("V2 Dark").should("not.exist");
    cy.contains("V3 Editorial").should("not.exist");
  });

  // ── 2. Mobile header has a direct "Launch" CTA ───────────────────────────
  it("mobile viewport shows a Launch button in the header without opening the hamburger", () => {
    cy.viewport("iphone-x");
    cy.visit("/");

    // The button text is "Launch →" and should be visible without any interaction
    cy.get("header").within(() => {
      cy.contains("Launch").should("be.visible");
    });

    // Confirm it links to /auth
    cy.get("header a").contains("Launch").should("have.attr", "href", "/auth");
  });

  // ── 3. Unauthenticated users can see the landing page ────────────────────
  it("unauthenticated visit to / renders the landing page (not a redirect)", () => {
    cy.visit("/");
    cy.url().should("include", "/").and("not.include", "/auth").and("not.include", "/game");
    // Key landing page content should be present
    cy.contains("Star Sailors").should("be.visible");
  });

  // ── 4. /game still protected for unauthenticated users ───────────────────
  it("visiting /game while unauthenticated redirects away from the game hub", () => {
    cy.visit("/game", { failOnStatusCode: false });
    cy.url().should("satisfy", (url: string) =>
      url.includes("/auth") || url.includes("/") && !url.includes("/game")
    );
  });

  // ── 5. Desktop landing has the full nav (Launch Web Client link) ─────────
  it("desktop viewport shows Launch Web Client in the header nav", () => {
    cy.viewport(1280, 800);
    cy.visit("/");
    cy.get("header").within(() => {
      cy.contains("Launch Web Client").should("be.visible");
    });
  });
});
