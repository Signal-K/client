import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";

export async function getActiveSailors(): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const pb = await createPocketbaseAdminClient();
  const rows = await pb.collection("ss_classifications").getFullList({
    filter: pb.filter("createdAt >= {:since} && author != null", { since }),
    fields: "author",
  });
  return new Set(rows.map((r) => r.author).filter(Boolean)).size;
}

export async function getTotalDiscoveries(): Promise<number> {
  const pb = await createPocketbaseAdminClient();
  const result = await pb.collection("ss_classifications").getList(1, 1);
  return result.totalItems;
}

export async function getActiveProjects(): Promise<number> {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const pb = await createPocketbaseAdminClient();
  const rows = await pb.collection("ss_classifications").getFullList({
    filter: pb.filter("createdAt >= {:since} && classificationtype != null", { since }),
    fields: "classificationtype",
  });
  return new Set(rows.map((r) => r.classificationtype).filter(Boolean)).size;
}
