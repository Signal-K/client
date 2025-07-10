"use client";

import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function generateReferralCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function CompleteProfileForm({ onSuccess }: { onSuccess: () => void }) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [ownReferralCode, setOwnReferralCode] = useState("");
  const [referrerCodeInput, setReferrerCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setOwnReferralCode(generateReferralCode());
  }, []);

  const handleSubmit = async () => {
    if (!session) return;

    if (username.trim().length < 3) {
      setErrorMsg("Username must be at least 3 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const userId = session.user.id;

    const updates = {
      id: userId,
      username: username.trim(),
      full_name: fullName.trim(),
      referral_code: ownReferralCode,
      updated_at: new Date(),
    };

    // Step 1: Update Profile
    const { error: updateError } = await supabase.from("profiles").upsert(updates);

    if (updateError) {
      if (updateError.message.includes("profiles_username_key")) {
        setErrorMsg("That username is already taken. Please choose another one.");
      } else if (updateError.message.includes("profiles_referral_code_key")) {
        setErrorMsg("Referral code already exists. Please try again.");
      } else {
        setErrorMsg(updateError.message || "Failed to update profile.");
      }
      setLoading(false);
      return;
    }

    // Step 2: Handle referral (if input provided)
    if (referrerCodeInput.trim()) {
      // Check if user already has a referral
      const { data: existingReferral, error: referralCheckError } = await supabase
        .from("referrals")
        .select("id")
        .eq("referree_id", userId)
        .maybeSingle();

      if (!referralCheckError && !existingReferral) {
        // Find user with referral_code
        const { data: referrerProfile } = await supabase
          .from("profiles")
          .select("id, referral_code")
          .eq("referral_code", referrerCodeInput.trim())
          .maybeSingle();

        if (referrerProfile) {
          // Create referral from current user → referrer
          await supabase.from("referrals").insert({
            referree_id: userId,
            referral_code: referrerCodeInput.trim(),
          });

          // Check if the referrer was also referred by someone else
          const { data: referrersReferral } = await supabase
            .from("referrals")
            .select("referral_code")
            .eq("referree_id", referrerProfile.id)
            .maybeSingle();

          if (referrersReferral) {
            // Create an extended referral from current user → referrer's referrer
            await supabase.from("referrals").insert({
              referree_id: userId,
              referral_code: referrersReferral.referral_code,
            });
          }
        } else {
          // Referral code not found — soft fail, but don't stop profile completion
          console.warn("Invalid referral code provided");
        }
      }
    }

    if (typeof onSuccess === "function") {
      onSuccess(); // Close the modal
    }
  };

  return (
    <section className="rounded-2xl bg-white/80 p-6 border shadow space-y-4 text-center max-w-xl mx-auto">
      <h3 className="text-xl font-semibold text-indigo-700">Complete Your Profile</h3>
      <p className="text-muted-foreground">
        To unlock full gameplay access and referral features, please set your display name and username.
      </p>

      <div className="space-y-4 text-left">
        <div>
          <label className="block text-sm font-medium mb-1 text-[#2E3440]">Username</label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. stargazer_42"
            className="bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[#2E3440]">Full Name</label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Ada Lovelace"
            className="bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[#2E3440]">Your Referral Code</label>
          <Input
            value={ownReferralCode}
            readOnly
            className="bg-gray-100 cursor-not-allowed text-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[#2E3440]">
            Referral Code (optional)
          </label>
          <Input
            value={referrerCodeInput}
            onChange={(e) => setReferrerCodeInput(e.target.value)}
            placeholder="Enter your friend's code"
            className="bg-white"
          />
        </div>

        {errorMsg && <p className="text-red-600 text-sm mt-1">{errorMsg}</p>}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 text-white w-full mt-4"
      >
        {loading ? "Saving..." : "Save Profile"}
      </Button>
    </section>
  );
};