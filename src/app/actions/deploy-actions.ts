"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getRouteUser } from "@/lib/server/routeAuth";
import { hasResearchedTech } from "@/lib/server/researched";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapAnomalyToRow } from "@/lib/pocketbase/legacyShapes";

// Schema for deployment input
const DeploySchema = z.object({
  deploymentType: z.enum(["stellar", "planetary"]),
  anomalyIds: z.array(z.number()),
});

export type DeploymentType = z.infer<typeof DeploySchema>["deploymentType"];

// Helper to determine which anomaly sets to fetch
function computeSetsToFetch(
  deploymentType: DeploymentType,
  options: { includeActiveAsteroids: boolean; includeNgts: boolean }
) {
  if (deploymentType === "stellar") {
    return ["diskDetective", "superwasp-variable", "telescope-superwasp-variable"];
  }

  const sets = ["telescope-tess", "telescope-minorPlanet"];
  if (options.includeActiveAsteroids) {
    sets.push("active-asteroids");
  }
  if (options.includeNgts) {
    sets.push("telescope-ngts");
  }
  return sets;
}

async function countOthersInteractions(
  pb: Awaited<ReturnType<typeof createPocketbaseAdminClient>>,
  collection: "ss_comments" | "votes",
  filter: string,
  userId: string
) {
  const rows = await pb.collection(collection).getFullList({ filter, fields: "classificationId" });
  const classificationIds = [...new Set(rows.map((r) => r.classificationId).filter((id) => id != null))];
  if (classificationIds.length === 0) return 0;

  const classFilter = classificationIds.map((id) => pb.filter("legacyId = {:id}", { id })).join(" || ");
  const classifications = await pb.collection("ss_classifications").getFullList({
    filter: classFilter,
    fields: "legacyId,author",
  });
  const authorByLegacyId = new Map(classifications.map((c) => [c.legacyId, c.author]));

  return rows.filter((r) => {
    const author = authorByLegacyId.get(r.classificationId);
    return author && author !== userId;
  }).length;
}

export async function getTelescopeStatus() {
  try {
    const { user, authError } = await getRouteUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const pb = await createPocketbaseAdminClient();

    const [linkedCount, validCommentsCount, validVotesCount] = await Promise.all([
      pb.collection("linked_anomalies").getList(1, 1, {
        filter: pb.filter("automaton = {:a} && author = {:u} && date >= {:d}", {
          a: "Telescope",
          u: user.id,
          d: oneWeekAgo.toISOString(),
        }),
      }).then((r) => r.totalItems),
      countOthersInteractions(
        pb,
        "ss_comments",
        pb.filter("author = {:u} && createdAt >= {:d}", { u: user.id, d: oneWeekAgo.toISOString() }),
        user.id
      ),
      countOthersInteractions(
        pb,
        "votes",
        pb.filter("userId = {:u} && voteType = {:t} && createdAt >= {:d}", {
          u: user.id,
          t: "up",
          d: oneWeekAgo.toISOString(),
        }),
        user.id
      ),
    ]);

    const additionalDeploys = Math.floor(validVotesCount / 3) + validCommentsCount;
    const userCanRedeploy = linkedCount + additionalDeploys > linkedCount;

    if (linkedCount === 0) {
      return { alreadyDeployed: false, deploymentMessage: null };
    }

    if (userCanRedeploy) {
      return {
        alreadyDeployed: false,
        deploymentMessage: "You have earned additional deploys by interacting with the community this week!",
      };
    }

    return {
      alreadyDeployed: true,
      deploymentMessage: "Telescope has already been deployed this week. Recalibrate & search again next week.",
    };
  } catch (error) {
    console.error("[Telescope Status] Error:", error);
    throw new Error("Failed to fetch telescope status");
  }
}

export async function getTelescopeAnomalies(deploymentType: DeploymentType) {
  try {
    const { user, authError } = await getRouteUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const pb = await createPocketbaseAdminClient();

    let includeActiveAsteroids = false;
    let includeNgts = false;

    if (deploymentType === "planetary") {
      const [minorPlanetCount, hasNgtsAccess] = await Promise.all([
        pb.collection("ss_classifications").getList(1, 1, {
          filter: pb.filter("author = {:a} && classificationtype = {:t}", { a: user.id, t: "telescope-minorPlanet" }),
        }).then((r) => r.totalItems),
        hasResearchedTech(user.id, "ngtsAccess")
      ]);

      includeActiveAsteroids = minorPlanetCount >= 2;
      includeNgts = hasNgtsAccess;
    }

    const setsToFetch = computeSetsToFetch(deploymentType, {
      includeActiveAsteroids,
      includeNgts,
    });

    const rows = await pb.collection("anomalies").getFullList({
      filter: setsToFetch.map((s) => pb.filter("anomalySet = {:s}", { s })).join(" || "),
    });

    return { anomalies: rows.map(mapAnomalyToRow) };
  } catch (error) {
    console.error("[Telescope Anomalies] Error:", error);
    throw new Error("Failed to fetch anomalies");
  }
}

