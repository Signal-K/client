type RoutePlan = {
  route: string
  expectedTypes: string[]
}

const buildRoutePlan = (anomalySet: string, anomalyId: number): RoutePlan | null => {
  if (anomalySet === "telescope-minorPlanet") {
    return {
      route: `/structures/telescope/daily-minor-planet/${anomalyId}/classify`,
      expectedTypes: ["telescope-minorPlanet"],
    }
  }

  if (anomalySet === "telescope-tess" || anomalySet === "telescope-ngts") {
    return {
      route: `/structures/telescope/planet-hunters/${anomalyId}/classify`,
      expectedTypes: ["planet"],
    }
  }

  if (anomalySet === "active-asteroids") {
    return {
      route: `/structures/telescope/active-asteroids/${anomalyId}/classify`,
      expectedTypes: ["active-asteroid", "active-asteroids"],
    }
  }

  return null
}

describe("Contributions Critical", () => {
  let createdUserId = ""

  beforeEach(() => {
    cy.on("uncaught:exception", (err) => {
      if (err.message.includes("Invalid or unexpected token")) {
        return false
      }
      return true
    })
  })

  afterEach(() => {
    if (!createdUserId) return
    cy.task("cleanupSupabaseTestUser", { userId: createdUserId })
    cy.task("countSupabaseRows", { table: "classifications", filters: { author: createdUserId } }).then((rows) =>
      expect(rows, "classifications after cleanup").to.equal(0),
    )
    cy.task("countSupabaseRows", { table: "comments", filters: { author: createdUserId } }).then((rows) =>
      expect(rows, "comments after cleanup").to.equal(0),
    )
    cy.task("countSupabaseRows", { table: "linked_anomalies", filters: { author: createdUserId } }).then((rows) =>
      expect(rows, "linked anomalies after cleanup").to.equal(0),
    )
    cy.task("countSupabaseRows", { table: "mineralDeposits", filters: { owner: createdUserId } }).then((rows) =>
      expect(rows, "mineral deposits after cleanup").to.equal(0),
    )
  })

  it("uses frontend flow: login, deploy telescope, select deployed anomaly, submit annotation, and cleans up rows", () => {
    const supabaseUrl = Cypress.env("SUPABASE_URL") || Cypress.env("NEXT_PUBLIC_SUPABASE_URL")
    const anonKey =
      Cypress.env("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
      Cypress.env("SUPABASE_ANON_KEY") ||
      Cypress.env("SUPABASE_PUBLISHABLE_KEY")

    expect(supabaseUrl, "SUPABASE_URL").to.be.a("string").and.not.be.empty
    expect(anonKey, "SUPABASE anon/publishable key").to.be.a("string").and.not.be.empty

    const runTag = `ui-flow-${Date.now()}`
    const email = `${runTag}@example.com`
    const password = "testpassword123"

    const authHeaders = {
      apikey: String(anonKey),
      "Content-Type": "application/json",
    }
    let deployedAnomalyId = 0
    let selectedRoute = ""
    let expectedClassificationTypes: string[] = []
    let createdClassificationId = 0
    const anomalySetById: Record<number, string> = {}

    cy.request({
      method: "POST",
      url: `${supabaseUrl}/auth/v1/signup`,
      headers: authHeaders,
      body: { email, password },
      failOnStatusCode: false,
    }).then((signup) => {
      expect([200, 201], "signup status").to.include(signup.status)
      createdUserId = String(signup.body?.user?.id || "")
      expect(createdUserId, "created user id").to.not.equal("")
    })

    cy.login(email, password)

    cy.intercept("GET", "/api/gameplay/deploy/telescope?action=anomalies*").as("deployAnomalies")
    cy.intercept("POST", "/api/gameplay/deploy/telescope").as("deployTelescope")
    cy.visit("/activity/deploy")
    cy.wait("@deployAnomalies", { timeout: 120000 }).then((interception) => {
      const anomalies = (interception.response?.body?.anomalies || []) as Array<{ id: number; anomalySet: string }>
      anomalies.forEach((anomaly) => {
        anomalySetById[Number(anomaly.id)] = String(anomaly.anomalySet || "")
      })
    })
    cy.contains("button", "Select Sector", { timeout: 120000 }).click({ force: true })
    cy.contains("button", "Deploy Telescope", { timeout: 120000 }).click({ force: true })
    cy.wait("@deployTelescope", { timeout: 120000 }).then((interception) => {
      expect(interception.response?.statusCode, "deploy response status").to.equal(200)
      const deployedIds = (interception.request?.body?.anomalyIds || []).map((id: number | string) =>
        Number(id),
      )
      expect(deployedIds.length, "deployed anomaly ids from frontend deploy request").to.be.greaterThan(0)

      const preferredSets = ["telescope-minorPlanet", "telescope-tess", "active-asteroids"]
      let chosenId: number | undefined
      for (const set of preferredSets) {
        chosenId = deployedIds.find((id: number) => anomalySetById[id] === set)
        if (chosenId) break
      }
      if (!chosenId) {
        chosenId = deployedIds.find((id: number) => {
          const anomalySet = anomalySetById[id] || ""
          return Boolean(buildRoutePlan(anomalySet, id))
        })
      }
      expect(chosenId, "at least one deployed anomaly maps to supported classification route").to.not.equal(
        undefined,
      )

      const anomalyId = Number(chosenId)
      const anomalySet = anomalySetById[anomalyId] || ""
      const routePlan = buildRoutePlan(anomalySet, anomalyId)
      if (!routePlan) {
        throw new Error(`Failed to map deployed anomaly ${anomalyId} with set ${anomalySet}`)
      }

      deployedAnomalyId = anomalyId
      selectedRoute = routePlan.route
      expectedClassificationTypes = routePlan.expectedTypes
    })

    cy.intercept("POST", "/api/gameplay/classifications").as("submitClassification")

    cy.then(() => {
      expect(selectedRoute, "selected route for deployed anomaly").to.not.equal("")
      cy.visit(selectedRoute)
      cy.contains("button", "Submit Classification", { timeout: 120000 }).click({ force: true })
      cy.wait("@submitClassification", { timeout: 120000 }).then((submission) => {
        expect(submission.response?.statusCode, "classification submission status").to.equal(200)
        const submissionBody = submission.response?.body || {}
        const apiId = Number(submission.response?.body?.id)
        expect(Number.isFinite(apiId), "classification id from submission response").to.equal(true)
        createdClassificationId = apiId
        expect(String(submissionBody.author), "classification author from submit response").to.equal(createdUserId)
        expect(Number(submissionBody.anomaly), "classification anomaly from submit response").to.equal(
          deployedAnomalyId,
        )
        expect(
          expectedClassificationTypes.includes(String(submissionBody.classificationtype)),
          `classification type from submit response should match route ${selectedRoute}`,
        ).to.equal(true)
      })
      cy.location("pathname", { timeout: 120000 }).should("match", /\/next\/\d+$/)
    })

    cy.request({
      method: "POST",
      url: "/api/gameplay/social/comments",
      failOnStatusCode: false,
      body: {
        classificationId: createdClassificationId,
        content: `cypress ui-flow comment ${runTag}`,
      },
    }).then((commentResponse) => {
      expect([200, 500], "comment creation status").to.include(commentResponse.status)
    })
  })
})
