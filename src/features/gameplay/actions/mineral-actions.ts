"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";

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

    const deposit = await prisma.mineralDeposit.create({
      data: {
        anomaly,
        discovery,
        owner: user.id,
        mineralConfiguration: mineral_configuration || {},
        location,
        roverName: rover_name,
        createdAt: created_at ? new Date(created_at) : new Date(),
      }
    });

    revalidatePath("/inventory");
    revalidatePath("/viewports/rover"); // Fixed typo
    revalidatePath(`/next/${discovery}`);

    return { success: true, data: deposit };

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

    const deposits = await prisma.mineralDeposit.findMany({
      where: {
        owner: user.id,
        discovery: discoveryId,
        location: { not: null }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return { success: true, data: deposits };
  } catch (error) {
    console.error("[Get Mineral Deposits] Error:", error);
    return { error: "Failed to fetch mineral deposits" };
  }
}
