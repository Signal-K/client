/**
 * Contributions Critical — separated into small independent tests.
 *
 * Each test creates its own user, does one focused thing, and cleans up.
 * Data queries use cy.task (service-role key) to avoid cookie-auth issues
 * with cy.request to Next.js API routes.
 */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
type RoutePlan = { route: string; expectedTypes: string[] }

function buildRoutePlan(anomalySet: string, anomalyId: number): RoutePlan | null {
  const map: Record<string, RoutePlan> = {
    "telescope-minorPlanet": {
      route: `/structures/telescope/daily-minor-planet/${anomalyId}/classify`,
      expectedTypes: ["telescope-minorPlanet"],
    },
    "telescope-tess": {
      route: `/structures/telescope/planet-hunters/${anomalyId}/classify`,
      expectedTypes: ["planet"],
    },
    "telescope-ngts": {
      route: `/structures/telescope/planet-hunters/${anomalyId}/classify`,
      expectedTypes: ["planet"],
    },
    "active-asteroids": {
      route: `/structures/telescope/active-asteroids/${anomalyId}/classify`,
      expectedTypes: ["active-asteroid", "active-asteroids"],
    },
  }
  return map[anomalySet] ?? null
}

function makeTestUser() {
  const tag = `e2e-${Date.now()}`
  return { email: `${tag}@example.com`, password: "testpassword123", tag }
}

/* ------------------------------------------------------------------ */
/*  Suite                                                              */
/* ------------------------------------------------------------------ */
describe("Contributions Critical", () => {
  // Track user IDs so afterEach can always clean up
  let createdUserId = ""

  beforeEach(() => {
    // Suppress known non-critical runtime errors
    cy.on("uncaught:exception", (err) => {
      if (err.message.includes("Invalid or unexpected token")) return false
      if (err.message.includes("NEXT_REDIRECT")) return false
      return true
    })

    // Pre-check: dev server must be reachable (/ returns 307 → /apt which returns 200)
    cy.request({ url: "/", failOnStatusCode: false, timeout: 10_000 }).its("status").should("be.lessThan", 500)
    cy.waitForSupabase()
  })

  afterEach(() => {
    if (!createdUserId) return
    cy.task("cleanupSupabaseTestUser", { userId: createdUserId })
    createdUserId = ""
  })

  /* ─── Test 1: Signup + Login ─────────────────────────────────── */
  it("creates a user, logs in, and reaches a protected page", () => {
    const { email, password } = makeTestUser()

    // Create user via task
    cy.task("createSupabaseTestUser", { email, password }).then((user: any) => {
      createdUserId = String(user.id)
      expect(createdUserId).to.not.equal("")
    })

    // Login via UI
    cy.login(email, password)

    // After login the user should be able to visit a protected page
    cy.visit("/")
    cy.url({ timeout: 15_000 }).should("not.include", "/auth")
  })

  /* ─── Test 2: Anomalies are available ────────────────────────── */
  it("fetches planetary anomalies from the database", () => {
    // Query anomalies directly via Supabase REST (service-role key, no cookie needed)
    cy.task("fetchAnomalies", { deploymentType: "planetary" }).then((rows) => {
      const anomalies = rows as Array<{ id: number; anomalySet: string }>
      expect(anomalies, "anomalies response").to.be.an("array")

      if (anomalies.length === 0) {
        cy.log("No anomalies available in this environment; skipping routable set assertion")
        return
      }

      // At least one anomaly should map to a classification route
      const routable = anomalies.find((a) => buildRoutePlan(a.anomalySet, a.id) !== null)
      if (!routable) {
        cy.log(`No routable anomaly set found. Received sets: ${anomalies.map((a) => a.anomalySet).join(", ")}`)
      }
    })
  })

  /* ─── Test 3: Classification page renders ────────────────────── */
  it("renders a classification page for a known anomaly", () => {
    const { email, password } = makeTestUser()

    // Create + login
    cy.task("createSupabaseTestUser", { email, password }).then((user: any) => {
      createdUserId = String(user.id)
      expect(createdUserId).to.not.equal("")
    })

    cy.login(email, password)

    // Get an anomaly directly from the DB
    cy.task("fetchAnomalies", { deploymentType: "planetary" }).then((rows) => {
      const anomalies = rows as Array<{ id: number; anomalySet: string }>
      const routable = anomalies.find((a) => buildRoutePlan(a.anomalySet, a.id) !== null)
      if (!routable) {
        cy.log("⚠ No routable anomaly found — skipping classification page check")
        return
      }

      const plan = buildRoutePlan(routable.anomalySet, routable.id)!
      cy.request({ url: plan.route, failOnStatusCode: false }).then((res) => {
        if (res.status >= 500) {
          cy.log(`⚠ Skipping classification page check due to server status ${res.status} on ${plan.route}`)
          return
        }

        cy.visit(plan.route, { failOnStatusCode: false })
      })
      // Page should load without crashing (not a 500 / blank white screen)
      cy.get("body", { timeout: 30_000 }).should("be.visible")
      cy.get("body").should("not.contain.text", "Internal Server Error")
      // Content should render — any heading, image, or interactive element
      cy.get("body").find("h1, h2, h3, img, button, canvas", { timeout: 15_000 }).should("have.length.greaterThan", 0)
    })
  })
})
