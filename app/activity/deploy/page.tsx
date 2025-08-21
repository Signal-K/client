'use client'

import Image from "next/image"
import { useRouter } from "next/navigation"
import { AvatarGenerator } from "@/src/components/profile/setup/Avatar"
import DeployTelescopeViewport from "@/src/components/ui/scenes/deploy/TelescopeViewportRange"
import { Button } from "@/src/components/ui/button"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { ArrowLeft, User, Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"
import { Switch } from "@/src/components/ui/switch"
import UseDarkMode from "@/src/shared/hooks/useDarkMode"

export default function NewDeployPage() {
  const router = useRouter()
  const session = useSession()
  const supabase = useSupabaseClient()
  const { isDark, toggleDarkMode } = UseDarkMode()
  const [profileChecked, setProfileChecked] = useState(false)

  useEffect(() => {
    async function ensureProfile() {
      if (!session?.user?.id) return;
      // Check if profile exists in Supabase
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", session.user.id)
        .single();
      if (!data) {
        // Create profile if not exists
        const { error: insertError } = await supabase
          .from("profiles")
          .insert({ id: session.user.id });
        if (insertError) {
          console.error("Error creating profile:", insertError.message);
        }
      }
      setProfileChecked(true);
    }
    ensureProfile();
  }, [session, supabase]);

  if (!profileChecked) {
    return <div className="h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#002439] to-[#001a2a] text-white text-lg">Preparing your profile...</div>;
  }

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-b from-[#002439] to-[#001a2a] overflow-hidden">
      <DeployTelescopeViewport />
    </div>
  );
};