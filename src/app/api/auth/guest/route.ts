import { NextResponse } from "next/server";
import { createGuestSession } from "@/lib/server/guestAuth";

export async function POST() {
  const { ticket } = await createGuestSession();
  return NextResponse.json({ ticket });
}
