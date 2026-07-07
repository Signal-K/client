import { NextRequest, NextResponse } from "next/server";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { storageObjectId } from "@/lib/pocketbase/storageId";

export const dynamic = "force-dynamic";

/**
 * Resolves a (bucket, path) pair to its actual Pocketbase file URL and
 * redirects there. Exists because Pocketbase always randomizes stored
 * filenames (e.g. `file.jpg` -> `file_gvl9gyh5w7.jpg`) with no override, so
 * the real filename can't be computed client-side the way the record id can
 * — see src/lib/pocketbase/storageUrl.ts, which points every read call site
 * at this route instead of constructing a Pocketbase file URL directly.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bucket: string; path: string[] }> }
) {
  const { bucket, path: pathSegments } = await params;
  const path = pathSegments.join("/");
  const id = storageObjectId(bucket, path);

  try {
    const pb = await createPocketbaseAdminClient();
    const record = await pb.collection("storage_objects").getOne(id);
    const fileUrl = pb.files.getURL(record, record.file);
    return NextResponse.redirect(fileUrl);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
