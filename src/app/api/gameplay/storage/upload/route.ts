import { NextRequest, NextResponse } from "next/server";

import { getRouteUser } from "@/lib/server/supabaseRoute";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { getStorageUrl } from "@/lib/pocketbase/storageUrl";
import { storageObjectId, storageFilename } from "@/lib/pocketbase/storageId";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { user, authError } = await getRouteUser();
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

  const pb = await createPocketbaseAdminClient();
  const pbFormData = new FormData();
  pbFormData.append("id", storageObjectId(bucket, safeName));
  pbFormData.append("bucket", bucket);
  pbFormData.append("path", safeName);
  pbFormData.append("file", new File([file], storageFilename(safeName), { type: file.type }));

  try {
    await pb.collection("storage_objects").create(pbFormData);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({ path: safeName, publicUrl: getStorageUrl(bucket, safeName) });
}
