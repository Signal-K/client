"use client";

import { useEffect, useState } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { completeProfileAction } from "./actions";

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

  useEffect(() => {
    setOwnReferralCode(generateReferralCode());
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
      ownReferralCode,
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
