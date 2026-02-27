"use client";
export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { VariantSwitcher } from "@/src/components/landing/VariantSwitcher";

// TODO(task-tdi1lj): Replace with confirmed Experiment 1 Godot build URL
const EXPERIMENT_1_URL = "/auth";
const SAILY_URL = "https://thedailysail.starsailors.space";

const sections = [
  {
    key: "hero",
    image: "/assets/Images/landing1.jpg",
    overlay: "from-black/70 via-black/40 to-black/10",
    align: "items-center justify-center text-center",
    tag: null,
    headline: "Real astronomy.\nYour kind of game.",
    body: "Three frontends. One universe. Scroll to explore.",
    cta: { label: "Explore", href: "#web-client", external: false },
    posthogKey: null,
  },
  {
    key: "web-client",
    image: "/assets/Images/landing2.jpg",
    overlay: "from-black/80 via-black/50 to-transparent",
    align: "items-end justify-start text-left",
    tag: "Strategy & science · 30–90 min sessions",
    headline: "Star Sailors\nWeb Client",
    body: "Deploy telescope, rover and satellite. Classify real TESS and NASA data across 10+ science projects. Mine, upgrade, and earn stardust.",
    cta: { label: "Launch Web Client", href: "/auth", external: false },
    posthogKey: "web-client",
  },
  {
    key: "experiment-1",
    image: "/assets/Images/landing3.jpg",
    overlay: "from-black/80 via-black/50 to-transparent",
    align: "items-end justify-start text-left",
    tag: "Game-first · 10–30 min sessions",
    headline: "Experiment 1",
    body: "Build rockets. Fly to real asteroids and exoplanet candidates. Scan targets with live TESS light-curve data in a focused, game-first loop.",
    cta: { label: "Play Experiment 1", href: EXPERIMENT_1_URL, external: false },
    posthogKey: "experiment-1",
  },
  {
    key: "saily",
    image: "/assets/Images/landing4.jpg",
    overlay: "from-black/80 via-black/50 to-transparent",
    align: "items-end justify-start text-left",
    tag: "Daily puzzle · ~5 min",
    headline: "Saily",
    body: "One real telescope anomaly every day. Annotate it solo, submit, and climb the community leaderboard. Streaks and badges track your progress.",
    cta: { label: "Open Saily ↗", href: SAILY_URL, external: true },
    posthogKey: "saily",
  },
];

export default function V4Page() {
  const posthog = usePostHog();
  useEffect(() => { posthog?.capture("landing_page_viewed", { variant: "v4" }); }, [posthog]);

  return (
    <div className="relative">
      {/* Sticky nav */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 mix-blend-difference sm:px-10">
        <span className="text-sm font-black uppercase tracking-[0.2em] text-white">Star Sailors</span>
        <Link href="/auth" className="text-sm font-semibold text-white underline underline-offset-4 hover:no-underline">
          Web Client →
        </Link>
      </header>

      {sections.map((s) => (
        <section
          key={s.key}
          id={s.key}
          className="relative flex h-screen min-h-[600px] snap-start overflow-hidden"
          aria-label={s.headline.replace(/\n/g, " ")}
        >
          <Image
            src={s.image}
            alt=""
            fill
            className="object-cover object-center"
            priority={s.key === "hero"}
            aria-hidden
          />
          {/* Gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t ${s.overlay}`} aria-hidden />

          {/* Content */}
          <div className={`relative flex w-full flex-col gap-4 px-6 pb-20 pt-28 sm:px-12 ${s.align}`}>
            {s.tag && (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">{s.tag}</p>
            )}
            <h2 className="whitespace-pre-line text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
              {s.headline}
            </h2>
            <p className="max-w-lg text-base text-white/75 sm:text-lg">{s.body}</p>
            {s.cta && (
              s.cta.external ? (
                <a
                  href={s.cta.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${s.cta.label} — opens in new tab`}
                  onClick={() => s.posthogKey && posthog?.capture("ecosystem_cta_clicked", { project: s.posthogKey, destination: s.cta.href })}
                >
                  <Button size="lg" className="mt-2 rounded-full bg-white text-gray-900 hover:bg-gray-100 font-semibold">
                    {s.cta.label} <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              ) : (
                <Link
                  href={s.cta.href}
                  onClick={() => s.posthogKey && posthog?.capture("ecosystem_cta_clicked", { project: s.posthogKey, destination: s.cta.href })}
                >
                  <Button size="lg" className="mt-2 rounded-full bg-white text-gray-900 hover:bg-gray-100 font-semibold">
                    {s.cta.label} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              )
            )}
          </div>

          {/* Scroll indicator on hero only */}
          {s.key === "hero" && (
            <a
              href="#web-client"
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 hover:text-white transition"
              aria-label="Scroll to projects"
            >
              <span className="text-xs uppercase tracking-widest">Scroll</span>
              <svg className="h-5 w-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          )}
        </section>
      ))}

      {/* Click-A-Coral + footer */}
      <section className="relative flex min-h-[30vh] items-center bg-gray-950 px-6 py-16 sm:px-12">
        <div className="flex w-full max-w-3xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="text-2xl font-black text-gray-700">Click-A-Coral</span>
            <p className="mt-1 text-sm text-gray-600">Coral-breeding citizen science game. In development — no ETA yet.</p>
          </div>
          <Button disabled variant="outline" className="shrink-0 rounded-full border-gray-700 text-gray-700">Coming Soon</Button>
        </div>
      </section>

      <footer className="bg-gray-950 border-t border-gray-800 px-6 py-6">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>© 2026 Star Sailors</span>
          <div className="flex gap-5">
            <a href="/terms" className="hover:text-gray-400">Terms</a>
            <a href="/privacy" className="hover:text-gray-400">Privacy</a>
            <a href="https://github.com/signal-k/client" target="_blank" rel="noreferrer" className="hover:text-gray-400">GitHub</a>
          </div>
        </div>
      </footer>

      <VariantSwitcher />
    </div>
  );
}
