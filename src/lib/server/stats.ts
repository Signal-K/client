import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";

/** Hard cap so landing SSR cannot pull the full classifications collection into a Worker isolate. */
export const LANDING_STATS_SCAN_LIMIT = 50;

export function uniqueNonEmptyStrings(values: unknown[]): number {
  const unique = new Set<string>();
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) {
      unique.add(value);
    }
  }
  return unique.size;
}

async function uniqueFieldSample(options: {
  filter: string;
  field: string;
}): Promise<number> {
  const pb = await createPocketbaseAdminClient();
  const result = await pb.collection("ss_classifications").getList(1, LANDING_STATS_SCAN_LIMIT, {
    filter: options.filter,
    fields: options.field,
  });
  return uniqueNonEmptyStrings(result.items.map((row) => row[options.field]));
}

export async function getActiveSailors(): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const pb = await createPocketbaseAdminClient();
  return uniqueFieldSample({
    filter: pb.filter("createdAt >= {:since} && author != null", { since }),
    field: "author",
  });
}

export async function getTotalDiscoveries(): Promise<number> {
  const pb = await createPocketbaseAdminClient();
  const result = await pb.collection("ss_classifications").getList(1, 1);
  return result.totalItems;
}

export async function getActiveProjects(): Promise<number> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const pb = await createPocketbaseAdminClient();
  return uniqueFieldSample({
    filter: pb.filter("createdAt >= {:since} && classificationtype != null", { since }),
    field: "classificationtype",
  });
}
