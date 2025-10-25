"use client";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import LoginPage from "@/src/components/profile/auth/LoginModal";
import { useRouter} from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { useActivePlanet } from "@/src/core/context/ActivePlanet";
// import { subscribeUser, unsubscribeUser, sendNotification } from '../actions'
// import { AtmosphereStructuresOnPlanet, OrbitalStructuresOnPlanet } from "@/src/components/deployment/structures/Structures";
// import EnhancedWeatherEvents from '@/src/components/ui/scenes/mining/enhanced-weather-events';
import AllAutomatonsOnActivePlanet from "@/src/components/deployment/structures/auto/AllAutomatons";
import { EarthViewLayout } from "@/src/components/scenes/planetScene/layout";
import SimpleeMissionGuide from "@/src/components/deployment/missions/guide";
import AllSatellitesOnActivePlanet from "@/src/components/deployment/structures/auto/AllSatellites";
import LandingSS from "@/src/components/profile/auth/landing";
import GameNavbar from "@/src/components/layout/Tes";
import BiomassOnEarth from "@/src/components/social/activity/BiomassEarth";
import NPSPopup from "@/src/components/ui/helpers/nps-popup";
import Structures from "@/src/components/deployment/structures/Structures";

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