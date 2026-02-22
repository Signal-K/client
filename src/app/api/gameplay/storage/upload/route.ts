import { NextRequest, NextResponse } from "next/server";

import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const bucket = String(formData.get("bucket") || "media");
  const fileNameOverride = formData.get("fileName");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const safeName =
    typeof fileNameOverride === "string" && fileNameOverride.trim().length > 0
      ? fileNameOverride.trim()
      : `${Date.now()}-${user.id}-${file.name}`;

  const { data, error } = await supabase.storage.from(bucket).upload(safeName, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Upload failed" }, { status: 500 });
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
  return NextResponse.json({ path: data.path, publicUrl });
}
