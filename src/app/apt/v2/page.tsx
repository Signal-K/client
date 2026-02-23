"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/src/components/ui/button";
import { ArrowRight, ExternalLink, Menu, Rocket, Star, Telescope, Zap, X } from "lucide-react";
import { VariantSwitcher } from "@/src/components/landing/VariantSwitcher";

// TODO(task-tdi1lj): Replace with confirmed Experiment 1 Godot build URL
const EXPERIMENT_1_URL = "/auth";
const SAILY_URL = "https://thedailysail.starsailors.space";

const projects = [
  {
    key: "web-client",
    icon: <Telescope className="h-6 w-6" />,
    border: "border-teal-500/50 hover:border-teal-400",
    glow: "hover:shadow-teal-500/20",
    accent: "from-teal-500/15 to-transparent",
    badge: "bg-teal-400/10 text-teal-300 border-teal-400/20",
    cta: "bg-teal-400 text-slate-900 hover:bg-teal-300",
    name: "Star Sailors",
    forWho: "Strategy & science",
    tagline: "Full progression loop — deploy structures, classify real starlight, build a space base.",
    bullets: [
      "Telescope, rover & satellite deployment",
      "10+ missions with real TESS & NASA data",
      "Mining, upgrades, and stardust economy",
    ],
    session: "30–90 min",
    ctaLabel: "Launch Web Client",
    href: "/auth",
    external: false,
  },
  {
    key: "experiment-1",
    icon: <Rocket className="h-6 w-6" />,
    border: "border-amber-500/50 hover:border-amber-400",
    glow: "hover:shadow-amber-500/20",
    accent: "from-amber-500/15 to-transparent",
    badge: "bg-amber-400/10 text-amber-300 border-amber-400/20",
    cta: "bg-amber-400 text-slate-900 hover:bg-amber-300",
    name: "Experiment 1",
    forWho: "Game-first players",
    tagline: "Build rockets, fly to real astronomical targets, mine the solar system.",
    bullets: [
      "Launch to real asteroids & exoplanet candidates",
      "Scan targets with live TESS light-curve data",
      "Focused: PlanetHunters, Asteroids & Minor Planets",
    ],
    session: "10–30 min",
    ctaLabel: "Play Experiment 1",
    href: EXPERIMENT_1_URL,
    external: false,
  },
  {
    key: "saily",
    icon: <Zap className="h-6 w-6" />,
    border: "border-sky-500/50 hover:border-sky-400",
    glow: "hover:shadow-sky-500/20",
    accent: "from-sky-500/15 to-transparent",
    badge: "bg-sky-400/10 text-sky-300 border-sky-400/20",
    cta: "bg-sky-400 text-slate-900 hover:bg-sky-300",
    name: "Saily",
    forWho: "Daily puzzle players",
    tagline: "One real telescope anomaly every day. Annotate, submit, climb the leaderboard.",
    bullets: [
      "Fresh TESS light-curve data daily",
      "Solo annotation — no hints needed",
      "Streaks, badges, community threads",
    ],
    session: "~5 min daily",
    ctaLabel: "Open Saily",
    href: SAILY_URL,
    external: true,
  },
];

