"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { VariantSwitcher } from "@/src/components/landing/VariantSwitcher";

// TODO(task-tdi1lj): Replace with confirmed Experiment 1 Godot build URL
const EXPERIMENT_1_URL = "/auth";
const SAILY_URL = "https://thedailysail.starsailors.space";

const projects = [
  {
    key: "web-client",
    n: "01",
    name: "Star Sailors",
    sub: "Web Client",
    tagline: "The full strategy loop. Deploy structures, classify real NASA data, build a base.",
    detail: "30–90 min sessions · Strategy & science · 10+ missions",
    cta: "Launch",
    href: "/auth",
    external: false,
  },
  {
    key: "experiment-1",
    n: "02",
    name: "Experiment 1",
    sub: "Rocket Missions",
    tagline: "Build rockets, fly to real targets, scan with live TESS light-curve data.",
    detail: "10–30 min sessions · Game-first · 3 focused missions",
    cta: "Play",
    href: EXPERIMENT_1_URL,
    external: false,
  },
  {
    key: "saily",
    n: "03",
    name: "Saily",
    sub: "Daily Puzzle",
    tagline: "One real telescope anomaly every day. Annotate it. Submit. Climb the leaderboard.",
    detail: "~5 min daily · Solo annotation · Streaks & badges",
    cta: "Open",
    href: SAILY_URL,
    external: true,
  },
];

export default function V3Page() {
  const posthog = usePostHog();
  useEffect(() => { posthog?.capture("landing_page_viewed", { variant: "v3" }); }, [posthog]);

  return (
    <div className="min-h-screen bg-white text-gray-950">
      {/* Nav */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 sm:px-12">
        <span className="text-sm font-black uppercase tracking-[0.2em] text-gray-900">Star Sailors</span>
        <div className="flex items-center gap-6 text-sm">
          <a href={SAILY_URL} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-900 transition">Saily ↗</a>
          <Link href="/auth" className="font-semibold text-gray-900 underline underline-offset-4 hover:text-teal-600">
            Web Client →
          </Link>
        </div>
      </header>

      {/* Hero — oversized type */}
      <section className="px-6 pb-16 pt-20 sm:px-12 lg:pt-28">
        <div className="max-w-6xl">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.25em] text-gray-400">
            Citizen Science Ecosystem
          </p>
          <h1 className="text-[clamp(3rem,10vw,7rem)] font-black leading-[0.95] tracking-tight text-gray-950">
            Real<br />astronomy.<br />Your pace.
          </h1>
          <p className="mt-8 max-w-lg text-lg text-gray-500 leading-relaxed">
            Star Sailors wraps genuine NASA and TESS research inside three distinct play experiences.
            Every annotation ships to real scientific databases.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-6 border-t border-gray-200 sm:mx-12" />

      {/* Project rows */}
      <section className="px-6 sm:px-12">
        {projects.map((p, idx) => (
          <div key={p.key}>
            <div className="grid grid-cols-1 gap-6 py-10 md:grid-cols-[5rem_1fr_auto] md:items-center md:gap-12">
              {/* Number */}
              <span className="text-5xl font-black text-gray-100 md:text-6xl">{p.n}</span>

              {/* Name + detail */}
              <div>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-3xl font-black text-gray-950 sm:text-4xl">{p.name}</h2>
                  <span className="text-sm font-semibold uppercase tracking-widest text-gray-400">{p.sub}</span>
                </div>
                <p className="mt-2 max-w-xl text-base text-gray-600">{p.tagline}</p>
                <p className="mt-2 text-xs text-gray-400">{p.detail}</p>
              </div>

              {/* CTA */}
              <div className="shrink-0">
                {p.external ? (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${p.cta} ${p.name} — opens in new tab`}
                    onClick={() => posthog?.capture("ecosystem_cta_clicked", { project: p.key, destination: p.href })}
                    className="group inline-flex items-center gap-2 rounded-full border-2 border-gray-950 px-6 py-2.5 text-sm font-black uppercase tracking-wider text-gray-950 transition hover:bg-gray-950 hover:text-white"
                  >
                    {p.cta} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <Link
                    href={p.href}
                    aria-label={`${p.cta} ${p.name}`}
                    onClick={() => posthog?.capture("ecosystem_cta_clicked", { project: p.key, destination: p.href })}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-gray-950 px-6 py-2.5 text-sm font-black uppercase tracking-wider text-gray-950 transition hover:bg-gray-950 hover:text-white"
                  >
                    {p.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
            {idx < projects.length - 1 && <div className="border-t border-gray-100" />}
          </div>
        ))}
      </section>

      {/* Click-A-Coral row */}
      <div className="mx-6 border-t border-gray-100 sm:mx-12" />
      <div className="px-6 py-8 sm:px-12">
        <div className="flex items-center gap-4 text-sm text-gray-300">
          <span className="text-3xl font-black">04</span>
          <div>
            <span className="block font-black text-gray-300">Click-A-Coral</span>
            <span className="text-xs uppercase tracking-widest">In Development · No ETA</span>
          </div>
        </div>
      </div>

      {/* About strip */}
      <div className="mx-6 border-t border-gray-200 sm:mx-12" />
      <section className="px-6 py-16 sm:px-12">
        <div className="flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-xl text-gray-400 leading-relaxed">
            Open-source citizen science. Real TESS telescope data, real asteroid surveys,
            real coral reef monitoring — wrapped in playable experiences. Every frame you
            annotate contributes to published scientific research.
          </p>
          <div className="flex flex-wrap gap-5 text-sm">
            <a href="https://github.com/signal-k/client" target="_blank" rel="noreferrer" className="font-semibold text-gray-900 underline underline-offset-4 hover:text-teal-600">GitHub ↗</a>
            <a href="https://zooniverse.org" target="_blank" rel="noreferrer" className="font-semibold text-gray-400 underline underline-offset-4 hover:text-gray-600">Zooniverse ↗</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-6 sm:px-12">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>© 2026 Star Sailors</span>
          <div className="flex gap-4">
            <a href="/terms" className="hover:text-gray-700">Terms</a>
            <a href="/privacy" className="hover:text-gray-700">Privacy</a>
          </div>
        </div>
      </footer>

      <VariantSwitcher />
    </div>
  );
}
