import { useState, useEffect } from "react";
import { useSession } from "@/src/lib/auth/session-context";

export function useNPSManagement() {
  const session = useSession();
  const [showNpsModal, setShowNpsModal] = useState(false);
  const [hasCheckedNps, setHasCheckedNps] = useState(false);

  const scheduleNpsCheck = () => {
    if (hasCheckedNps || !session) return;
    
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/gameplay/nps/status", { cache: "no-store" });
        const result = await response.json().catch(() => ({}));
        if (response.ok && result?.shouldShowNps) {
          setShowNpsModal(true);
        }
      } catch {
        // Ignore and keep UX unchanged
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
