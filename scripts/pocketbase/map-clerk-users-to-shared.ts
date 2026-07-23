#!/usr/bin/env node
import fs from "node:fs/promises";
import PocketBase from "pocketbase";
import { createClerkClient } from "@clerk/backend";

const sourceUrl = process.env.LEGACY_POCKETBASE_URL || "http://localhost:8095";
const sharedUrl = process.env.SHARED_POCKETBASE_URL || "http://localhost:8090";
const sourceEmail = process.env.LEGACY_POCKETBASE_ADMIN_EMAIL;
const sourcePassword = process.env.LEGACY_POCKETBASE_ADMIN_PASSWORD;
const sharedEmail = process.env.SHARED_POCKETBASE_ADMIN_EMAIL;
const sharedPassword = process.env.SHARED_POCKETBASE_ADMIN_PASSWORD;
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerkUsersExport = process.env.CLERK_USERS_EXPORT;
const dryRun = String(process.env.DRY_RUN ?? "true").toLowerCase() !== "false";
const reportPath = process.env.REPORT_PATH || "clerk-shared-user-map.json";
const profileLimit = Number(process.env.PROFILE_LIMIT || 0);

if (!sourceEmail || !sourcePassword || !sharedEmail || !sharedPassword || !clerkSecretKey) {
  console.error(
    "Missing LEGACY_POCKETBASE_ADMIN_EMAIL/PASSWORD, SHARED_POCKETBASE_ADMIN_EMAIL/PASSWORD, or CLERK_SECRET_KEY",
  );
  process.exit(1);
}

const source = new PocketBase(sourceUrl);
const shared = new PocketBase(sharedUrl);
const clerk = createClerkClient({ secretKey: clerkSecretKey });

type ExportedClerkUser = {
  id: string;
  email_addresses?: Array<{ email_address?: string }>;
  first_name?: string | null;
  last_name?: string | null;
};

async function loadClerkExport() {
  if (!clerkUsersExport) return new Map<string, ExportedClerkUser>();
  const pages = JSON.parse(await fs.readFile(clerkUsersExport, "utf8")) as Array<{
    data?: ExportedClerkUser[];
  }>;
  const users = new Map<string, ExportedClerkUser>();
  for (const page of pages) {
    for (const user of page.data ?? []) users.set(user.id, user);
  }
  return users;
}

type Mapping = {
  clerkUserId: string;
  sharedUserId: string | null;
  ecosystemProfileId: string | null;
  email: string | null;
  status: "dry-run" | "created" | "already-mapped" | "error";
  detail?: string;
};

function guestEmail(clerkUserId: string) {
  return `guest-${clerkUserId}@guests.starsailors.space`;
}

async function main() {
  await source.collection("_superusers").authWithPassword(sourceEmail!, sourcePassword!);
  await shared.collection("_superusers").authWithPassword(sharedEmail!, sharedPassword!);

  const profiles = await source.collection("profiles").getFullList({
    fields: "id,userId,username,fullName,referralCode",
  });
  const selectedProfiles = profileLimit > 0 ? profiles.slice(0, profileLimit) : profiles;
  const exportedUsers = await loadClerkExport();
  let identityCollectionAvailable = false;
  try {
    await shared.collections.getOne("ss_clerk_identity");
    identityCollectionAvailable = true;
  } catch {
    console.warn("ss_clerk_identity is unavailable; using email matching without a ledger.");
  }
  const report: Mapping[] = [];

  for (const profile of selectedProfiles) {
    const clerkUserId = String(profile.userId || "");
    if (!clerkUserId) continue;

    try {
      const clerkUser = exportedUsers.get(clerkUserId) ?? (await clerk.users.getUser(clerkUserId));
      const email =
        ("primaryEmailAddress" in clerkUser
          ? clerkUser.primaryEmailAddress?.emailAddress
          : clerkUser.email_addresses?.[0]?.email_address) ?? guestEmail(clerkUserId);
      const identity = identityCollectionAvailable
        ? await shared
            .collection("ss_clerk_identity")
            .getFirstListItem(shared.filter("clerk_user_id = {:id}", { id: clerkUserId }))
            .catch(() => null)
        : null;
      const existing = identity
        ? await shared.collection("users").getOne(identity.shared_user_id).catch(() => null)
        : await shared
            .collection("users")
            .getFirstListItem(shared.filter("email = {:email}", { email }))
            .catch(() => null);

      if (existing && identity) {
        report.push({
          clerkUserId,
          sharedUserId: existing.id,
          ecosystemProfileId: null,
          email,
          status: "already-mapped",
        });
        continue;
      }

      if (dryRun) {
        report.push({ clerkUserId, sharedUserId: null, ecosystemProfileId: null, email, status: "dry-run" });
        continue;
      }

      // PocketBase hashes passwords with bcrypt; keep the temporary value
      // below bcrypt's 72-byte input limit.
      const temporaryPassword = `SS-${crypto.randomUUID()}-${crypto.randomUUID().slice(0, 16)}`;
      const sharedUser = existing ?? (await shared.collection("users").create({
        email,
        emailVisibility: false,
        verified: true,
        name: profile.fullName || profile.username || "Star Sailor",
        password: temporaryPassword,
        passwordConfirm: temporaryPassword,
      }));
      if (!sharedUser) throw new Error("Shared user anchor was not returned");

      if (identityCollectionAvailable && !identity) {
        try {
          await shared.collection("ss_clerk_identity").create({
            shared_user_id: sharedUser.id,
            clerk_user_id: clerkUserId,
            source_user_id: clerkUserId,
            source: "legacy_star_sailors",
          });
        } catch {
          identityCollectionAvailable = false;
          console.warn("ss_clerk_identity became unavailable; continuing with email matching.");
        }
      }

      report.push({
        clerkUserId,
        sharedUserId: sharedUser.id,
        ecosystemProfileId: null,
        email,
        status: existing ? "already-mapped" : "created",
      });
    } catch (error) {
      const details = error as { message?: string; response?: unknown; data?: unknown };
      report.push({
        clerkUserId,
        sharedUserId: null,
        ecosystemProfileId: null,
        email: null,
        status: "error",
        detail: [
          details.message || (error instanceof Error ? error.message : String(error)),
          details.response || details.data ? JSON.stringify(details.response || details.data) : "",
        ]
          .filter(Boolean)
          .join(" "),
      });
    }

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  }

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  const counts = report.reduce<Record<string, number>>((result, entry) => {
    result[entry.status] = (result[entry.status] ?? 0) + 1;
    return result;
  }, {});
  console.log(`${dryRun ? "[DRY RUN] " : ""}Mapped ${report.length} legacy Clerk identities:`, counts);
  console.log(`Report: ${reportPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
