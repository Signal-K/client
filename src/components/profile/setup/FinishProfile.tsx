"use client";

import { useEffect, useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { completeProfileAction, getCurrentProfileAction } from "@/src/app/actions/profile-actions";

function generateReferralCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default function CompleteProfileForm({ onSuccess }: { onSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [ownReferralCode, setOwnReferralCode] = useState("");
  const [referrerCodeInput, setReferrerCodeInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setOwnReferralCode(generateReferralCode());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void getCurrentProfileAction().then((result) => {
      if (cancelled || !result.ok || !result.data) {
        if (!cancelled) setHydrated(true);
        return;
      }
      if (result.data.username) setUsername(result.data.username);
      if (result.data.fullName) setFullName(result.data.fullName);
      if (result.data.referralCode) setOwnReferralCode(result.data.referralCode);
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const pending = window.localStorage.getItem("pending_referral_code") || "";
      if (pending && /^[A-Za-z0-9]{3,32}$/.test(pending)) {
        setReferrerCodeInput(pending);
        return;
      }
      const params = new URLSearchParams(window.location.search);
      const refFromUrl = params.get("ref")?.trim() || "";
      if (refFromUrl && /^[A-Za-z0-9]{3,32}$/.test(refFromUrl)) {
        setReferrerCodeInput(refFromUrl);
      }
    } catch {
      // Ignore storage/query parsing issues.
    }
  }, []);

  const handleSubmit = async () => {
    if (username.trim().length < 3) {
      setErrorMsg("Username must be at least 3 characters.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    const result = await completeProfileAction({
      username,
      fullName,
      referrerCodeInput,
    });
    if (!result.ok) {
      setErrorMsg(result.error || "Failed to update profile.");
      setLoading(false);
      return;
    }

    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("pending_referral_code");
      }
    } catch {
      // Ignore storage restrictions.
    }

    if (typeof onSuccess === "function") {
      onSuccess(); // Close the modal
    }
  };

  return (
    <section className="rounded-2xl bg-white/80 p-6 border shadow space-y-4 text-center max-w-xl mx-auto">
      <h3 className="text-xl font-semibold text-indigo-700">
        {hydrated && username ? "Your profile" : "Complete Your Profile"}
      </h3>
      <p className="text-muted-foreground">
        {hydrated && username
          ? "Saved username is on the hub chip. Edit it here if you want."
          : "Set a username to show on the garden hub. This is the same identity other games in the suite read."}
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
        {loading ? "Saving..." : username ? "Save profile" : "Save Profile"}
      </Button>
    </section>
  );
};
