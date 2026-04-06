"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/server/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";
import { ReferralService } from "@/src/features/referrals/referral-service";

export async function getCurrentProfileAction() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Unauthorized" };

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { username: true, fullName: true, avatarUrl: true, referralCode: true }
  });

  return { ok: true as const, data: profile ?? null };
}

export async function updateProfileSetupAction(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Unauthorized" };

  const username = String(formData.get("username") || "").trim();
  const firstName = String(formData.get("firstName") || "").trim();
  const existingAvatarPreview = String(formData.get("existingAvatarPreview") || "");
  const avatar = formData.get("avatar");

  if (!username) {
    return { ok: false as const, error: "Username is required." };
  }

  let avatar_url: string | null = existingAvatarPreview && existingAvatarPreview.trim() ? existingAvatarPreview : null;
  if (avatar && avatar instanceof File && avatar.size > 0) {
    const fileName = `${Date.now()}-${user.id}-avatar.png`;
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatar, { contentType: avatar.type || "image/png" });

    if (error) return { ok: false as const, error: error.message };
    avatar_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
  }

  try {
    const referralCode = await ReferralService.ensureReferralCode(user.id);
    
    await prisma.profile.upsert({
      where: { id: user.id },
      update: {
        username,
        fullName: firstName,
        avatarUrl: avatar_url,
        updatedAt: new Date(),
      },
      create: {
        id: user.id,
        username,
        fullName: firstName,
        avatarUrl: avatar_url,
        referralCode,
        updatedAt: new Date(),
      }
    });
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
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Unauthorized" };

  const username = input.username.trim();
  if (username.length < 3) {
    return { ok: false as const, error: "Username must be at least 3 characters." };
  }

  try {
    const referralCode = await ReferralService.ensureReferralCode(user.id);

    await prisma.profile.upsert({
      where: { id: user.id },
      update: {
        username,
        fullName: input.fullName.trim(),
        updatedAt: new Date(),
      },
      create: {
        id: user.id,
        username,
        fullName: input.fullName.trim(),
        referralCode,
        updatedAt: new Date(),
      }
    });

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
    const message = String(error);
    if (message.includes("profiles_username_key")) {
      return { ok: false as const, error: "That username is already taken." };
    }
    return { ok: false as const, error: "Failed to update profile." };
  }

  revalidatePath("/game");
  revalidatePath("/research");
  revalidatePath("/account");
  return { ok: true as const };
}

export async function getReferralPanelDataAction() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Unauthorized" };

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { referralCode: true }
  });

  if (!profile?.referralCode) {
    const newCode = await ReferralService.ensureReferralCode(user.id);
    return { ok: true as const, data: { referralCode: newCode, referredUsers: [] } };
  }

  const referrals = await prisma.referral.findMany({
    where: { referralCode: profile.referralCode },
    select: { referreeId: true }
  });

  const referreeIds = referrals.map(r => r.referreeId);
  const referreeProfiles = await prisma.profile.findMany({
    where: { id: { in: referreeIds } },
    select: { id: true, username: true }
  });

  return { ok: true as const, data: { referralCode: profile.referralCode, referredUsers: referreeProfiles } };
}

export async function submitReferralCodeAction(referralCode: string) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
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
