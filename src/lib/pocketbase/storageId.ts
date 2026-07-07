/**
 * Deterministic Pocketbase record id for a (bucket, path) pair, so the client
 * can construct a file's public URL directly (no DB round-trip needed) — see
 * scripts/migrate-storage-to-pocketbase.ts (writer) and storageUrl.ts (reader).
 * Pocketbase record ids must be exactly 15 lowercase alphanumeric characters.
 */
export function storageObjectId(bucket: string, path: string): string {
  // Deno/browser/node all support Web Crypto's digest, but this needs to be
  // synchronous for use in render paths, so use a simple sync hash instead of
  // crypto.subtle (which is async-only). FNV-1a is more than sufficient here —
  // this only needs to be a stable, collision-resistant-enough identifier,
  // not a cryptographic hash.
  const input = `${bucket}:${path}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // 32-bit hash isn't enough entropy alone for 15 chars without bias; expand
  // by re-hashing with a salted pass and concatenating base36 chunks.
  let hash2 = 0x9e3779b9;
  for (let i = 0; i < input.length; i++) {
    hash2 ^= input.charCodeAt(i) + 0x9e3779b9 + (hash2 << 6) + (hash2 >>> 2);
    hash2 = hash2 >>> 0;
  }
  const part1 = (hash >>> 0).toString(36).padStart(7, "0");
  const part2 = (hash2 >>> 0).toString(36).padStart(7, "0");
  return `a${part1}${part2}`.slice(0, 15).padEnd(15, "0");
}

/**
 * Pocketbase may sanitize odd characters in an uploaded filename (spaces,
 * accents, etc.), which would make the stored filename unpredictable to a
 * reader. Store everything under a fixed name + the original extension only,
 * so the client can construct the file URL without querying the record.
 */
export function storageFilename(path: string): string {
  const base = path.split("/").pop() ?? path;
  const dot = base.lastIndexOf(".");
  const ext = dot >= 0 ? base.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "";
  return ext ? `file.${ext}` : "file";
}
