import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  return NextResponse.json(
    { authenticated: Boolean(userId) },
    { status: userId ? 200 : 401 },
  );
}
