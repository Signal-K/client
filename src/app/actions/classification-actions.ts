"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getRouteUser } from "@/lib/server/supabaseRoute";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapClassificationToRow } from "@/lib/pocketbase/legacyShapes";

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

    const anomalyId = anomaly ? Number(anomaly) : null;
    void classificationParent; // not persisted — not part of the classifications collection

    const pb = await createPocketbaseAdminClient();

    // legacyId assignment mirrors the old autoincrement PK: one past the
    // current max. Matches the pattern in /api/gameplay/classifications POST.
    const latest = await pb
      .collection("classifications")
      .getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
    const nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;

    const classification = await pb.collection("classifications").create({
        legacyId: nextLegacyId,
        createdAt: new Date().toISOString(),
        author: user.id,
        anomaly: anomalyId,
        classificationtype,
        content: content || "",
        media: media ?? null,
        classificationConfiguration: classificationConfiguration ?? null,
    });

    // Revalidate paths
    revalidatePath("/game");
    revalidatePath("/research");
    revalidatePath("/viewports/satellite");
    revalidatePath("/viewports/solar");
    revalidatePath("/viewports/rover");
    revalidatePath(`/next/${nextLegacyId}`);

    return { success: true, data: mapClassificationToRow(classification) };

  } catch (error) {
    console.error("[Create Classification] Error:", error);
    if (error instanceof z.ZodError) {
        return { error: "Invalid input data", details: error.flatten() };
    }
    return { error: "Failed to create classification" };
  }
}


