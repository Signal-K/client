import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ test: BigInt(123) });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
