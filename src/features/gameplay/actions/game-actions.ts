"use server";

import { getGamePageDataForUser } from "@/lib/server/game-page-data";
import { getRouteUser } from "@/lib/server/supabaseRoute";

export async function getGamePageData() {
  const { user, authError } = await getRouteUser();
  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  try {
    return await getGamePageDataForUser(user.id);
  } catch (error) {
    console.error("[Game Page Data] Error:", error);
    throw new Error("Failed to fetch game data");
  }
}
