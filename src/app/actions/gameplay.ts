"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/server/prisma";
import { getRouteUser } from "@/lib/server/supabaseRoute";
import { recursiveSerialize } from "@/utils/serialization";

// ── NPS ──────────────────────────────────────────────────────────────────────

export async function submitNpsAction(input: { npsScore: number; feedback?: string | null }) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) return { ok: false as const, error: "Unauthorized" };

  const { npsScore, feedback = null } = input;
  if (!Number.isFinite(npsScore) || npsScore < 0 || npsScore > 10) {
    return { ok: false as const, error: "Invalid score" };
  }

  await prisma.$executeRaw`
    INSERT INTO nps_surveys (user_id, nps_score, project_interests)
    VALUES (${user.id}, ${npsScore}, ${feedback})
  `;

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

  const configurationJson = configuration ? JSON.stringify(configuration) : null;
  const surveyorVal = surveyor ?? null;
  const categoryVal = category ?? null;
  const valueVal = value ?? null;

  await prisma.$executeRaw`
    INSERT INTO comments (content, classification_id, author, configuration, surveyor, category, value)
    VALUES (
      ${content},
      ${classificationId},
      ${user.id},
      ${configurationJson}::jsonb,
      ${surveyorVal},
      ${categoryVal},
      ${valueVal}
    )
  `;

  revalidatePath(`/planets/${classificationId}`);
  revalidatePath(`/posts/surveyor/${classificationId}`);
  return { ok: true as const };
}

// ── EXTRACTION ───────────────────────────────────────────────────────────────

export async function getExtractionDepositAction(depositId: number) {
  const { user, authError } = await getRouteUser();
  if (authError || !user) return { ok: false as const, error: "Unauthorized" };

  if (!Number.isFinite(depositId)) return { ok: false as const, error: "Invalid deposit ID" };

  const rows = await prisma.$queryRaw<Array<Record<string, unknown>>>`
    SELECT * FROM mineral_deposits WHERE id = ${depositId} LIMIT 1
  `;
  const data = rows[0];
  if (!data) return { ok: false as const, error: "Mineral deposit not found" };
  if (data.owner !== user.id) return { ok: false as const, error: "Forbidden" };

  return { ok: true as const, deposit: recursiveSerialize(data) };
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

  const depositRows = await prisma.$queryRaw<
    Array<{ id: number; owner: string; mineral_configuration: Record<string, unknown> | null }>
  >`
    SELECT id, owner, mineral_configuration FROM mineral_deposits WHERE id = ${depositId} LIMIT 1
  `;
  const deposit = depositRows[0];
  if (!deposit) return { ok: false as const, error: "Mineral deposit not found" };
  if (deposit.owner !== user.id) return { ok: false as const, error: "Forbidden" };

  const mineralType = deposit.mineral_configuration?.type;
  if (!mineralType) return { ok: false as const, error: "Deposit has no mineral type" };

  await prisma.$executeRaw`
    INSERT INTO user_mineral_inventory (user_id, mineral_deposit_id, mineral_type, quantity, purity, extracted_at)
    VALUES (${user.id}, ${deposit.id}, ${String(mineralType)}, ${extractedQuantity}, ${purity}, ${new Date().toISOString()})
  `;

  const updatedConfig = { ...deposit.mineral_configuration, amount: 0, quantity: 0 };
  await prisma.$executeRaw`
    UPDATE mineral_deposits SET mineral_configuration = ${JSON.stringify(updatedConfig)}::jsonb WHERE id = ${deposit.id}
  `;

  revalidatePath("/inventory");
  revalidatePath(`/extraction/${deposit.id}`);
  return { ok: true as const };
}
