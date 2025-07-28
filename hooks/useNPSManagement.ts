import { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export function useNPSManagement() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [showNpsModal, setShowNpsModal] = useState(false);
  const [hasCheckedNps, setHasCheckedNps] = useState(false);

  const scheduleNpsCheck = () => {
    if (hasCheckedNps || !session) return;
    
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from("nps_surveys")
        .select("id")
        .eq("user_id", session.user.id);
      
      if (!error && Array.isArray(data) && data.length === 0) {
        setShowNpsModal(true);
      }
      setHasCheckedNps(true);
    }, 15000);
    
    return () => clearTimeout(timer);
  };

  const handleCloseNps = () => {
    setShowNpsModal(false);
  };

  useEffect(() => {
    if (session) {
      scheduleNpsCheck();
    }
  }, [session, hasCheckedNps]);

  return {
    showNpsModal,
    handleCloseNps,
  };
}
