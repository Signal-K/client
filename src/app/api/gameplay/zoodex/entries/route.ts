import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

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
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const source = typeof formData.get("source") === "string" ? String(formData.get("source")) : "Webcam";
  const content = typeof formData.get("comment") === "string" ? String(formData.get("comment")) : "";
  const locationRaw = formData.get("location");
  const location =
    typeof locationRaw === "string" && locationRaw.trim() !== "" && Number.isFinite(Number(locationRaw))
      ? Number(locationRaw)
      : null;

  let configuration: Record<string, unknown> | null = null;
  const configurationRaw = formData.get("configuration");
  if (typeof configurationRaw === "string" && configurationRaw.trim()) {
    try {
      configuration = JSON.parse(configurationRaw);
    } catch {
      return NextResponse.json({ error: "Invalid configuration payload" }, { status: 400 });
    }
  }

  const shouldSaveToZoo = String(formData.get("saveToZoo") || "").toLowerCase() === "true";

  const fileName =
    "name" in file && typeof (file as File).name === "string" && (file as File).name
      ? (file as File).name
      : "capture.jpg";
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uploadPath = `${user.id}/${Date.now()}-${safeFileName}`;

  const pb = await createPocketbaseAdminClient();
  const pbFormData = new FormData();
  pbFormData.append("id", storageObjectId("uploads", uploadPath));
  pbFormData.append("bucket", "uploads");
  pbFormData.append("path", uploadPath);
  pbFormData.append(
    "file",
    new File([file], storageFilename(uploadPath), { type: file.type || "image/jpeg" })
  );

  try {
    await pb.collection("storage_objects").create(pbFormData);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 });
  }

  const fileUrl = getStorageUrl("uploads", uploadPath);

  const latestUpload = await pb.collection("uploads").getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
  const nextUploadLegacyId = (latestUpload.items[0]?.legacyId ?? 0) + 1;

  await pb.collection("uploads").create({
    legacyId: nextUploadLegacyId,
    author: user.id,
    fileUrl,
    content,
    source,
    configuration,
    location,
    createdAt: new Date().toISOString(),
  });

  if (shouldSaveToZoo) {
    const latestZoo = await pb.collection("zoo").getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
    const nextZooLegacyId = (latestZoo.items[0]?.legacyId ?? 0) + 1;

    await pb.collection("zoo").create({
      legacyId: nextZooLegacyId,
      author: user.id,
      owner: user.id,
      fileUrl,
      configuration,
      location,
      createdAt: new Date().toISOString(),
    });
  }

  revalidatePath("/game");
  revalidatePath("/activity/deploy");

  return NextResponse.json({ success: true, fileUrl });
}
