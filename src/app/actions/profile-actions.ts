"use server";

import { revalidatePath } from "next/cache";
import { getRouteUser } from "@/lib/server/supabaseRoute";
import { createPocketbaseAdminClient } from "@/lib/pocketbase/adminClient";
import { getStorageUrl } from "@/lib/pocketbase/storageUrl";
import { storageObjectId, storageFilename } from "@/lib/pocketbase/storageId";
import { ReferralService } from "@/src/features/referrals/referral-service";

async function findProfileByUserId(pb: Awaited<ReturnType<typeof createPocketbaseAdminClient>>, userId: string) {
  return pb
    .collection("profiles")
    .getFirstListItem(pb.filter("userId = {:id}", { id: userId }))
    .catch(() => null);
}

export async function getCurrentProfileAction() {
  const { user } = await getRouteUser();
  if (!user) return { ok: false as const, error: "Unauthorized" };

  const pb = await createPocketbaseAdminClient();
  const profile = await findProfileByUserId(pb, user.id);

  return {
    ok: true as const,
    data: profile
      ? {
          username: profile.username ?? null,
          fullName: profile.fullName ?? null,
          avatarUrl: profile.avatarUrl ?? null,
          referralCode: profile.referralCode ?? null,
        }
      : null,
  };
}

export async function updateProfileSetupAction(formData: FormData) {
  const { user } = await getRouteUser();
  if (!user) return { ok: false as const, error: "Unauthorized" };

  const username = String(formData.get("username") || "").trim();
  const firstName = String(formData.get("firstName") || "").trim();
  const existingAvatarPreview = String(formData.get("existingAvatarPreview") || "");
  const avatar = formData.get("avatar");

  if (!username) {
    return { ok: false as const, error: "Username is required." };
  }

  const pb = await createPocketbaseAdminClient();

  let avatar_url: string | null = existingAvatarPreview && existingAvatarPreview.trim() ? existingAvatarPreview : null;
  if (avatar && avatar instanceof File && avatar.size > 0) {
    const fileName = `${Date.now()}-${user.id}-avatar.png`;
    try {
      const pbFormData = new FormData();
      pbFormData.append("id", storageObjectId("avatars", fileName));
      pbFormData.append("bucket", "avatars");
      pbFormData.append("path", fileName);
      pbFormData.append(
        "file",
        new File([avatar], storageFilename(fileName), { type: avatar.type || "image/png" })
      );
      await pb.collection("storage_objects").create(pbFormData);
    } catch (error: any) {
      return { ok: false as const, error: error?.message || "Avatar upload failed" };
    }
    avatar_url = getStorageUrl("avatars", fileName);
  }

  try {
    const referralCode = await ReferralService.ensureReferralCode(user.id);
    const existing = await findProfileByUserId(pb, user.id);

    const fields = {
      username,
      fullName: firstName,
      avatarUrl: avatar_url,
      updatedAt: new Date().toISOString(),
    };

    if (existing) {
      await pb.collection("profiles").update(existing.id, fields);
    } else {
      await pb.collection("profiles").create({ userId: user.id, referralCode, ...fields });
    }
  } catch (error) {
    return { ok: false as const, error: String(error) };
  }

  revalidatePath("/account");
  revalidatePath("/game");
  revalidatePath("/research");
  return { ok: true as const };
}

export async function completeProfileAction(input: {
  username: string;
  fullName: string;
  referrerCodeInput?: string;
}) {
  const { user } = await getRouteUser();
  if (!user) return { ok: false as const, error: "Unauthorized" };

  const username = input.username.trim();
  if (username.length < 3) {
    return { ok: false as const, error: "Username must be at least 3 characters." };
  }

  const pb = await createPocketbaseAdminClient();

  try {
    const referralCode = await ReferralService.ensureReferralCode(user.id);
    const existing = await findProfileByUserId(pb, user.id);

    const fields = {
      username,
      fullName: input.fullName.trim(),
      updatedAt: new Date().toISOString(),
    };

    if (existing) {
      await pb.collection("profiles").update(existing.id, fields);
    } else {
      await pb.collection("profiles").create({ userId: user.id, referralCode, ...fields });
    }

    const referrerCode = (input.referrerCodeInput || "").trim();
    if (referrerCode) {
      try {
        await ReferralService.applyReferral(user.id, referrerCode);
      } catch (e) {
        console.warn("Failed to apply referral code during profile completion:", e);
        // We don't block profile completion if referral fails
      }
    }
  } catch (error) {
    return { ok: false as const, error: "Failed to update profile." };
  }

  revalidatePath("/game");
  revalidatePath("/research");
  revalidatePath("/account");
  return { ok: true as const };
}

export async function getReferralPanelDataAction() {
  const { user } = await getRouteUser();
  if (!user) return { ok: false as const, error: "Unauthorized" };

  const pb = await createPocketbaseAdminClient();
  const profile = await findProfileByUserId(pb, user.id);

  if (!profile?.referralCode) {
    const newCode = await ReferralService.ensureReferralCode(user.id);
    return { ok: true as const, data: { referralCode: newCode, referredUsers: [] } };
  }

  const referrals = await pb.collection("referrals").getFullList({
    filter: pb.filter("referralCode = {:c}", { c: profile.referralCode }),
  });

  const referreeIds: string[] = referrals.map((r) => r.referreeId);
  const referreeProfiles = referreeIds.length
    ? await pb.collection("profiles").getFullList({
        filter: referreeIds.map((id) => pb.filter("userId = {:id}", { id })).join(" || "),
      })
    : [];

  return {
    ok: true as const,
    data: {
      referralCode: profile.referralCode as string,
      referredUsers: referreeProfiles.map((p) => ({ id: p.userId as string, username: (p.username as string) ?? null })),
    },
  };
}

export async function submitReferralCodeAction(referralCode: string) {
  const { user } = await getRouteUser();
  if (!user) return { ok: false as const, error: "You must be logged in." };

  try {
    await ReferralService.applyReferral(user.id, referralCode);
    revalidatePath("/research");
    revalidatePath("/game");
    return { ok: true as const };
  } catch (error: any) {
    return { ok: false as const, error: error.message || "Failed to submit referral code." };
  }
}
