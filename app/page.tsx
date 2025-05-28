"use client";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import LoginPage from "./auth/LoginModal";
import { useRouter} from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useActivePlanet } from "@/context/ActivePlanet";
import { subscribeUser, unsubscribeUser, sendNotification } from './actions'
import StructuresOnPlanet, { AtmosphereStructuresOnPlanet, OrbitalStructuresOnPlanet } from "@/components/Structures/Structures";
// import EnhancedWeatherEvents from '@/components/(scenes)/mining/enhanced-weather-events';
import AllAutomatonsOnActivePlanet from "@/components/Structures/Auto/AllAutomatons";
import { EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import Onboarding from "./scenes/onboarding/page";
import SimpleeMissionGuide from "./tests/singleMissionGuide";
import AllSatellitesOnActivePlanet from "@/components/Structures/Auto/AllSatellites";
import LandingSS from "./auth/landing";
import GameNavbar from "@/components/Layout/Tes";
import BiomassOnEarth from "@/components/Data/BiomassEarth";
import NPSPopup from "@/lib/helper/nps-popup";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

function PushNotificationManager() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [hasSubscribedBefore, setHasSubscribedBefore] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      checkExistingSubscription(session.user.id);
    }
  }, [session]);

  async function checkExistingSubscription(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("push_subscription")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Failed to fetch subscription info:", error);
      return;
    }

    if (data?.push_subscription) {
      setHasSubscribedBefore(true);
    }
  }

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });

    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY!),
    });

    const subJSON = sub.toJSON();

    setSubscription(sub);

    const { error } = await supabase
      .from("profiles")
      .update({ push_subscription: subJSON })
      .eq("id", session?.user.id);

    if (error) console.error("Error saving subscription:", error);
    else setHasSubscribedBefore(true);
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);

    const { error } = await supabase
      .from("profiles")
      .update({ push_subscription: null })
      .eq("id", session?.user.id);

    if (error) console.error("Error removing subscription:", error);
    else setHasSubscribedBefore(false);
  }

  async function sendTestNotification() {
    if (!session) return;

    try {
      const res = await fetch("/api/send-push", {
        method: "POST",
        body: JSON.stringify({ userId: session.user.id, message }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();
      console.log("Push response:", res.status, json);

      if (!res.ok) {
        alert(`Push failed: ${json?.error || res.status}`);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Network or server error");
    }

    setMessage("");
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>;
  };

  return (
    <div className="text-white space-y-4 text-base font-light">

      {subscription || hasSubscribedBefore ? (
        <>
          {/* <p className="text-white-400">You are subscribed to push notifications.</p> */}

          {/* <button
            onClick={unsubscribeFromPush}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
          >
            Unsubscribe
          </button> */}

          {/* <input
            type="text"
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-500 rounded-md bg-transparent placeholder-gray-400 text-white"
          /> */}

          {/* <button
            onClick={sendTestNotification}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
          >
            Send Test Notification
          </button> */}
        </>
      ) : (
        <>
          {/* <p className="text-yellow-400">You are not subscribed to push notifications.</p> */}
          <button
            onClick={subscribeToPush}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition"
          >
            Subscribe
          </button>
        </>
      )}
    </div>
  );
};

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  
    const handler = (e: any) => {
      // Prevent default AND store the prompt
      e.preventDefault();
      console.log("beforeinstallprompt event captured");
      setDeferredPrompt(e);
    };
  
    window.addEventListener("beforeinstallprompt", handler);
  
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);  

  const installApp = () => {
    if (deferredPrompt) {
      console.log("Prompting user to install");
      deferredPrompt.prompt();
  
      deferredPrompt.userChoice.then((choiceResult: any) => {
        console.log("User choice result:", choiceResult);
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
        } else {
          console.log("User dismissed the install prompt");
        }
        setDeferredPrompt(null);
      });
    } else {
      console.log("No install prompt available");
    }
  };
  

  if (isStandalone) return null;

  return (
    <div>
      <h3>Install App</h3>
      <button onClick={installApp}>Add to Home Screen</button>
      {isIOS && (
        <p>
          On iOS, tap the Share icon <span role="img" aria-label="share">⎋</span> and then
          "Add to Home Screen" <span role="img" aria-label="add">➕</span>.
        </p>
      )}
    </div>
  );
};

