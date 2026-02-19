import { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@/src/lib/auth/session-context";

export function useNPSManagement() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [showNpsModal, setShowNpsModal] = useState(false);
  const [hasCheckedNps, setHasCheckedNps] = useState(false);

  const scheduleNpsCheck = () => {
    if (hasCheckedNps || !session) return;
    
    const timer = setTimeout(async () => {
      // First, check if user has made at least one classification
      const { data: classificationsData, error: classificationsError } = await supabase
        .from("classifications")
        .select("id")
        .eq("author", session.user.id)
        .limit(1);
      
      // Only proceed if user has made at least one classification
      if (!classificationsError && Array.isArray(classificationsData) && classificationsData.length > 0) {
        // Check if user has already completed NPS survey
        const { data: npsData, error: npsError } = await supabase
          .from("nps_surveys")
          .select("id")
          .eq("user_id", session.user.id);
        
        // Show modal if user hasn't done NPS survey yet
        if (!npsError && Array.isArray(npsData) && npsData.length === 0) {
          setShowNpsModal(true);
        }
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