export async function getTelescopeSkillProgress() {
    try {
        const { user, authError } = await getRouteUser();
        if (authError || !user) {
          throw new Error("Unauthorized");
        }
        
        const start = new Date("2000-01-01").toISOString();
        const pb = await createPocketbaseAdminClient();

        const countByTypes = (types: string[]) =>
          pb.collection("ss_classifications").getList(1, 1, {
            filter:
              pb.filter("author = {:a} && createdAt >= {:s}", { a: user.id, s: start }) +
              " && (" +
              types.map((t) => pb.filter("classificationtype = {:t}", { t })).join(" || ") +
              ")",
          }).then((r) => r.totalItems);

        const [telescopeCount, weatherCount] = await Promise.all([
            countByTypes(['planet', 'telescope-minorPlanet']),
            countByTypes(['cloud', 'lidar-jovianVortexHunter']),
        ]);

        return {
            skillProgress: {
                telescope: telescopeCount,
                weather: weatherCount,
            }
        };

    } catch (error) {
        console.error("[Telescope Skill Progress] Error:", error);
        throw new Error("Failed to fetch skill progress");
    }
}

export async function deployTelescope(prevState: any, formData: FormData) {
  try {
    const { user, authError } = await getRouteUser();
    if (authError || !user) {
      return { error: "Unauthorized" };
    }

    // Parse formData manually or expect JSON if called directly. 
    // Assuming this action might be called with object arguments in a client component wrapper.
    // For now, let's assume it receives the raw data object as the first argument if strictly using server actions, 
    // but standard `useFormState` passes `prevState` and `formData`.
    
    // Simplification: We'll accept a plain object input for now, and the client will call it directly.
    // This deviates from `useFormState` but is cleaner for migrating `fetch` calls.
    // We'll rename the function signature to match this pattern.
    throw new Error("Use deployTelescopeAction for direct calls");
  } catch (error) {
     return { error: "Failed to deploy" };
  }
}

// Direct action for client components
export async function deployTelescopeAction(payload: z.infer<typeof DeploySchema>) {
    try {
        const { user, authError } = await getRouteUser();
        if (authError || !user) {
            throw new Error("Unauthorized");
        }

        const { deploymentType, anomalyIds } = DeploySchema.parse(payload);

        if (anomalyIds.length === 0) {
            throw new Error("No anomalies selected");
        }

        const hasProbeReceptors = await hasResearchedTech(user.id, "probereceptors");

        const maxAnomalies = hasProbeReceptors ? 6 : 4;
        const uniqueIds = Array.from(new Set(anomalyIds)).slice(0, maxAnomalies);

        const pb = await createPocketbaseAdminClient();
        const latest = await pb.collection("linked_anomalies").getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
        let nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;
        const deploymentDate = new Date().toISOString();

        await Promise.all(
            uniqueIds.map((anomalyId) =>
                pb.collection("linked_anomalies").create({
                    legacyId: nextLegacyId++,
                    author: user.id,
                    anomalyId,
                    classificationId: null,
                    automaton: "Telescope",
                    date: deploymentDate,
                    unlocked: false,
                })
            )
        );

        revalidatePath("/activity/deploy");
        revalidatePath("/structures/telescope");
        revalidatePath("/game");

        return { success: true, inserted: uniqueIds.length };

    } catch (error) {
        console.error("[Deploy Telescope] Error:", error);
        if (error instanceof z.ZodError) {
             return { error: "Invalid input data" };
        }
        return { error: "Failed to deploy telescope" };
    }
}

export async function getLinkedAnomaly(anomalyId: number) {
    try {
        const { user, authError } = await getRouteUser();
        if (authError || !user) {
            throw new Error("Unauthorized");
        }

        const pb = await createPocketbaseAdminClient();
        const linkedAnomaly = await pb
            .collection("linked_anomalies")
            .getFirstListItem(pb.filter("author = {:a} && anomalyId = {:id}", { a: user.id, id: anomalyId }), {
                sort: "-legacyId",
            })
            .catch(() => null);

        return {
            success: true,
            data: linkedAnomaly
                ? {
                    id: linkedAnomaly.legacyId,
                    classificationId: linkedAnomaly.classificationId ?? null,
                    unlocked: linkedAnomaly.unlocked ?? false,
                  }
                : null,
        };
    } catch (error) {
        console.error("[Get Linked Anomaly] Error:", error);
        return { error: "Failed to fetch linked anomaly" };
    }
}

export async function updateLinkedAnomalyAction(id: number, updates: { unlocked?: boolean, classification_id?: number }) {
    try {
        const { user, authError } = await getRouteUser();
        if (authError || !user) {
            throw new Error("Unauthorized");
        }

        const pb = await createPocketbaseAdminClient();
        const existing = await pb
            .collection("linked_anomalies")
            .getFirstListItem(pb.filter("legacyId = {:id} && author = {:a}", { id, a: user.id }));

        const updated = await pb.collection("linked_anomalies").update(existing.id, {
            ...(updates.unlocked !== undefined ? { unlocked: updates.unlocked } : {}),
            ...(updates.classification_id !== undefined ? { classificationId: updates.classification_id } : {}),
        });

        revalidatePath("/activity/deploy");
        revalidatePath("/viewports/satellite");
        revalidatePath("/viewports/rover");

        return { success: true, data: updated };
    } catch (error) {
        console.error("[Update Linked Anomaly] Error:", error);
        return { error: "Failed to update linked anomaly" };
    }
}
