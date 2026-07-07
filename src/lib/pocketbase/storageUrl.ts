/**
 * Builds a stable URL for a migrated storage object, given the same
 * (bucket, path) addressing the app used against Supabase Storage (e.g.
 * `getStorageUrl("clouds", \`${anomalyId}.png\`)`). Resolves via
 * /api/storage/[bucket]/[...path], which does the actual Pocketbase lookup
 * server-side — see that route for why (Pocketbase randomizes stored
 * filenames, so the real file URL can't be computed client-side).
 */
export function getStorageUrl(bucket: string, path: string): string {
  return `/api/storage/${bucket}/${path}`;
}
