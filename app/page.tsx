"use client";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import LoginPage from "./auth/LoginModal";
import { useActivePlanet } from "@/context/ActivePlanet";
import { subscribeUser, unsubscribeUser, sendNotification } from './actions'
import {
  EarthView,
} from './scenes';
import { EarthScene } from "./scenes/earth/scene";
import StructuresOnPlanet, { AtmosphereStructuresOnPlanet, OrbitalStructuresOnPlanet } from "@/components/Structures/Structures";
// import EnhancedWeatherEvents from '@/components/(scenes)/mining/enhanced-weather-events';
import AllAutomatonsOnActivePlanet from "@/components/Structures/Auto/AllAutomatons";
import { EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import Onboarding from "./scenes/onboarding/page";
import VerticalToolbar from "@/components/Layout/Toolbar";
import SimpleeMissionGuide from "./tests/singleMissionGuide";
import Navbar from "@/components/Layout/Navbar";
import AllSatellitesOnActivePlanet from "@/components/Structures/Auto/AllSatellites";
import LandingSS from "./auth/landing";
import GameNavbar from "@/components/Layout/Tes";

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
  const [message, setMessage] = useState("");

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

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
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    });
  
    const subJSON = sub.toJSON(); // 🔥 THIS IS ESSENTIAL
  
    setSubscription(sub);
  
    // Save clean JSON to Supabase
    const { error } = await supabase
      .from("profiles")
      .update({ push_subscription: subJSON })
      .eq("id", session?.user.id);
  
    if (error) console.error("Error saving subscription:", error);
  }  

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);

    const { error } = await supabase
      .from("profiles")
      .update({ push_subscription: null })
      .eq("id", session?.user.id);

    if (error) console.error("Error removing subscription:", error);
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
  }

  return (
    <div>
      <h3>Push Notifications</h3>
      {subscription ? (
        <>
          <p>You are subscribed to push notifications.</p>
          <button onClick={unsubscribeFromPush}>Unsubscribe</button>
          <input
            type="text"
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendTestNotification}>Send Test</button>
        </>
      ) : (
        <>
          <p>You are not subscribed to push notifications.</p>
          <button onClick={subscribeToPush}>Subscribe</button>
        </>
      )}
    </div>
  );
}


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
}

export default function Home() {
  const session = useSession();
  const supabase = useSupabaseClient();
  
  const { activePlanet } = useActivePlanet();

  const [hasRequiredItems, setHasRequiredItems] = useState<boolean | null>(null);
  const [userClassifications, setUserClassifications] = useState<boolean | null>(false);
  
  const [planetData, setPlanetData] = useState<any | null>(null);
  const [zoodexCount, setZoodexCount] = useState<number | null>(null);
  const biomass = zoodexCount !== null ? 0.831 * 0.001 * zoodexCount : null;

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

        if (error) setUserClassifications(false);
        if (data) setUserClassifications(true);
      } catch (error: any) {
        console.error(error);
      };
    };

    checkClassifications();
    checkInventory();
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
      };
    };

    fetchPlanetData();
  }, [activePlanet, supabase]);

  useEffect(() => {
    const fetchZoodexCount = async () => {
      try {
        const { count, error } = await supabase
          .from("classifications")
          .select("id", { count: "exact" })
          .like("classificationtype", "%zoodex%");

        if (error) throw error;
        setZoodexCount(count);
      } catch (err: any) {
        console.error("Error fetching Zoodex classifications:", err.message);
        setZoodexCount(0);
      }
    };

    fetchZoodexCount();
  }, [supabase]);

  if (!session) {
    return <LandingSS />;
  };

  if (hasRequiredItems === null) {
    return <div>Loading...</div>;
  };

  if (!hasRequiredItems) {
    return <Onboarding />;
  };

  return (
    <EarthViewLayout>
      <div className="w-full">
        {/* <Navbar /> */}
        <GameNavbar />
        <div className="flex flex-row space-y-4"></div>
        <div className="py-3">
          <div className="py-6 my-10 px-6">
            <p className="text-[#2C4F65]">Temperature:</p>
            <p className="text-blue-200">{planetData?.temperatureEq} K</p>
            <p className="text-[#2C4F65]">Humidity:</p>
            <p className="text-blue-200">{planetData?.humidity} K</p>
            {planetData?.id === 30 && (
              <>
                <p className="text-[#2C4F65]">Biomass:</p>
                <p className="text-blue-200">{biomass !== null ? biomass.toFixed(6) : "Loading..."}</p>
              </>
            )}
          </div>
          <center>
            <OrbitalStructuresOnPlanet />
          </center>
        </div>
      </div>
      <div className="w-full">
        <div className="py-2">
          <center>
            <InstallPrompt />
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
        <div className="w-full py-2"><SimpleeMissionGuide /></div>
      )}
    </EarthViewLayout>
  );
};