export default function Home() {
  const session = useSession();
  const supabase = useSupabaseClient();

  const { activePlanet } = useActivePlanet();

  const router = useRouter();

  const [hasRequiredItems, setHasRequiredItems] = useState<boolean | null>(null);
  const [userClassifications, setUserClassifications] = useState<boolean | null>(false);
  const [planetData, setPlanetData] = useState<any | null>(null);

  const [showDeployModal, setShowDeployModal] = useState(false);

  const [showNpsModal, setShowNpsModal] = useState<boolean>(false);
  const [hasCheckedNps, setHasCheckedNps] = useState<boolean>(false);

  useEffect(() => {
    if (!session || hasCheckedNps) return;

    const timer = setTimeout(async () => {
      try {
        console.log("NPSSSING")
        const { data, error } = await supabase
          .from("nps_surveys")
          .select("id")
          .eq("user_id", session.user.id);

        if (!error && Array.isArray(data) && data.length === 0) {
          setShowNpsModal(true);
        }
        setHasCheckedNps(true);
      } catch (err: any) {
        console.error("Error checking NPS Survey Status: ", err);
      };
    }, 15000);

    return () => clearTimeout(timer);
  }, [session])

  useEffect(() => {
    if (!session) return;

    const checkInventory = async () => {
      try {
        const { data, error } = await supabase
          .from("inventory")
          .select("id, quantity")
          .eq("owner", session.user.id)
          .in("item", [3105, 3104, 3103])
          .gt("quantity", 0);

        if (error) throw error;

        setHasRequiredItems(data.length > 0);
      } catch (error: any) {
        console.error("Error checking inventory:", error.message);
        setHasRequiredItems(false);
      }
    };

    const checkClassifications = async () => {
      try {
        const { data, error } = await supabase
          .from("classifications")
          .select("*")
          .eq("author", session.user.id);

        if (error) {
          setUserClassifications(false);
        } else {
          setUserClassifications(data && data.length > 0);
        }
      } catch (error: any) {
        console.error(error);
      }
    };

    const checkLinkedAnomaliesLastWeek = async () => {
      const now = new Date();
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      const fromDate = oneWeekAgo.toISOString();
      const toDate = now.toISOString();

      const { data, error } = await supabase
        .from("linked_anomalies")
        .select("id")
        .eq("author", session.user.id)
        .gte("date", fromDate)
        .lte("date", toDate);

      if (error) {
        console.error("Error checking linked anomalies:", error);
        return;
      }

      if (!data || data.length === 0) {
        setShowDeployModal(true);
      }
    };

    checkClassifications();
    checkInventory();
    checkLinkedAnomaliesLastWeek();
  }, [session, supabase]);

  useEffect(() => {
    if (!activePlanet) return;

    async function fetchPlanetData() {
      try {
        const { data, error } = await supabase
          .from("anomalies")
          .select("*")
          .eq("id", activePlanet.id);

        if (error) {
          console.error("Error fetching planet data: ", error);
        } else {
          setPlanetData(data[0]);
        }
      } catch (error: any) {
        console.error("Error fetching planet data: ", error);
      }
    }

    fetchPlanetData();
  }, [activePlanet, supabase]);

  if (!session) {
    return <LandingSS />;
  }

  if (hasRequiredItems === null) {
    return <div>Loading...</div>;
  }

  if (!hasRequiredItems) {
    return <Onboarding />;
  }

  function handleDeployConfirm() {
    setShowDeployModal(false);
    router.push("/deploy");
  }

  async function handleDeployCancel() {
    setShowDeployModal(false);
    try {
      const { error } = await supabase.from("linked_anomalies").insert([
        {
          author: session?.user.id,
          anomaly_id: 1,
          automaton: "Empty/Cancel"
        },
      ]);

      if (error) {
        console.error("Error inserting linked anomaly:", error.message);
      }
    } catch (error: any) {
      console.error("Unexpected error inserting linked anomaly:", error.message);
    }
  }

  return (
    <EarthViewLayout>
      <div className="w-full">
        <GameNavbar />
        <div className="flex flex-row space-y-4"></div>
        <div className="py-3">
          <div className="py-6 my-10 px-6">
            <p className="text-[#2C4F65]">Temperature:</p>
            <p className="text-blue-200">{planetData?.temperatureEq} K</p>
            <p className="text-[#2C4F65]">Humidity:</p>
            <p className="text-blue-200">{planetData?.humidity} K</p>
            {planetData?.id === 30 && <BiomassOnEarth />}
          </div>
          {showNpsModal && (
            <NPSPopup userId={session.user.id} isOpen={true} onClose={() => {}} />
          )}
          {showDeployModal && (
            <Dialog open={showDeployModal} onOpenChange={setShowDeployModal}>
              <DialogContent
                style={{
                  background: "linear-gradient(135deg, rgba(191, 223, 245, 0.9), rgba(158, 208, 218, 0.85)",
                  color: "#2E3440",
                }}
              >
                <DialogHeader>
                  <DialogTitle className="text-nord-aurora-5">No Anomaly Records Last Week</DialogTitle>
                  <DialogDescription className="text-nord-frost-4">
                    You have no anomaly records from the previous week. Would you like to deploy your automatons to gather more data?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={handleDeployCancel}
                    className="text-nord-frost-3 border-nord-frost-3 hover:bg-nord-frost-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeployConfirm}
                    className="bg-nord-aurora-6 hover:bg-nord-aurora-5 text-white"
                  >
                    Deploy Automatons
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <center>
            <OrbitalStructuresOnPlanet />
          </center>
        </div>
      </div>
      <div className="w-full">
        <div className="py-2">
          <center>
            <PushNotificationManager />
            <AllSatellitesOnActivePlanet />
            <AtmosphereStructuresOnPlanet />
          </center>
        </div>
      </div>
      <div className="w-full py-2">
        <center>
          <StructuresOnPlanet />
          <AllAutomatonsOnActivePlanet />
        </center>
      </div>
      {!userClassifications && (
        <div className="w-full py-2">
          <SimpleeMissionGuide />
        </div>
      )}
    </EarthViewLayout>
  );
};