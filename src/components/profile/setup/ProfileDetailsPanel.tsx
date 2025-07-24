"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

interface ProfileDetailsPanelProps {
  onClose: () => void;
}

export default function ProfileDetailsPanel({ onClose }: ProfileDetailsPanelProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [username, setUsername] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [referredUsers, setReferredUsers] = useState<{ username: string | null }[]>([]);
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return;

      const userId = session.user.id;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username, referral_code, full_name")
        .eq("id", userId)
        .maybeSingle();

      if (profile && !profileError) {
        setUsername(profile.username ?? "");
        setReferralCode(profile.referral_code ?? "");
        setFullName(profile.full_name ?? "");
      }

      const { data: referrals } = await supabase
        .from("referrals")
        .select("referree_id")
        .eq("referral_code", profile?.referral_code ?? "");

      if (referrals && referrals.length > 0) {
        const ids = referrals.map((r) => r.referree_id);
        const { data: referredProfiles } = await supabase
          .from("profiles")
          .select("username")
          .in("id", ids);
        setReferredUsers(referredProfiles ?? []);
      }

      const { data: referrerReferral } = await supabase
        .from("referrals")
        .select("referral_code")
        .eq("referree_id", userId)
        .maybeSingle();

      if (referrerReferral?.referral_code) {
        const { data: referrerProfile } = await supabase
          .from("profiles")
          .select("username")
          .eq("referral_code", referrerReferral.referral_code)
          .maybeSingle();

        if (referrerProfile?.username) {
          setReferredBy(referrerProfile.username);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [session, supabase]);

  const handleSave = async () => {
    if (!session) return;
    setSaving(true);
    setErrorMsg("");

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim(), updated_at: new Date() })
      .eq("id", session.user.id);

    if (error) {
      setErrorMsg(error.message || "Failed to update profile.");
      setSaving(false);
      return;
    }

    onClose();
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  return (
    <section className="rounded-2xl bg-white/80 p-6 border shadow space-y-6 w-full text-left">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[#2E3440]">Username</label>
          <Input value={username} readOnly className="bg-gray-100 cursor-not-allowed" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[#2E3440]">Referral Code</label>
          <Input value={referralCode} readOnly className="bg-gray-100 cursor-not-allowed" />
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
      </div>

      <div className="border-t pt-4 space-y-3">
        <div>
          <p className="text-sm font-medium text-[#2E3440]">Referred By</p>
          <p className="text-sm text-muted-foreground">
            {referredBy ? referredBy : "—"}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-[#2E3440]">Users You've Referred</p>
          {referredUsers.length > 0 ? (
            <ul className="text-sm list-disc ml-4 text-muted-foreground">
              {referredUsers.map((user, idx) => (
                <li key={idx}>{user.username ?? "Unnamed User"}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">—</p>
          )}
        </div>
      </div>

      {errorMsg && <p className="text-red-600 text-sm mt-1">{errorMsg}</p>}

      <div className="pt-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {saving ? "Saving..." : "Save & Close"}
        </Button>
      </div>
    </section>
  );
};