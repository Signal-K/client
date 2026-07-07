"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getRouteUser } from "@/lib/server/supabaseRoute";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapMineralDepositToRow } from "@/lib/pocketbase/legacyShapes";

const MineralDepositSchema = z.object({
  anomaly: z.number(),
  discovery: z.number(),
  mineral_configuration: z.record(z.string(), z.any()).optional(),
  location: z.string().optional().default("Mars"),
  rover_name: z.string().optional().default("Rover 1"),
  created_at: z.string().optional(),
});

export type CreateMineralDepositInput = z.infer<typeof MineralDepositSchema>;

export async function createMineralDepositAction(payload: CreateMineralDepositInput) {
  try {
    const { user, authError } = await getRouteUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { 
      anomaly, 
      discovery, 
      mineral_configuration, 
      location, 
      rover_name, 
      created_at 
    } = MineralDepositSchema.parse(payload);

    const pb = await createPocketbaseAdminClient();
    const latest = await pb.collection("mineral_deposits").getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
    const nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;

    const deposit = await pb.collection("mineral_deposits").create({
      legacyId: nextLegacyId,
      anomaly,
      discovery,
      owner: user.id,
      mineralConfiguration: mineral_configuration || {},
      location,
      roverName: rover_name,
      createdAt: created_at ? new Date(created_at).toISOString() : new Date().toISOString(),
    });

    revalidatePath("/inventory");
    revalidatePath("/viewports/rover"); // Fixed typo
    revalidatePath(`/next/${discovery}`);

    return { success: true, data: mapMineralDepositToRow(deposit) };

  } catch (error) {
    console.error("[Create Mineral Deposit] Error:", error);
    if (error instanceof z.ZodError) {
      return { error: "Invalid input data", details: error.flatten() };
    }
    return { error: "Failed to create mineral deposit" };
  }
}

export async function getMineralDeposits(discoveryId?: number) {
  try {
    const { user, authError } = await getRouteUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const pb = await createPocketbaseAdminClient();
    const filters = [pb.filter("owner = {:owner}", { owner: user.id }), 'location != ""'];
    if (discoveryId !== undefined) {
      filters.push(pb.filter("discovery = {:d}", { d: discoveryId }));
    }

    const deposits = await pb.collection("mineral_deposits").getFullList({
      filter: filters.join(" && "),
      sort: "-createdAt",
    });

    return { success: true, data: deposits.map(mapMineralDepositToRow) };
  } catch (error) {
    console.error("[Get Mineral Deposits] Error:", error);
    return { error: "Failed to fetch mineral deposits" };
  }
}
