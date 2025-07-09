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
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setReferralCode(generateReferralCode());
  }, []);

  const handleSubmit = async () => {
    if (!session) return;

    if (username.trim().length < 3) {
      setErrorMsg("Username must be at least 3 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const updates = {
      id: session.user.id,
      username: username.trim(),
      full_name: fullName.trim(),
      referral_code: referralCode,
      updated_at: new Date(),
    };

    const { error } = await supabase.from("profiles").upsert(updates);

    if (error) {
      if (error.message.includes("profiles_username_key")) {
        setErrorMsg("That username is already taken. Please choose another one.");
      } else if (error.message.includes("profiles_referral_code_key")) {
        setErrorMsg("Referral code already exists. Please try again.");
      } else {
        setErrorMsg(error.message || "Failed to update profile.");
      }
      setLoading(false);
      return;
    }

    if (typeof onSuccess === "function") {
      onSuccess(); // close the modal
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
            value={referralCode}
            readOnly
            className="bg-gray-100 cursor-not-allowed text-muted-foreground"
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
}