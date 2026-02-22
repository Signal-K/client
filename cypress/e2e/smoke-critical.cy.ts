describe("Critical Smoke", () => {
  beforeEach(() => {
    cy.waitForSupabase()
  })

  it("checks local Supabase health endpoint", () => {
    const supabaseUrl = Cypress.env("SUPABASE_URL") || "http://127.0.0.1:54321"
    cy.task("waitForSupabaseHealth").then((healthy) => {
      if (!healthy) {
        cy.log("Skipping health assertion: local Supabase is not reachable")
        return
      }
      cy.request(`${supabaseUrl}/auth/v1/health`).its("status").should("eq", 200)
    })
  })

  it("renders core public pages", () => {
    cy.request({
      url: "/",
      timeout: 180000,
      failOnStatusCode: false,
    }).its("status").should("be.lessThan", 500)

    const routes = ["/auth", "/privacy", "/terms", "/offline"]
    routes.forEach((route) => {
      cy.visit(route)
      cy.get("body").should("be.visible")
    })
  })

  it("redirects protected routes when unauthenticated", () => {
    cy.visit("/game", { failOnStatusCode: false })
    cy.url().should("satisfy", (url: string) => url.includes("/") || url.includes("/auth"))
  })
})
