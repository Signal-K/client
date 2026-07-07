import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";

export const dynamic = "force-dynamic";

/**
 * Replaces the old Supabase `on_auth_user_created` trigger (`handle_new_user()`),
 * which unconditionally inserted a `profiles` row on every `auth.users` insert.
 * Clerk has no equivalent Postgres table to attach a trigger to, so account
 * creation is now observed via this webhook instead of relying on the client
 * hitting /api/gameplay/profile/ensure.
 */
export async function POST(request: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(request);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type !== "user.created") {
    return NextResponse.json({ received: true });
  }

  const { id: userId, first_name, last_name, image_url } = event.data;
  const fullName = [first_name, last_name].filter(Boolean).join(" ") || null;

  const pb = await createPocketbaseAdminClient();
  const existing = await pb
    .collection("profiles")
    .getFirstListItem(pb.filter("userId = {:id}", { id: userId }))
    .catch(() => null);

  if (!existing) {
    await pb.collection("profiles").create({
      userId,
      fullName,
      avatarUrl: image_url ?? null,
      updatedAt: new Date().toISOString(),
    });
  }

  return NextResponse.json({ received: true });
}
