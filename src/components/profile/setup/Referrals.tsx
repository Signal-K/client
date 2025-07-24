"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

interface ReferredUser {
  id: string;
  email?: string | null;
  username?: string | null;
}

export default function ReferralCodePanel() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!session) return;

    const fetchReferralData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Get the referral code from profiles table for current user
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("referral_code")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching referral code:", profileError);
          setError("Failed to load your referral code.");
          setLoading(false);
          return;
        }

        if (!profileData?.referral_code) {
          setError("No referral code found for your account.");
          setLoading(false);
          return;
        }

        const userReferralCode = profileData.referral_code;
        setReferralCode(userReferralCode);

        // 2. Get all referrals where referral_code matches current user's referral code
        const { data: referralsData, error: referralsError } = await supabase
          .from("referrals")
          .select("referree_id")
          .eq("referral_code", userReferralCode);

        if (referralsError) {
          console.error("Error fetching referrals:", referralsError);
          setError("Failed to load referred users.");
          setLoading(false);
          return;
        }

        const referredUserIds = referralsData?.map((r) => r.referree_id) || [];

        if (referredUserIds.length === 0) {
          setReferredUsers([]);
          setLoading(false);
          return;
        }

        // 3. Fetch profiles of all referred users
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", referredUserIds);

        if (usersError) {
          console.error("Error fetching referred user profiles:", usersError);
          setError("Failed to load referred users' profiles.");
          setReferredUsers([]);
        } else {
          // Optional: Merge in emails from auth.users
          const { data: authUsers, error: authError } = await supabase
            .from("users")
            .select("id, email")
            .in("id", referredUserIds);

          if (authError) {
            console.warn("Could not fetch emails from auth.users:", authError);
          }

          const merged = usersData.map((user) => ({
            ...user,
            email: authUsers?.find((u) => u.id === user.id)?.email ?? null,
          }));

          setReferredUsers(merged);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred.");
      }

      setLoading(false);
    };

    fetchReferralData();
  }, [session, supabase]);

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