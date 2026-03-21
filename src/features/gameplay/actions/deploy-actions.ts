"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

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

export async function getTelescopeStatus() {
  try {
    const { user, authError } = await getRouteUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Use Prisma Client instead of raw SQL
    const [linkedCount, comments, votes] = await Promise.all([
      prisma.linkedAnomaly.count({
        where: {
          automaton: "Telescope",
          author: user.id,
          date: {
            gte: oneWeekAgo.toISOString(),
          },
        },
      }),
      prisma.comment.findMany({
        where: {
          author: user.id,
          createdAt: {
            gte: oneWeekAgo.toISOString(),
          },
        },
        include: {
            classification: {
                select: {
                    author: true
                }
            }
        }
      }),
      prisma.vote.findMany({
        where: {
          userId: user.id,
          voteType: "up",
          createdAt: {
            gte: oneWeekAgo.toISOString(),
          },
        },
        include: {
            classification: {
                select: {
                    author: true
                }
            }
        }
      }),
    ]);

    const validComments = comments.filter((c: any) => c.classification?.author && c.classification.author !== user.id);
    const validVotes = votes.filter((v: any) => v.classification?.author && v.classification.author !== user.id);

    const additionalDeploys = Math.floor(validVotes.length / 3) + validComments.length;
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

    let includeActiveAsteroids = false;
    let includeNgts = false;

    if (deploymentType === "planetary") {
      const [minorPlanetCount, ngtsData] = await Promise.all([
        prisma.classification.count({
            where: {
                author: user.id,
                classificationtype: "telescope-minorPlanet"
            }
        }),
        prisma.researched.findFirst({
            where: {
                userId: user.id,
                techType: "ngtsAccess"
            }
        })
      ]);

      includeActiveAsteroids = minorPlanetCount >= 2;
      includeNgts = !!ngtsData;
    }

    const setsToFetch = computeSetsToFetch(deploymentType, {
      includeActiveAsteroids,
      includeNgts,
    });

    const anomalies = await prisma.anomaly.findMany({
      where: {
        anomalySet: {
          in: setsToFetch,
        },
      },
    });

    return { anomalies };
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

        const [telescopeCount, weatherCount] = await Promise.all([
            prisma.classification.count({
                where: {
                    author: user.id,
                    classificationtype: { in: ['planet', 'telescope-minorPlanet'] },
                    createdAt: { gte: start }
                }
            }),
            prisma.classification.count({
                where: {
                    author: user.id,
                    classificationtype: { in: ['cloud', 'lidar-jovianVortexHunter'] },
                    createdAt: { gte: start }
                }
            })
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

        const probeReceptors = await prisma.researched.findFirst({
            where: {
                userId: user.id,
                techType: "probereceptors"
            }
        });

        const maxAnomalies = probeReceptors ? 6 : 4;
        const uniqueIds = Array.from(new Set(anomalyIds)).slice(0, maxAnomalies);

        // Using createMany is cleaner than raw SQL
        // However, Prisma's createMany is not supported on all databases for all relations in older versions,
        // but explicit mapping is fine.
        const data = uniqueIds.map(anomalyId => ({
            author: user.id,
            anomalyId: BigInt(anomalyId),
            classificationId: null,
            automaton: "Telescope"
        }));

        await prisma.linkedAnomaly.createMany({
            data
        });

        revalidatePath("/activity/deploy");
        revalidatePath("/structures/telescope");
        revalidatePath("/game");

        return { success: true, inserted: data.length };

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

        const linkedAnomaly = await prisma.linkedAnomaly.findFirst({
            where: {
                author: user.id,
                anomalyId: BigInt(anomalyId)
            },
            orderBy: {
                id: "desc"
            }
        });

        return { success: true, data: linkedAnomaly };
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

        const updated = await prisma.linkedAnomaly.update({
            where: {
                id: BigInt(id),
                author: user.id
            },
            data: {
                ...updates,
                classificationId: updates.classification_id ? BigInt(updates.classification_id) : undefined
            }
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
