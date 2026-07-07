#!/usr/bin/env tsx
/**
 * One-time migration: Supabase Auth users -> Clerk.
 *
 * Run this yourself against production (it needs your Supabase service-role key
 * and Clerk secret key) — see .claude/plans/sparkling-cooking-dewdrop.md, Phase 1.
 * Not run as part of this change. Defaults to DRY_RUN=true so a first pass just
 * prints what it would do.
 *
 * For every Supabase user this:
 *   1. Reads their email, verification status, password hash (if bcrypt), and
 *      any linked Google identity from auth.users / auth.identities.
 *   2. Creates a matching Clerk user via clerkClient.users.createUser(), setting
 *      `externalId` to the Supabase user's UUID — this is the join key the
 *      follow-up SQL migration (scripts/migrate-user-ids-supabase-to-clerk.sql)
 *      uses to remap `profiles.id` and every `user_id`/`profile_id` column from
 *      the old UUID to the new Clerk id.
 *   3. Leaves Google-linked accounts to auto-link on next Google sign-in (Clerk
 *      links by verified email automatically) — no identity import needed.
 *   4. Writes a JSON report (old id -> new id, and any per-user errors) so the
 *      SQL remap step and any manual follow-up have something to work from.
 *
 * Users whose password hash isn't a supported bcrypt digest are created without
 * a password and will need to use "forgot password" on first login post-cutover.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... CLERK_SECRET_KEY=... \
 *     DRY_RUN=true npx tsx scripts/migrate-users-supabase-to-clerk.ts
 */

import { createClient } from "@supabase/supabase-js";
import { createClerkClient } from "@clerk/backend";
import fs from "fs";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const dryRun = String(process.env.DRY_RUN ?? "true").toLowerCase() !== "false";
const reportPath = process.env.REPORT_PATH || "user-migration-report.json";
const pageSize = Number(process.env.PAGE_SIZE || 200);

if (!supabaseUrl || !supabaseServiceRoleKey || !clerkSecretKey) {
  console.error(
    "Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CLERK_SECRET_KEY"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
const clerk = createClerkClient({ secretKey: clerkSecretKey });

type MigrationResult = {
  supabaseId: string;
  email: string | null;
  clerkId: string | null;
  status: "created" | "skipped" | "error" | "dry-run";
  detail?: string;
};

// Supabase's default password hash is bcrypt ("$2a$"/"$2b$") — Clerk's
// createUser accepts that directly via passwordHasher: "bcrypt".
function isBcryptHash(hash: string | null | undefined): hash is string {
  return typeof hash === "string" && /^\$2[aby]\$/.test(hash);
}

async function migrateUser(user: {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
  encrypted_password?: string | null;
}): Promise<MigrationResult> {
  const email = user.email ?? null;

  if (dryRun) {
    return { supabaseId: user.id, email, clerkId: null, status: "dry-run" };
  }

  try {
    const created = await clerk.users.createUser({
      externalId: user.id,
      emailAddress: email ? [email] : undefined,
      skipPasswordChecks: true,
      skipPasswordRequirement: !isBcryptHash(user.encrypted_password),
      ...(isBcryptHash(user.encrypted_password)
        ? { passwordDigest: user.encrypted_password, passwordHasher: "bcrypt" as const }
        : {}),
    });

    return { supabaseId: user.id, email, clerkId: created.id, status: "created" };
  } catch (err: any) {
    return {
      supabaseId: user.id,
      email,
      clerkId: null,
      status: "error",
      detail: err?.errors?.[0]?.longMessage ?? err?.message ?? String(err),
    };
  }
}

// Optional: path to a JSON array of Supabase user ids to migrate. When set,
// users with no email AND not in this list are skipped (used to exclude
// abandoned anonymous/guest sessions with no gameplay data attached — see
// .claude/plans/sparkling-cooking-dewdrop.md).
const includeIdsFile = process.env.INCLUDE_USER_IDS_FILE;
const includeIds: Set<string> | null = includeIdsFile
  ? new Set(JSON.parse(fs.readFileSync(includeIdsFile, "utf-8")))
  : null;

async function run() {
  const results: MigrationResult[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: pageSize });
    if (error) {
      console.error("Failed to list Supabase users:", error.message);
      process.exit(1);
    }

    if (!data.users.length) break;

    for (const user of data.users) {
      if (includeIds && !user.email && !includeIds.has(user.id)) {
        results.push({ supabaseId: user.id, email: null, clerkId: null, status: "skipped" });
        console.log(`[skipped] ${user.id} (no email, no gameplay data)`);
        continue;
      }
      const result = await migrateUser(user as any);
      results.push(result);
      console.log(`[${result.status}] ${user.id} (${user.email ?? "no email"})`);
    }

    if (data.users.length < pageSize) break;
    page += 1;
  }

  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nWrote ${results.length} results to ${reportPath}`);

  if (dryRun) {
    console.log("\nDRY_RUN=true — no Clerk users were created. Re-run with DRY_RUN=false to migrate for real.");
  } else {
    const errors = results.filter((r) => r.status === "error");
    if (errors.length) {
      console.warn(`\n${errors.length} user(s) failed to migrate — see ${reportPath} for details.`);
    }
  }
}

run();
