#!/usr/bin/env tsx
/**
 * One-time remediation, follow-up to scripts/migrate-users-supabase-to-clerk.ts.
 *
 * That script's plain `emailAddress: undefined` approach for anonymous Supabase
 * users (no email) fails Clerk's user-creation validation on this instance
 * ("email_address data doesn't match user requirements set for this instance").
 * 6 anonymous users were nonetheless already migrated successfully at some
 * point using a synthesized `guest-<supabase-uuid>@guests.starsailors.space`
 * email instead of a blank one — this script applies that same pattern to
 * every remaining anonymous Supabase user so their externalId (needed by
 * scripts/migrate-user-ids-supabase-to-clerk.sql and the Pocketbase
 * remediation in scripts/fix-stale-pocketbase-user-ids.ts) gets set.
 *
 * Skips any Supabase user who already has a Clerk user with matching
 * externalId (idempotent / safe to re-run).
 *
 * Defaults to DRY_RUN=true.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... CLERK_SECRET_KEY=... \
 *     DRY_RUN=true npx tsx scripts/migrate-anonymous-guests-to-clerk.ts
 */
import { createClient } from "@supabase/supabase-js";
import { createClerkClient } from "@clerk/backend";
import fs from "fs";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const dryRun = String(process.env.DRY_RUN ?? "true").toLowerCase() !== "false";
const reportPath = process.env.REPORT_PATH || "guest-migration-report.json";
const pageSize = Number(process.env.PAGE_SIZE || 200);
const GUEST_EMAIL_DOMAIN = "guests.starsailors.space";

if (!supabaseUrl || !supabaseServiceRoleKey || !clerkSecretKey) {
  console.error("Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CLERK_SECRET_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } });
const clerk = createClerkClient({ secretKey: clerkSecretKey });

type Result = {
  supabaseId: string;
  clerkId: string | null;
  status: "created" | "already-migrated" | "error" | "dry-run";
  detail?: string;
};

async function withRetries<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr;
}

async function existingClerkIdFor(supabaseId: string): Promise<string | null> {
  const { data } = await withRetries(() => clerk.users.getUserList({ externalId: [supabaseId], limit: 1 }));
  return data[0]?.id ?? null;
}

async function migrateGuest(supabaseId: string): Promise<Result> {
  let existing: string | null;
  try {
    existing = await existingClerkIdFor(supabaseId);
  } catch (err: any) {
    return {
      supabaseId,
      clerkId: null,
      status: "error",
      detail: `existence check failed: ${err?.message ?? String(err)}`,
    };
  }
  if (existing) {
    return { supabaseId, clerkId: existing, status: "already-migrated" };
  }

  if (dryRun) {
    return { supabaseId, clerkId: null, status: "dry-run" };
  }

  try {
    const created = await withRetries(() =>
      clerk.users.createUser({
        externalId: supabaseId,
        emailAddress: [`guest-${supabaseId}@${GUEST_EMAIL_DOMAIN}`],
        skipPasswordChecks: true,
        skipPasswordRequirement: true,
        publicMetadata: { guest: true },
      })
    );
    return { supabaseId, clerkId: created.id, status: "created" };
  } catch (err: any) {
    return {
      supabaseId,
      clerkId: null,
      status: "error",
      detail: err?.errors?.[0]?.longMessage ?? err?.message ?? String(err),
    };
  }
}

async function run() {
  const results: Result[] = [];
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: pageSize });
    if (error) {
      console.error("Failed to list Supabase users:", error.message);
      process.exit(1);
    }
    if (!data.users.length) break;

    for (const user of data.users) {
      if (user.email) continue; // has-email users are handled by migrate-users-supabase-to-clerk.ts
      const result = await migrateGuest(user.id);
      results.push(result);
      console.log(`[${result.status}] ${user.id}${result.clerkId ? ` -> ${result.clerkId}` : ""}`);
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    }

    if (data.users.length < pageSize) break;
    page += 1;
  }

  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  const counts = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`\n${dryRun ? "[DRY RUN] " : ""}Wrote ${results.length} results to ${reportPath}`);
  console.log(counts);
}

run();
