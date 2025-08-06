'use client'

import { useRouter } from "next/navigation";
import Home from "@/app/page";
import GameNavbar from "@/src/components/layout/Tes";
import { Dialog, DialogContent } from "@/src/components/ui/dialog";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import TelescopeViewport from "@/src/components/classification/telescope/telescope-viewport";
import { useState, useEffect } from "react";

export default function TelescopeOnEarthPage() {
  const router = useRouter();
  const session = useSession();
  const supabase = useSupabaseClient();
  const [simpleMode, setSimpleMode] = useState(false); // default: viewport mode
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkTelescopeAccess = async () => {
      if (!session?.user?.id) return;

      try {
        // Check if user has any telescope-specific linked anomalies
        const { data: linkedAnomalies, error } = await supabase
          .from("linked_anomalies")
          .select("id")
          .eq("author", session.user.id)
          .eq("automaton", "Telescope")
          .limit(1);

        if (error) {
          console.error("Error checking telescope linked anomalies:", error);
          return;
        }

        // If no telescope linked anomalies found, redirect to deploy page
        if (!linkedAnomalies || linkedAnomalies.length === 0) {
          router.push("/activity/deploy");
          return;
        }

        setIsChecking(false);
      } catch (error) {
        console.error("Error in telescope access check:", error);
        setIsChecking(false);
      }
    };

    if (session) {
      checkTelescopeAccess();
    }
  }, [session, supabase, router]);

  if (!session) return <Home />;

  // Show loading state while checking access
  if (isChecking) {
    return (
      <div className="relative min-h-screen w-full flex flex-col">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src="/assets/Backdrops/Earth.png"
          alt="Earth Background"
        />
        <div className="w-full z-10">
          <GameNavbar />
        </div>
        <div className="flex justify-center items-center flex-grow z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#2E3440]">Checking telescope access...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      {/* Background Image */}
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/Backdrops/Earth.png"
        alt="Earth Background"
      />

      {/* Navbar */}
      <div className="w-full z-10">
        <GameNavbar />
      </div>

      {/* Dialog Wrapper */}
      <div className="flex justify-center items-center flex-grow z-10 px-4">
        <Dialog
          defaultOpen
          onOpenChange={(open) => {
            if (!open) router.push("/");
          }}
        >
          <DialogContent
            className={`p-0 w-full max-w-[90vw] h-[85vh] overflow-hidden flex flex-col ${
              !simpleMode
                ? "bg-transparent shadow-none"
                : "bg-white/80 backdrop-blur-sm rounded-2xl p-4"
            }`}
            style={{ color: "#2E3440" }}
          >
            {/* Mode Toggle */}
            <div className="flex justify-end mb-2 px-4 pt-4">
              <button
                onClick={() => setSimpleMode(!simpleMode)}
                className="bg-[#88C0D0] text-white px-4 py-1 rounded-md text-sm hover:bg-[#81A1C1] transition"
              >
                {simpleMode ? "View Telescope" : "All projects"}
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-hidden">
              {!simpleMode ? (
                <div className="h-full w-full overflow-hidden">
                  <TelescopeViewport />
                </div>
              ) : (
                <SimpleTelescopePanel router={router} />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

function SimpleTelescopePanel({ router }: { router: any }) {
  const actions = [
    {
      icon: "🔧",
      text: "Upgrades",
      onClick: () => router.push('/research'),
    },
  ];

  const buttons = [
    { icon: "🔭", text: "Discover planets", route: "planet-hunters" },
    { icon: "☀️", text: "Sunspot data", route: "sunspots" },
    { icon: "🧪", text: "Find early solar systems", route: "disk-detective" },
    { icon: "🌑", text: "Discover asteroids", route: "daily-minor-planet" },
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-6 h-full w-full overflow-y-auto">
      <div className="flex space-x-6">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onClick}
            className="text-[#2E3440] bg-[#D8DEE9] px-3 py-2 rounded shadow-sm text-sm hover:bg-[#E5E9F0]"
          >
            {action.icon} {action.text}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={() => router.push(`/structures/telescope/${btn.route}`)}
            className="flex items-center justify-center bg-[#D8DEE9] text-[#2E3440] py-3 px-4 rounded shadow hover:bg-[#E5E9F0]"
          >
            <span className="mr-2">{btn.icon}</span> {btn.text}
          </button>
        ))}
      </div>
    </div>
  );
};