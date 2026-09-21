import type PocketBase from "pocketbase";
import { type RecordModel } from "pocketbase";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { hydrateGardenState } from "@/src/features/garden/gardenLogic";
import {
  applyHubStatePatch,
  emptyHubState,
  parseOnboarding,
  type HubState,
  type HubStatePatch,
} from "@/src/features/onboarding/hubState";

const COLLECTION = "ss_hub_state";

type HubRecord = {
  id: string;
  onboarding?: unknown;
  garden?: unknown;
};

function isMissingCollection(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /missing collection|invalid collection|wasn't found|doesn't exist/i.test(message);
}

function asHubRecord(record: RecordModel | null): HubRecord | null {
  if (!record) return null;
  const row = record as RecordModel & HubRecord;
  return { id: row.id, onboarding: row.onboarding, garden: row.garden };
}

async function findHubRecord(userId: string, shared?: PocketBase): Promise<HubRecord | null> {
  try {
    const pb = shared ?? (await createPocketbaseAdminClient());
    const record = await pb
      .collection(COLLECTION)
      .getFirstListItem(pb.filter("userId = {:id}", { id: userId }))
      .catch((error) => {
        if (isMissingCollection(error)) return null;
        return null;
      });
    return asHubRecord(record);
  } catch (error) {
    console.warn(`[hub-state] lookup failed: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function recordToHubState(record: HubRecord | null): HubState {
  if (!record) return emptyHubState();
  return {
    onboarding: parseOnboarding(record.onboarding),
    garden: record.garden == null ? null : hydrateGardenState(record.garden),
  };
}

export async function loadHubState(userId: string, pb?: PocketBase): Promise<HubState> {
  const record = await findHubRecord(userId, pb);
  return recordToHubState(record);
}

export async function upsertHubState(
  userId: string,
  patch: HubStatePatch
): Promise<{ state: HubState; persisted: boolean }> {
  const record = await findHubRecord(userId);
  const current = recordToHubState(record);
  const next = applyHubStatePatch(current, {
    onboarding: patch.onboarding,
    garden: patch.garden !== undefined && patch.garden !== null ? hydrateGardenState(patch.garden) : patch.garden,
  });

  try {
    const pb = await createPocketbaseAdminClient();
    const payload: Record<string, unknown> = {
      userId,
      updatedAt: new Date().toISOString(),
    };
    if (patch.onboarding) payload.onboarding = next.onboarding;
    if (patch.garden !== undefined) payload.garden = next.garden;

    if (record) {
      await pb.collection(COLLECTION).update(record.id, payload);
    } else {
      await pb.collection(COLLECTION).create({
        ...payload,
        onboarding: next.onboarding,
        garden: next.garden,
      });
    }
    return { state: next, persisted: true };
  } catch (error) {
    console.warn(`[hub-state] persist failed: ${error instanceof Error ? error.message : String(error)}`);
    return { state: next, persisted: false };
  }
}
