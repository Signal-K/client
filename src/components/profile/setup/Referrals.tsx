"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { getReferralPanelDataAction } from "./actions";

interface ReferredUser {
  id: string;
  email?: string | null;
  username?: string | null;
}

export default function ReferralCodePanel() {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferralData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getReferralPanelDataAction();
        if (!result.ok) {
          setError(result.error || "Failed to load referral data.");
          setReferredUsers([]);
          setReferralCode(null);
          setLoading(false);
          return;
        }

        setReferralCode(result.data.referralCode);
        setReferredUsers(result.data.referredUsers as ReferredUser[]);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
      }

      setLoading(false);
    };

    fetchReferralData();
  }, []);

  const handleCopy = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stardustEarned = referredUsers.length * 5;

  return (
    <section
      style={{
        background: "linear-gradient(135deg, #E5EEF4, #D8E5EC)",
        color: "#2E3440",
        borderRadius: "1rem",
        padding: "1.5rem",
        boxShadow: "0 4px 10px rgb(0 0 0 / 0.1)",
        maxWidth: 600,
        margin: "0 auto",
      }}
    >
      <h2 className="text-2xl font-extrabold mb-4 text-[#5E81AC] text-center">
        Your Referral Code
      </h2>

      <div className="flex items-center justify-center mb-6 gap-3">
        <code
          className="font-mono text-xl px-4 py-2 rounded border border-[#1e3a5f] select-text"
          style={{ backgroundColor: "#D8E5EC", color: "#0f7285" }}
        >
          {loading ? "Loading..." : referralCode ?? "N/A"}
        </code>
        <Button
          onClick={handleCopy}
          disabled={!referralCode || loading}
          variant="default"
          style={{ backgroundColor: "#4cc9f0", color: "#1e3a5f", fontWeight: "600" }}
        >
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      <p className="text-center text-[#0f7285] font-semibold mb-6">
        {stardustEarned} Stardust earned for referrals
      </p>

      <h3 className="text-xl font-semibold mb-3 text-[#5E81AC]">
        Users You Referred
      </h3>

      <div
        style={{
          maxHeight: 240,
          overflowY: "auto",
          border: "1px solid #1e3a5f",
          borderRadius: 8,
          backgroundColor: "#E5EEF4",
          padding: 12,
        }}
      >
        {loading && <p className="text-center text-[#0f7285]">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && referredUsers.length === 0 && (
          <p className="text-center text-[#0f7285]">No users referred yet.</p>
        )}

        <ul className="space-y-2">
          {referredUsers.map((user) => (
            <li
              key={user.id}
              className="px-3 py-2 rounded border border-[#1e3a5f] bg-[#D8E5EC] text-[#0f7285] font-medium"
              title={user.email ?? user.username ?? "Unknown"}
            >
              {user.username || user.email || user.id}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
