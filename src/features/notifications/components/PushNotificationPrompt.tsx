"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, BellOff } from "lucide-react";

import { Button } from "@/src/components/ui/button";

const DISMISSED_KEY = "push_prompt_dismissed_v1";

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

export default function PushNotificationPrompt() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unknown">("unknown");
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canUse =
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;
    setSupported(canUse);
    setPermission(canUse ? Notification.permission : "unknown");
    setDismissed(window.localStorage.getItem(DISMISSED_KEY) === "1");
  }, []);

  const shouldShow = useMemo(() => {
    if (!supported) return false;
    if (dismissed) return false;
    if (permission === "granted") return false;
    return true;
  }, [supported, dismissed, permission]);

  async function handleEnable() {
    if (busy) return;
    setBusy(true);
    setStatusMessage("");

    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setStatusMessage("Missing VAPID key in environment.");
        return;
      }

      const registration = await navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        await fetch("/api/gameplay/notifications/reject", { method: "POST" }).catch(() => null);
        setStatusMessage("Permission not granted.");
        return;
      }

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToArrayBuffer(vapidKey),
        });
      }

      const rawKey = subscription.getKey("p256dh");
      const rawAuth = subscription.getKey("auth");
      const p256dh = rawKey ? btoa(String.fromCharCode(...new Uint8Array(rawKey))) : "";
      const auth = rawAuth ? btoa(String.fromCharCode(...new Uint8Array(rawAuth))) : "";

      const response = await fetch("/api/gameplay/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          p256dh,
          auth,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setStatusMessage(payload?.error || "Failed to save subscription.");
        return;
      }

      window.localStorage.setItem(DISMISSED_KEY, "1");
      setDismissed(true);
      setStatusMessage("Notifications enabled.");
    } catch (error) {
      console.error("Failed to enable notifications:", error);
      setStatusMessage("Could not enable notifications.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDismiss() {
    window.localStorage.setItem(DISMISSED_KEY, "1");
    setDismissed(true);
    await fetch("/api/gameplay/notifications/reject", { method: "POST" }).catch(() => null);
  }

  if (!shouldShow) return null;

  return (
    <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-blue-200">Enable browser notifications</p>
          <p className="mt-1 text-xs text-blue-100/90">
            Get updates when discoveries need classification and when community events go live.
          </p>
          {statusMessage && <p className="mt-2 text-xs text-blue-100">{statusMessage}</p>}
        </div>
        <Bell className="h-5 w-5 text-blue-200" />
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={handleEnable} disabled={busy}>
          <Bell className="mr-2 h-4 w-4" />
          {busy ? "Enabling..." : "Enable"}
        </Button>
        <Button size="sm" variant="outline" onClick={handleDismiss} disabled={busy}>
          <BellOff className="mr-2 h-4 w-4" />
          Not now
        </Button>
      </div>
    </div>
  );
}
