import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { getRouteSupabaseWithUser } from "@/lib/server/supabaseRoute";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { supabase, user, authError } = await getRouteSupabaseWithUser();
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

  const { error: uploadError } = await supabase.storage.from("uploads").upload(uploadPath, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicData } = supabase.storage.from("uploads").getPublicUrl(uploadPath);
  const fileUrl = publicData.publicUrl;

  const uploadPayload: Record<string, unknown> = {
    author: user.id,
    file_url: fileUrl,
    content,
    source,
    configuration,
  };
  if (location !== null) {
    uploadPayload.location = location;
  }

  await prisma.$executeRaw`
    INSERT INTO uploads (author, file_url, content, source, configuration, location)
    VALUES (
      ${uploadPayload.author as string},
      ${uploadPayload.file_url as string},
      ${uploadPayload.content as string},
      ${uploadPayload.source as string},
      ${JSON.stringify((uploadPayload.configuration as Record<string, unknown> | null) ?? null)}::jsonb,
      ${(uploadPayload.location as number | null | undefined) ?? null}
    )
  `;

  if (shouldSaveToZoo) {
    const zooPayload: Record<string, unknown> = {
      author: user.id,
      owner: user.id,
      file_url: fileUrl,
      configuration,
    };
    if (location !== null) {
      zooPayload.location = location;
    }

    await prisma.$executeRaw`
      INSERT INTO zoo (author, owner, file_url, configuration, location)
      VALUES (
        ${zooPayload.author as string},
        ${zooPayload.owner as string},
        ${zooPayload.file_url as string},
        ${JSON.stringify((zooPayload.configuration as Record<string, unknown> | null) ?? null)}::jsonb,
        ${(zooPayload.location as number | null | undefined) ?? null}
      )
    `;
  }

  revalidatePath("/game");
  revalidatePath("/activity/deploy");

  return NextResponse.json({ success: true, fileUrl });
}
