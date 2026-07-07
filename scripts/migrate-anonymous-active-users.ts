#!/usr/bin/env tsx
/**
 * One-off follow-up to migrate-users-supabase-to-clerk.ts: creates Clerk users
 * for the small set of anonymous Supabase accounts that have real gameplay
 * data attached (see the "active anonymous" scoping decision recorded in
 * .claude/plans/sparkling-cooking-dewdrop.md conversation). This Clerk
 * instance requires an email per user, so each gets a synthetic placeholder
 * (never delivered anywhere) and is flagged publicMetadata.guest = true, same
 * as any other guest — they can convert to a real account later via the
 * normal ConvertAnonymousAccount flow.
 *
 * Usage:
 *   SUPABASE_URL=... CLERK_SECRET_KEY=... \
 *     npx tsx scripts/migrate-anonymous-active-users.ts <id1> <id2> ...
 */
import { createClerkClient } from "@clerk/backend";
import fs from "fs";

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const reportPath = process.env.REPORT_PATH || "anonymous-active-migration-report.json";
const ids = process.argv.slice(2);

if (!clerkSecretKey || !ids.length) {
  console.error("Usage: CLERK_SECRET_KEY=... npx tsx scripts/migrate-anonymous-active-users.ts <supabaseId...>");
  process.exit(1);
}

const clerk = createClerkClient({ secretKey: clerkSecretKey });

async function run() {
  const results: Array<{ supabaseId: string; clerkId: string | null; status: string; detail?: string }> = [];

  for (const id of ids) {
    try {
      const created = await clerk.users.createUser({
        externalId: id,
        emailAddress: [`guest-${id}@guests.starsailors.space`],
        skipPasswordChecks: true,
        skipPasswordRequirement: true,
        publicMetadata: { guest: true },
      });
      results.push({ supabaseId: id, clerkId: created.id, status: "created" });
      console.log(`[created] ${id} -> ${created.id}`);
    } catch (err: any) {
      const detail = err?.errors?.[0]?.longMessage ?? err?.message ?? String(err);
      results.push({ supabaseId: id, clerkId: null, status: "error", detail });
      console.log(`[error] ${id}: ${detail}`);
    }
  }

  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} results to ${reportPath}`);
}

run();
