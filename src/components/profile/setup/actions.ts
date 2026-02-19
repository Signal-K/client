"use server";

import { revalidatePath } from "next/cache";

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

  const { data, error } = await supabase
    .from("profiles")
    .select("username, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, data };
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

  const { error: updateError } = await supabase.from("profiles").upsert({
    id: user.id,
    username,
    full_name: firstName,
    avatar_url,
    updated_at: new Date().toISOString(),
  });

  if (updateError) return { ok: false as const, error: updateError.message };

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

  const { error: updateError } = await supabase.from("profiles").upsert({
    id: user.id,
    username,
    full_name: input.fullName.trim(),
    referral_code: ownReferralCode,
    updated_at: new Date().toISOString(),
  });

  if (updateError) {
    if (updateError.message.includes("profiles_username_key")) {
      return { ok: false as const, error: "That username is already taken. Please choose another one." };
    }
    if (updateError.message.includes("profiles_referral_code_key")) {
      return { ok: false as const, error: "Referral code already exists. Please try again." };
    }
    return { ok: false as const, error: updateError.message || "Failed to update profile." };
  }

  const referrerCode = (input.referrerCodeInput || "").trim();
  if (referrerCode) {
    const { data: existingReferral, error: referralCheckError } = await supabase
      .from("referrals")
      .select("id")
      .eq("referree_id", user.id)
      .maybeSingle();

    if (!referralCheckError && !existingReferral) {
      const { data: referrerProfile } = await supabase
        .from("profiles")
        .select("id, referral_code")
        .eq("referral_code", referrerCode)
        .maybeSingle();

      if (referrerProfile) {
        await supabase.from("referrals").insert({
          referree_id: user.id,
          referral_code: referrerCode,
        });

        const { data: referrersReferral } = await supabase
          .from("referrals")
          .select("referral_code")
          .eq("referree_id", referrerProfile.id)
          .maybeSingle();

        if (referrersReferral?.referral_code) {
          await supabase.from("referrals").insert({
            referree_id: user.id,
            referral_code: referrersReferral.referral_code,
          });
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

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) return { ok: false as const, error: "Failed to load your referral code." };
  if (!profileData?.referral_code) return { ok: false as const, error: "No referral code found for your account." };

  const userReferralCode = profileData.referral_code;
  const { data: referralsData, error: referralsError } = await supabase
    .from("referrals")
    .select("referree_id")
    .eq("referral_code", userReferralCode);

  if (referralsError) return { ok: false as const, error: "Failed to load referred users." };

  const referredUserIds = referralsData?.map((r: any) => r.referree_id) || [];
  if (referredUserIds.length === 0) {
    return { ok: true as const, data: { referralCode: userReferralCode, referredUsers: [] } };
  }

  const { data: usersData, error: usersError } = await supabase
    .from("profiles")
    .select("id, username")
    .in("id", referredUserIds);

  if (usersError) return { ok: false as const, error: "Failed to load referred users' profiles." };

  const { data: authUsers } = await supabase
    .from("users")
    .select("id, email")
    .in("id", referredUserIds);

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

  const { error } = await supabase.from("referrals").insert({
    referree_id: user.id,
    referral_code: code,
  });
  if (error) return { ok: false as const, error: "Failed to submit referral code. Please try again." };

  revalidatePath("/research");
  revalidatePath("/game");
  return { ok: true as const };
}

