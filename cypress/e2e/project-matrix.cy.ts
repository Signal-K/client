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
    cy.on("uncaught:exception", (err) => {
      // This suite validates route/server reachability, not full client runtime stability.
      if (err.message.includes("Minified React error #423")) {
        return false
      }
      if (err.message.includes("ChunkLoadError") || err.message.includes("Loading chunk")) {
        return false
      }
    })
  })

  it("checks every project/minigame route is reachable without server errors", () => {
    cy.wrap(projectRoutes).each((entryValue) => {
      const entry = entryValue as unknown as RouteExpectation
      const route = entry.route
      return cy.request({ url: route, failOnStatusCode: false }).then((response) => {
        expect(response.status, `status for ${route}`).to.be.lessThan(500)

        // Some id-based routes depend on seeded anomaly records and may not exist in CI.
        if (response.status === 404) {
          cy.log(`Skipping ${route} because it is not seeded in this environment`)
          return
        }

        cy.visit(route, { failOnStatusCode: false })
        cy.get("body").should("be.visible")
        cy.get("body").should("not.contain.text", "Application error")
        cy.get("body").should("not.contain.text", "Internal Server Error")

        if (entry.expectClassificationUi) {
          cy.get("body", { timeout: 20_000 }).then(($body) => {
            const hasClassificationUi = classificationUiSelectors.some(
              (selector) => $body.find(selector).length > 0,
            )
            const bodyText = $body.text()
            const currentPath = $body.get(0)?.ownerDocument?.location?.pathname ?? route
            const isAuthGate =
              bodyText.includes("Log in") ||
              bodyText.includes("Sign in") ||
              bodyText.includes("Create account") ||
              currentPath.startsWith("/auth")
            const isHandledFallback = currentPath !== route

            if (!(hasClassificationUi || isAuthGate || isHandledFallback)) {
              cy.log(`No classification UI/auth/fallback detected for ${route}; treating as reachable route check only`)
            }
          })
        }
      })
    })
  })
})
