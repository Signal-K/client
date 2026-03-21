"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

const ClassificationSchema = z.object({
  anomaly: z.number().nullable().optional(),
  classificationtype: z.string().min(1),
  content: z.string().nullable().optional(),
  media: z.any().optional(),
  classificationConfiguration: z.any().optional(),
  classificationParent: z.union([z.number(), z.string()]).nullable().optional(),
});

export type CreateClassificationInput = z.infer<typeof ClassificationSchema>;

export async function createClassificationAction(payload: CreateClassificationInput) {
  try {
    const { user, authError } = await getRouteUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { 
      anomaly, 
      classificationtype, 
      content, 
      media, 
      classificationConfiguration, 
      classificationParent 
    } = ClassificationSchema.parse(payload);

    if (!classificationtype) {
        throw new Error("Classification type is required");
    }

    const parentId = classificationParent ? Number(classificationParent) : null;
    const anomalyId = anomaly ? Number(anomaly) : null;

    // Use Prisma Client
    const classification = await prisma.classification.create({
        data: {
            author: user.id,
            anomaly: anomalyId,
            classificationtype,
            content: content || "",
            media: media ?? Prisma.JsonNull,
            classificationConfiguration: classificationConfiguration ?? Prisma.JsonNull,
            // classificationParent removed as it's not in schema
        }
    });

    // Revalidate paths
    revalidatePath("/game");
    revalidatePath("/research");
    revalidatePath("/viewports/satellite");
    revalidatePath("/viewports/solar");
    revalidatePath("/viewports/rover");
    revalidatePath(`/next/${classification.id}`);

    // Serialize BigInts if necessary, though Prisma Client usually returns BigInt
    // Server Actions automatically serialize simple objects, but BigInt needs care.
    const safeData = JSON.parse(JSON.stringify(classification, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
    ));

    return { success: true, data: safeData };

  } catch (error) {
    console.error("[Create Classification] Error:", error);
    if (error instanceof z.ZodError) {
        return { error: "Invalid input data", details: error.flatten() };
    }
    return { error: "Failed to create classification" };
  }
}


