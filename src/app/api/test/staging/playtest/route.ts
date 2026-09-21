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
];

function notFound() {
  // Do not reveal whether the guard, a user id, or a secret was wrong.
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

async function deletePocketBaseRecords(userId: string): Promise<number> {
  const pb = await createPocketbaseAdminClient();
  let deleted = 0;

  for (const [collection, field] of ACCOUNT_RECORDS) {
    const records = await pb.collection(collection).getFullList({
      filter: pb.filter(`${field} = {:userId}`, { userId }),
      fields: "id",
    });
    await Promise.all(records.map((record) => pb.collection(collection).delete(record.id)));
    deleted += records.length;
  }

  return deleted;
}

export async function POST(request: Request) {
  if (!authorizesStagingPlaytest(request)) return notFound();

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
  if (!authorizesStagingPlaytest(request)) return notFound();

  const body = (await request.json().catch(() => null)) as { userId?: unknown } | null;
  if (!body || typeof body.userId !== "string" || !body.userId) return notFound();

  const client = await clerkClient();
  const user = (await client.users.getUser(body.userId).catch(() => null)) as PlaytestUser | null;
  if (!user || !isStagingPlaytestMetadata(user.privateMetadata)) return notFound();

  const deletedRecords = await deletePocketBaseRecords(user.id);
  await client.users.deleteUser(user.id);
  const stillExists = await client.users.getUser(user.id).then(() => true).catch(() => false);
  if (stillExists) {
    return NextResponse.json({ error: "Could not verify test-account deletion" }, { status: 502 });
  }

  console.info("[staging-playtest] cleaned", { userId: user.id, deletedRecords });
  return NextResponse.json({ deleted: true, deletedRecords });
}
