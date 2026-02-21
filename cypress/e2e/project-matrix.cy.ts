describe("Project Matrix Coverage", () => {
type RouteExpectation = {
  route: string
  expectClassificationUi?: boolean
}

  const classificationUiSelectors = [
    "button",
    "canvas",
    "[data-testid*='class']",
    "form",
    "textarea",
    "input[type='range']",
  ]

  const projectRoutes: RouteExpectation[] = [
    { route: "/structures/telescope" },
    { route: "/structures/telescope/planet-hunters" },
    { route: "/structures/telescope/sunspots" },
    { route: "/structures/telescope/daily-minor-planet" },
    { route: "/structures/telescope/disk-detective" },
    { route: "/structures/telescope/planet-hunters/8/classify", expectClassificationUi: true },
    { route: "/structures/telescope/sunspots/8/count", expectClassificationUi: true },
    { route: "/structures/telescope/daily-minor-planet/1/classify", expectClassificationUi: true },
    { route: "/structures/telescope/active-asteroids/1/classify", expectClassificationUi: true },
    { route: "/structures/telescope/disk-detective/1/classify", expectClassificationUi: true },
    { route: "/structures/telescope/superwasp/1/classify", expectClassificationUi: true },
    { route: "/structures/balloon" },
    { route: "/structures/balloon/clouds" },
    { route: "/structures/balloon/storms" },
    { route: "/structures/balloon/landmarks" },
    { route: "/structures/balloon/surface" },
    { route: "/structures/balloon/cloudspotting/1/classify", expectClassificationUi: true },
    { route: "/structures/balloon/jvh/77311541/classify", expectClassificationUi: true },
    { route: "/structures/balloon/shapes/1/classify", expectClassificationUi: true },
    { route: "/structures/balloon/p4/5/classify", expectClassificationUi: true },
    { route: "/structures/seiscam" },
    { route: "/structures/seiscam/ai4mars/1/one", expectClassificationUi: true },
    { route: "/viewports/satellite" },
    { route: "/viewports/satellite/deploy" },
    { route: "/viewports/solar" },
    { route: "/viewports/roover" },
    { route: "/research" },
  ]

  beforeEach(() => {
    cy.waitForSupabase()
  })

  it("checks every project/minigame route is reachable without server errors", () => {
    cy.wrap(projectRoutes).each((entryValue) => {
      const entry = entryValue as unknown as RouteExpectation
      const route = entry.route
      cy.visit(route, { failOnStatusCode: false })
      cy.get("body").should("be.visible")
      cy.get("body").should("not.contain.text", "Application error")
      cy.get("body").should("not.contain.text", "Internal Server Error")

      if (entry.expectClassificationUi) {
        // Wait for React to hydrate and render classification UI
        cy.get(
          classificationUiSelectors.join(", "),
          { timeout: 10_000 },
        ).should("have.length.greaterThan", 0)
      }
    })
  })
})
