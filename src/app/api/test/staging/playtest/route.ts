import { randomUUID } from "node:crypto";

import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import {
  authorizesStagingPlaytest,
  isStagingPlaytestMetadata,
  STAGING_PLAYTEST_MARKER,
} from "@/lib/server/stagingPlaytestAuth";

export const dynamic = "force-dynamic";

type PlaytestUser = {
  id: string;
  privateMetadata: unknown;
};

// Every selector is an account identifier written by this client. The list is
// deliberately explicit rather than deleting an arbitrary PocketBase user or
// relying on unverified cascade rules in the shared staging/prod database.
const ACCOUNT_RECORDS: ReadonlyArray<readonly [collection: string, field: string]> = [
  ["ss_comments", "author"],
  ["votes", "userId"],
  ["user_mineral_inventory", "userId"],
  ["survey_rewards", "userId"],
  ["researched", "userId"],
  ["missions", "userId"],
  ["defensive_probes", "userId"],
  ["nps_surveys", "userId"],
  ["uploads", "author"],
  ["zoo", "author"],
  ["zoo", "owner"],
  ["linked_anomalies", "author"],
  ["routes", "author"],
  ["inventory", "owner"],
  ["mineral_deposits", "owner"],
  ["ss_classifications", "author"],
  ["referrals", "referreeId"],
  ["ss_hub_state", "userId"],
  ["profiles", "userId"],
  ["push_subscriptions", "profileId"],
  ["notification_rejections", "profileId"],
];

function notFound(reason: string) {
  // The response never reveals whether the guard, a user id, or a secret was
  // wrong; the reason is audit-only and carries no caller-supplied values.
  console.warn("[staging-playtest] rejected", { reason });
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

async function deletePocketBaseRecords(userId: string): Promise<{ deleted: number; remaining: number }> {
  const pb = await createPocketbaseAdminClient();
  let deleted = 0;
  let remaining = 0;
  const list = (collection: string, field: string) =>
    pb.collection(collection).getFullList({
      filter: pb.filter(`${field} = {:userId}`, { userId }),
      fields: "id",
    });

  for (const [collection, field] of ACCOUNT_RECORDS) {
    const records = await list(collection, field);
    await Promise.all(records.map((record) => pb.collection(collection).delete(record.id)));
    deleted += records.length;
    remaining += (await list(collection, field)).length;
  }

  return { deleted, remaining };
}

export async function POST(request: Request) {
  if (!authorizesStagingPlaytest(request)) return notFound("guard");

  const id = randomUUID();
  const client = await clerkClient();
  const user = await client.users.createUser({
    // RFC 2606's .test domain guarantees this address cannot be delivered.
    // Clerk does not need it verified because the server mints the short-lived
    // ticket below; normal sign-up verification remains untouched.
    emailAddress: [`ssc-playtest-${id}@example.test`],
    externalId: `ssc-playtest-${id}`,
    privateMetadata: {
      starSailorsPlaytest: {
        marker: STAGING_PLAYTEST_MARKER,
        createdAt: new Date().toISOString(),
      },
    },
    skipPasswordChecks: true,
    skipPasswordRequirement: true,
  });
  const token = await client.signInTokens.createSignInToken({
    userId: user.id,
    expiresInSeconds: 60,
  });

  console.info("[staging-playtest] provisioned", { userId: user.id });
  return NextResponse.json({ userId: user.id, ticket: token.token });
}

export async function DELETE(request: Request) {
  if (!authorizesStagingPlaytest(request)) return notFound("guard");

  const body = (await request.json().catch(() => null)) as { userId?: unknown } | null;
  if (!body || typeof body.userId !== "string" || !body.userId) return notFound("bad-body");

  const client = await clerkClient();
  const user = (await client.users.getUser(body.userId).catch(() => null)) as PlaytestUser | null;
  if (!user || !isStagingPlaytestMetadata(user.privateMetadata)) return notFound("not-owned");

  const { deleted: deletedRecords, remaining } = await deletePocketBaseRecords(user.id);
  if (remaining > 0) {
    console.error("[staging-playtest] cleanup incomplete", { userId: user.id, remaining });
    return NextResponse.json({ error: "Could not verify test-data deletion" }, { status: 502 });
  }
  await client.users.deleteUser(user.id);
  const stillExists = await client.users.getUser(user.id).then(() => true).catch(() => false);
  if (stillExists) {
    return NextResponse.json({ error: "Could not verify test-account deletion" }, { status: 502 });
  }

  console.info("[staging-playtest] cleaned", { userId: user.id, deletedRecords });
  return NextResponse.json({ deleted: true, deletedRecords });
}
