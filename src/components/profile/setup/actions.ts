"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/server/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/ssr";

function generateReferralCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function getCurrentProfileAction() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, error: "Unauthorized" };

  const rows = await prisma.$queryRaw<Array<{ username: string | null; full_name: string | null; avatar_url: string | null }>>`
    SELECT username, full_name, avatar_url
    FROM profiles
    WHERE id = ${user.id}
    LIMIT 1
  `;

  return { ok: true as const, data: rows[0] ?? null };
}

export async function updateProfileSetupAction(formData: FormData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, error: "Unauthorized" };

  const username = String(formData.get("username") || "").trim();
  const firstName = String(formData.get("firstName") || "").trim();
  const existingAvatarPreview = String(formData.get("existingAvatarPreview") || "");
  const avatar = formData.get("avatar");

  if (!username) {
    return { ok: false as const, error: "Username is required." };
  }

  let avatar_url = existingAvatarPreview || null;
  if (avatar && avatar instanceof File && avatar.size > 0) {
    const fileName = `${Date.now()}-${user.id}-avatar.png`;
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatar, { contentType: avatar.type || "image/png" });

    if (error) return { ok: false as const, error: error.message };
    avatar_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
  }

  try {
    await prisma.$executeRaw`
      INSERT INTO profiles (id, username, full_name, avatar_url, updated_at)
      VALUES (${user.id}, ${username}, ${firstName}, ${avatar_url}, ${new Date().toISOString()})
      ON CONFLICT (id)
      DO UPDATE SET
        username = EXCLUDED.username,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = EXCLUDED.updated_at
    `;
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
  ownReferralCode?: string;
  referrerCodeInput?: string;
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Unauthorized" };

  const username = input.username.trim();
  if (username.length < 3) {
    return { ok: false as const, error: "Username must be at least 3 characters." };
  }

  const ownReferralCode = (input.ownReferralCode || generateReferralCode()).trim();

  try {
    await prisma.$executeRaw`
      INSERT INTO profiles (id, username, full_name, referral_code, updated_at)
      VALUES (${user.id}, ${username}, ${input.fullName.trim()}, ${ownReferralCode}, ${new Date().toISOString()})
      ON CONFLICT (id)
      DO UPDATE SET
        username = EXCLUDED.username,
        full_name = EXCLUDED.full_name,
        referral_code = EXCLUDED.referral_code,
        updated_at = EXCLUDED.updated_at
    `;
  } catch (error) {
    const message = String(error);
    if (message.includes("profiles_username_key")) {
      return { ok: false as const, error: "That username is already taken. Please choose another one." };
    }
    if (message.includes("profiles_referral_code_key")) {
      return { ok: false as const, error: "Referral code already exists. Please try again." };
    }
    return { ok: false as const, error: message || "Failed to update profile." };
  }

  const referrerCode = (input.referrerCodeInput || "").trim();
  if (referrerCode) {
    const existingReferral = (
      await prisma.$queryRaw<Array<{ id: number }>>`
        SELECT id
        FROM referrals
        WHERE referree_id = ${user.id}
        LIMIT 1
      `
    )[0];
    const referralCheckError = null;

    if (!referralCheckError && !existingReferral) {
      const referrerProfile = (
        await prisma.$queryRaw<Array<{ id: string; referral_code: string | null }>>`
          SELECT id, referral_code
          FROM profiles
          WHERE referral_code = ${referrerCode}
          LIMIT 1
        `
      )[0];

      if (referrerProfile) {
        await prisma.$executeRaw`
          INSERT INTO referrals (referree_id, referral_code)
          VALUES (${user.id}, ${referrerCode})
        `;

        const referrersReferral = (
          await prisma.$queryRaw<Array<{ referral_code: string }>>`
            SELECT referral_code
            FROM referrals
            WHERE referree_id = ${referrerProfile.id}
            LIMIT 1
          `
        )[0];

        if (referrersReferral?.referral_code) {
          await prisma.$executeRaw`
            INSERT INTO referrals (referree_id, referral_code)
            VALUES (${user.id}, ${referrersReferral.referral_code})
          `;
        }
      }
    }
  }

  revalidatePath("/game");
  revalidatePath("/research");
  revalidatePath("/account");
  return { ok: true as const };
}

export async function getReferralPanelDataAction() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Unauthorized" };

  const profileData = (
    await prisma.$queryRaw<Array<{ referral_code: string | null }>>`
      SELECT referral_code
      FROM profiles
      WHERE id = ${user.id}
      LIMIT 1
    `
  )[0];
  const profileError = null;

  if (profileError) return { ok: false as const, error: "Failed to load your referral code." };
  if (!profileData?.referral_code) return { ok: false as const, error: "No referral code found for your account." };

  const userReferralCode = profileData.referral_code;
  const referralsData = await prisma.$queryRaw<Array<{ referree_id: string }>>`
    SELECT referree_id
    FROM referrals
    WHERE referral_code = ${userReferralCode}
  `;
  const referralsError = null;

  if (referralsError) return { ok: false as const, error: "Failed to load referred users." };

  const referredUserIds = referralsData?.map((r: any) => r.referree_id) || [];
  if (referredUserIds.length === 0) {
    return { ok: true as const, data: { referralCode: userReferralCode, referredUsers: [] } };
  }

  const usersData = await prisma.$queryRaw<Array<{ id: string; username: string | null }>>`
    SELECT id, username
    FROM profiles
    WHERE id = ANY(${referredUserIds}::text[])
  `;
  const usersError = null;

  if (usersError) return { ok: false as const, error: "Failed to load referred users' profiles." };

  const authUsers = await prisma.$queryRaw<Array<{ id: string; email: string | null }>>`
    SELECT id, email
    FROM users
    WHERE id = ANY(${referredUserIds}::text[])
  `;

  const referredUsers = (usersData || []).map((u: any) => ({
    ...u,
    email: authUsers?.find((a: any) => a.id === u.id)?.email ?? null,
  }));

  return { ok: true as const, data: { referralCode: userReferralCode, referredUsers } };
}

export async function submitReferralCodeAction(referralCode: string) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "You must be logged in to submit a referral code." };

  const code = referralCode.trim();
  if (!code) return { ok: false as const, error: "Please enter a valid referral code." };

  try {
    await prisma.$executeRaw`
      INSERT INTO referrals (referree_id, referral_code)
      VALUES (${user.id}, ${code})
    `;
  } catch {
    return { ok: false as const, error: "Failed to submit referral code. Please try again." };
  }

  revalidatePath("/research");
  revalidatePath("/game");
  return { ok: true as const };
}
