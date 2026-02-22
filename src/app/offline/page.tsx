"use client";

import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#002439] to-[#001829]">
      <div className="flex flex-col items-center justify-center max-w-md px-6 text-center">
        <div className="mb-6 p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <WifiOff className="w-16 h-16 text-white/80" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-3">
          You're Offline
        </h1>
        
        <p className="text-sm text-white/70 mb-6 leading-relaxed">
          Your internet connection is unavailable. Don't worry—you can still explore 
          previously visited pages and content that's been saved to your device.
        </p>

        <div className="flex gap-3 mb-6">
          <Button
            onClick={handleReload}
            className="gap-2 bg-[#78cce2] hover:bg-[#5ab4d4] text-[#002439]"
            variant="default"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          
          <Link href="/">
            <Button
              className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              variant="outline"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
          <p className="text-xs text-white/60 leading-relaxed">
            <strong className="text-white/80">Tip:</strong> Pages you've previously loaded are stored 
            locally. Navigate using the home button or your browser's back button to access cached content.
          </p>
        </div>

        <div className="mt-6 text-xs text-white/40">
          Star Sailors • Offline Mode
        </div>
      </div>
    </div>
  );
}
