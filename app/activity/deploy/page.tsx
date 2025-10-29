'use client'

import { useRouter } from "next/navigation"
import DeployTelescopeViewport from "@/src/components/scenes/deploy/TelescopeViewportRange"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useEffect, useState } from "react"
import UseDarkMode from "@/src/shared/hooks/useDarkMode"
import GameNavbar from "@/src/components/layout/Tes"

export default function NewDeployPage() {
  const router = useRouter()
  const session = useSession()
  const supabase = useSupabaseClient()
  const { isDark } = UseDarkMode()
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
    return (
      <div className={`h-screen w-full flex items-center justify-center ${
        isDark 
          ? "bg-gradient-to-b from-[#002439] to-[#001a2a]" 
          : "bg-gradient-to-b from-[#004d6b] to-[#003a52]"
      } text-white text-lg`}>
        Preparing your profile...
      </div>
    );
  }

  return (
    <div 
      className={`w-full h-screen flex flex-col overflow-hidden ${
        isDark 
          ? "bg-gradient-to-b from-[#002439] to-[#001a2a]" 
          : "bg-gradient-to-b from-[#004d6b] to-[#003a52]"
      }`}
    >
      <GameNavbar />
      <div className="flex-1 min-h-0 w-full overflow-hidden">
        <DeployTelescopeViewport />
      </div>
    </div>
  );
};