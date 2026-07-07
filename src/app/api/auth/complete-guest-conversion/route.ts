import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { guest: false },
  });

  return NextResponse.json({ ok: true });
}
