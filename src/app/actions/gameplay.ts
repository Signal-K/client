"use server";

import { revalidatePath } from "next/cache";
import { getRouteUser } from "@/lib/server/routeAuth";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { mapMineralDepositToRow } from "@/lib/pocketbase/legacyShapes";
import { recursiveSerialize } from "@/utils/serialization";

// ── NPS ──────────────────────────────────────────────────────────────────────

export async function submitNpsAction(input: { npsScore: number; feedback?: string | null }) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) return { ok: false as const, error: "Unauthorized" };

  const { npsScore, feedback = null } = input;
  if (!Number.isFinite(npsScore) || npsScore < 0 || npsScore > 10) {
    return { ok: false as const, error: "Invalid score" };
  }

  const pb = await createPocketbaseAdminClient();
  await pb.collection("nps_surveys").create({
    createdAt: new Date().toISOString(),
    userId: user.id,
    npsScore,
    projectInterests: feedback,
  });

  revalidatePath("/game");
  return { ok: true as const };
}

// ── SURVEYOR COMMENT ─────────────────────────────────────────────────────────

type SurveyorCommentInput = {
  classificationId: number;
  content: string;
  configuration?: Record<string, unknown>;
  surveyor?: string;
  category?: string;
  value?: string;
};

export async function submitSurveyorCommentAction(input: SurveyorCommentInput) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) return { ok: false as const, error: "Unauthorized" };

  const { classificationId, content, configuration, surveyor, category, value } = input;
  if (!Number.isFinite(classificationId) || !content.trim()) {
    return { ok: false as const, error: "Invalid payload" };
  }

  const pb = await createPocketbaseAdminClient();
  const latest = await pb.collection("ss_comments").getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
  const nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;

  await pb.collection("ss_comments").create({
    legacyId: nextLegacyId,
    createdAt: new Date().toISOString(),
    content,
    classificationId,
    author: user.id,
    configuration: configuration ?? null,
    surveyor: surveyor ?? null,
    category: category ?? null,
    value: value ?? null,
  });

  revalidatePath(`/planets/${classificationId}`);
  revalidatePath(`/posts/surveyor/${classificationId}`);
  return { ok: true as const };
}

// ── EXTRACTION ───────────────────────────────────────────────────────────────

export async function getExtractionDepositAction(depositId: number) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) return { ok: false as const, error: "Unauthorized" };

  if (!Number.isFinite(depositId)) return { ok: false as const, error: "Invalid deposit ID" };

  const pb = await createPocketbaseAdminClient();
  const record = await pb
    .collection("mineral_deposits")
    .getFirstListItem(pb.filter("legacyId = {:id}", { id: depositId }))
    .catch(() => null);
  if (!record) return { ok: false as const, error: "Mineral deposit not found" };
  if (record.owner !== user.id) return { ok: false as const, error: "Forbidden" };

  return { ok: true as const, deposit: recursiveSerialize(mapMineralDepositToRow(record)) };
}

export async function completeExtractionAction(input: {
  depositId: number;
  extractedQuantity: number;
  purity: number;
}) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) return { ok: false as const, error: "Unauthorized" };

  const { depositId, extractedQuantity, purity } = input;
  if (!Number.isFinite(depositId)) return { ok: false as const, error: "Invalid deposit ID" };
  if (!Number.isFinite(extractedQuantity) || extractedQuantity <= 0 || !Number.isFinite(purity)) {
    return { ok: false as const, error: "Invalid extraction payload" };
  }

  const pb = await createPocketbaseAdminClient();
  const deposit = await pb
    .collection("mineral_deposits")
    .getFirstListItem(pb.filter("legacyId = {:id}", { id: depositId }))
    .catch(() => null);
  if (!deposit) return { ok: false as const, error: "Mineral deposit not found" };
  if (deposit.owner !== user.id) return { ok: false as const, error: "Forbidden" };

  const mineralType = deposit.mineralConfiguration?.type;
  if (!mineralType) return { ok: false as const, error: "Deposit has no mineral type" };

  const latest = await pb
    .collection("user_mineral_inventory")
    .getList(1, 1, { sort: "-legacyId", fields: "legacyId" });
  const nextLegacyId = (latest.items[0]?.legacyId ?? 0) + 1;

  await pb.collection("user_mineral_inventory").create({
    legacyId: nextLegacyId,
    userId: user.id,
    mineralDepositId: deposit.legacyId,
    mineralType: String(mineralType),
    quantity: extractedQuantity,
    purity,
    extractedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });

  const updatedConfig = { ...deposit.mineralConfiguration, amount: 0, quantity: 0 };
  await pb.collection("mineral_deposits").update(deposit.id, { mineralConfiguration: updatedConfig });

  revalidatePath("/inventory");
  revalidatePath(`/extraction/${deposit.legacyId}`);
  return { ok: true as const };
}