export default function V2Page() {
  const posthog = usePostHog();
  const [open, setOpen] = useState(false);

  useEffect(() => { posthog?.capture("landing_page_viewed", { variant: "v2" }); }, [posthog]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [open]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_15%,rgba(45,212,191,0.18),transparent_40%),radial-gradient(ellipse_at_90%_10%,rgba(245,158,11,0.12),transparent_35%),radial-gradient(ellipse_at_60%_85%,rgba(56,189,248,0.14),transparent_40%)]" />
        <div className="absolute inset-0 opacity-20 [background:linear-gradient(to_right,rgba(148,163,184,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,.08)_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-teal-400 text-slate-900">
              <Star className="h-4 w-4" aria-hidden />
            </div>
            <span className="text-lg font-black tracking-tight">Star Sailors</span>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <a href={SAILY_URL} target="_blank" rel="noreferrer" className="rounded-full border border-sky-400/40 bg-sky-400/10 px-4 py-1.5 text-sm font-semibold text-sky-300 hover:bg-sky-400/20 transition">
              Saily ↗
            </a>
            <Link href="/auth">
              <Button size="sm" className="rounded-full bg-teal-400 text-slate-900 hover:bg-teal-300" onClick={() => posthog?.capture("nav_cta_clicked", { destination: "web-client" })}>
                Web Client
              </Button>
            </Link>
          </div>
          <button className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 md:hidden" aria-label="Toggle menu" onClick={() => setOpen(v => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="border-t border-slate-800 px-5 pb-5 pt-4 md:hidden">
            <div className="flex flex-col gap-2">
              <a href={SAILY_URL} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full rounded-full border-sky-400/40 bg-sky-400/10 text-sky-300">Open Saily <ExternalLink className="ml-2 h-3.5 w-3.5" /></Button>
              </a>
              <Link href="/auth" onClick={() => setOpen(false)}>
                <Button className="w-full rounded-full bg-teal-400 text-slate-900 hover:bg-teal-300">Launch Web Client</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="px-5 pb-16 pt-24 text-center sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-5 inline-block rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-1.5 text-sm font-semibold text-teal-300">
            Citizen Science Ecosystem
          </div>
          <h1 className="text-5xl font-black leading-tight tracking-tight sm:text-7xl">
            Real science.
            <br />
            <span className="bg-gradient-to-r from-teal-300 via-sky-300 to-amber-300 bg-clip-text text-transparent">
              Pick your experience.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-slate-400 sm:text-lg">
            Three frontends. One universe. Pick the experience that matches your playstyle.
          </p>
          <a href="#projects" className="mt-8 inline-block">
            <Button size="lg" className="rounded-full bg-teal-400 text-slate-900 hover:bg-teal-300">
              Find your path <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Cards */}
      <section id="projects" className="px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-7xl grid gap-5 md:grid-cols-3">
          {projects.map((p) => (
            <article key={p.key} className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-slate-900/70 shadow-xl transition-all duration-300 ${p.border} ${p.glow} hover:-translate-y-1`}>
              <div className={`absolute inset-x-0 top-0 h-28 bg-gradient-to-b ${p.accent} pointer-events-none`} aria-hidden />
              <div className="relative flex flex-1 flex-col p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className={`rounded-xl border p-2.5 ${p.border} bg-slate-800/60`}>{p.icon}</div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${p.badge}`}>{p.forWho}</span>
                </div>
                <h3 className="text-xl font-black">{p.name}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{p.tagline}</p>
                <ul className="mt-4 flex flex-1 flex-col gap-2">
                  {p.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" fill="none" viewBox="0 0 12 12" aria-hidden>
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {b}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-slate-600">{p.session}</p>
                <div className="mt-4">
                  {p.external ? (
                    <a href={p.href} target="_blank" rel="noreferrer" aria-label={`${p.ctaLabel} — opens in new tab`} onClick={() => posthog?.capture("ecosystem_cta_clicked", { project: p.key, destination: p.href })}>
                      <Button className={`w-full rounded-full font-semibold ${p.cta}`}>{p.ctaLabel} <ExternalLink className="ml-2 h-4 w-4" /></Button>
                    </a>
                  ) : (
                    <Link href={p.href} onClick={() => posthog?.capture("ecosystem_cta_clicked", { project: p.key, destination: p.href })}>
                      <Button className={`w-full rounded-full font-semibold ${p.cta}`}>{p.ctaLabel} <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Click-A-Coral */}
        <div className="mx-auto mt-5 max-w-7xl flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/40 px-6 py-4">
          <div>
            <span className="font-bold text-slate-300">Click-A-Coral</span>
            <span className="ml-2 rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-500">In Development</span>
            <p className="mt-0.5 text-sm text-slate-500">Coral-breeding puzzle game linked to ClickACoral. Not yet ready for playtesting.</p>
          </div>
          <Button disabled variant="outline" className="shrink-0 rounded-full border-slate-700 text-slate-600">Coming Soon</Button>
        </div>
      </section>

      <footer className="border-t border-slate-800/60 px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-sm text-slate-600">
          <span>© 2026 Star Sailors</span>
          <div className="flex gap-5">
            <a href="/terms" className="hover:text-slate-400">Terms</a>
            <a href="/privacy" className="hover:text-slate-400">Privacy</a>
            <a href="https://github.com/signal-k/client" target="_blank" rel="noreferrer" className="hover:text-slate-400">GitHub</a>
          </div>
        </div>
      </footer>

      <VariantSwitcher />
    </div>
  );
}
