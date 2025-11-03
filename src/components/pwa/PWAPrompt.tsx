"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed or user dismissed the prompt
    if (typeof window !== "undefined") {
      const dismissed = localStorage.getItem("pwa-prompt-dismissed");
      const installed = localStorage.getItem("pwa-installed");

      if (dismissed || installed) {
        setShowPrompt(false);
        if (installed) setIsInstalled(true);
        return;
      }
    }

    // Check if running as PWA
    const isPWA = window.matchMedia("(display-mode: standalone)").matches ||
                  (window.navigator as any).standalone === true ||
                  document.referrer.includes("android-app://");

    if (isPWA) {
      setIsInstalled(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("pwa-installed", "true");
      }
      return;
    }

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Handle app installed event
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setIsInstalled(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("pwa-installed", "true");
        localStorage.removeItem("pwa-prompt-dismissed");
      }
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowPrompt(false);
        setIsInstalled(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("pwa-installed", "true");
        }
      } else {
        dismissPrompt();
      }
    } catch (error) {
      console.error("Error installing PWA:", error);
    }
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("pwa-prompt-dismissed", "true");
    }
  };

  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-start gap-4 p-4 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/40 backdrop-blur-sm shadow-lg">
        <div className="flex-shrink-0 mt-0.5">
          <Download className="w-6 h-6 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground mb-1">
            Install Star Sailors
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            Install our app for offline access and a faster experience. Get notifications about your discoveries and activity.
          </p>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleInstall}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Install
            </Button>
            <Button
              onClick={dismissPrompt}
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
            >
              Not Now
            </Button>
          </div>
        </div>

        <button
          onClick={dismissPrompt}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-background/40 rounded"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
