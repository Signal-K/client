"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { usePostHog } from "posthog-js/react";

const SAILY_URL = "https://thedailysail.starsailors.space";

export function LandingMobileMenu() {
  const [open, setOpen] = useState(false);
  const posthog = usePostHog();

  return (
    <>
      <button
        className="rounded-lg p-2 text-foreground/60 hover:bg-muted md:hidden"
        aria-label="Toggle navigation menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-t border-border bg-background/95 px-5 pb-5 pt-4 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            <a
              href="#explore"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-foreground/70 hover:bg-muted hover:text-foreground"
            >
              Explore
            </a>
            <a
              href="#about"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-foreground/70 hover:bg-muted hover:text-foreground"
            >
              About
            </a>
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <a
              href={SAILY_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => { setOpen(false); posthog?.capture("nav_cta_clicked", { destination: "saily" }); }}
            >
              <Button variant="outline" className="w-full rounded-full">
                Open Saily <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden />
              </Button>
            </a>
            <Link href="/auth" onClick={() => { setOpen(false); posthog?.capture("nav_cta_clicked", { destination: "web-client" }); }}>
              <Button className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                Launch Web Client
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
