"use client";
export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { ArrowRight, ExternalLink, Menu, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { VariantSwitcher } from "@/src/components/landing/VariantSwitcher";

// TODO(task-tdi1lj): Replace with confirmed Experiment 1 Godot build URL
const EXPERIMENT_1_URL = "/auth";
const SAILY_URL = "https://thedailysail.starsailors.space";

const projects = [
  {
    key: "web-client",
    emoji: "🔭",
    color: "bg-teal-50 border-teal-100",
    headingColor: "text-teal-700",
    tagColor: "bg-teal-100 text-teal-700",
    ctaColor: "bg-teal-500 hover:bg-teal-600 text-white",
    tag: "Most complete experience",
    name: "Star Sailors",
    tagline: "A full space base you build piece by piece — using real telescope data.",
    bullets: ["Deploy a telescope, rover & satellite", "Complete 10+ missions with NASA data", "Mine, research, and grow your base"],
    session: "30–90 min /session",
    cta: "Open Web Client",
    href: "/auth",
    external: false,
    image: "/assets/Images/landing2.jpg",
  },
  {
    key: "experiment-1",
    emoji: "🚀",
    color: "bg-amber-50 border-amber-100",
    headingColor: "text-amber-700",
    tagColor: "bg-amber-100 text-amber-700",
    ctaColor: "bg-amber-500 hover:bg-amber-600 text-white",
    tag: "Game-first, focused missions",
    name: "Experiment 1",
    tagline: "Pick a real asteroid or exoplanet. Build a rocket. Go there.",
    bullets: ["3 focused mission types", "Live TESS light-curve scanning", "Quick to learn, hard to put down"],
    session: "10–30 min / session",
    cta: "Play Experiment 1",
    href: EXPERIMENT_1_URL,
    external: false,
    image: "/assets/Images/landing3.jpg",
  },
  {
    key: "saily",
    emoji: "⚡",
    color: "bg-sky-50 border-sky-100",
    headingColor: "text-sky-700",
    tagColor: "bg-sky-100 text-sky-700",
    ctaColor: "bg-sky-500 hover:bg-sky-600 text-white",
    tag: "Perfect for busy scientists",
    name: "Saily",
    tagline: "One real telescope anomaly each day. Annotate it. Come back tomorrow.",
    bullets: ["Daily TESS light-curve puzzle", "Solo annotation — take your time", "Streaks, badges & leaderboards"],
    session: "≈5 min / day",
    cta: "Open Saily",
    href: SAILY_URL,
    external: true,
    image: "/assets/Images/landing4.jpg",
  },
];

export default function V6Page() {
  const posthog = usePostHog();
  const [open, setOpen] = useState(false);

  useEffect(() => { posthog?.capture("landing_page_viewed", { variant: "v6" }); }, [posthog]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [open]);

  return (
    <div className="min-h-screen" style={{ background: "#faf8f5" }}>
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-stone-50/90 backdrop-blur-md px-5 py-3.5 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌌</span>
            <span className="text-base font-black text-stone-900">Star Sailors</span>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <a href={SAILY_URL} target="_blank" rel="noreferrer" className="rounded-full bg-sky-100 px-4 py-1.5 text-sm font-semibold text-sky-700 hover:bg-sky-200 transition">
              Open Saily ↗
            </a>
            <Link href="/auth">
              <Button size="sm" className="rounded-full bg-teal-500 text-white hover:bg-teal-600" onClick={() => posthog?.capture("nav_cta_clicked", { destination: "web-client" })}>
                Start Playing
              </Button>
            </Link>
          </div>
          <button className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 md:hidden" aria-label="Toggle menu" onClick={() => setOpen(v => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <div className="mt-3 flex flex-col gap-2 md:hidden">
            <a href={SAILY_URL} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full rounded-full border-sky-200 bg-sky-50 text-sky-700">Saily <ExternalLink className="ml-2 h-3.5 w-3.5" /></Button>
            </a>
            <Link href="/auth" onClick={() => setOpen(false)}>
              <Button className="w-full rounded-full bg-teal-500 text-white hover:bg-teal-600">Start Playing</Button>
            </Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="px-5 pb-12 pt-16 text-center sm:px-10 sm:pt-24">
        <div className="mx-auto max-w-3xl">
          <p className="mb-3 text-sm font-semibold text-stone-400 uppercase tracking-widest">Open-source citizen science</p>
          <h1 className="text-4xl font-black leading-tight text-stone-900 sm:text-6xl">
            Your place in the<br />cosmos awaits. 🌠
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-stone-500 sm:text-lg leading-relaxed">
            Real NASA telescope data. Playable experiences. Every annotation you make
            contributes to published scientific research — take as long as you like.
          </p>
          <a href="#projects" className="mt-8 inline-block">
            <Button size="lg" className="rounded-full bg-teal-500 text-white hover:bg-teal-600 font-semibold shadow-md shadow-teal-200">
              Find your experience
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Heading */}
      <section id="projects" className="px-5 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-center text-sm font-semibold text-stone-400 uppercase tracking-widest">Choose your adventure</p>
          <div className="grid gap-6 md:grid-cols-3">
            {projects.map((p) => (
              <article key={p.key} className={`group flex flex-col overflow-hidden rounded-3xl border ${p.color} shadow-sm hover:shadow-md transition-shadow`}>
                {/* Image */}
                <div className="relative h-40 overflow-hidden rounded-t-3xl">
                  <Image src={p.image} alt={`${p.name} preview`} fill className="object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  {/* Tag */}
                  <span className={`mb-3 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${p.tagColor}`}>
                    {p.tag}
                  </span>

                  {/* Name */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{p.emoji}</span>
                    <h3 className={`text-xl font-black ${p.headingColor}`}>{p.name}</h3>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">{p.tagline}</p>

                  {/* Bullets */}
                  <ul className="mt-4 flex flex-1 flex-col gap-2">
                    {p.bullets.map((b, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-stone-600">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-stone-300" aria-hidden />
                        {b}
                      </li>
                    ))}
                  </ul>

                  {/* Session */}
                  <p className="mt-4 text-xs font-semibold text-stone-400">{p.session}</p>

                  {/* CTA */}
                  <div className="mt-4">
                    {p.external ? (
                      <a href={p.href} target="_blank" rel="noreferrer" aria-label={`${p.cta} — opens in new tab`} onClick={() => posthog?.capture("ecosystem_cta_clicked", { project: p.key, destination: p.href })}>
                        <Button className={`w-full rounded-full font-semibold ${p.ctaColor}`}>
                          {p.cta} <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </a>
                    ) : (
                      <Link href={p.href} onClick={() => posthog?.capture("ecosystem_cta_clicked", { project: p.key, destination: p.href })}>
                        <Button className={`w-full rounded-full font-semibold ${p.ctaColor}`}>
                          {p.cta} <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Click-A-Coral */}
          <div className="mt-5 flex items-center justify-between gap-4 rounded-3xl border border-dashed border-stone-200 bg-stone-100/50 px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🪸</span>
              <div>
                <span className="font-bold text-stone-500">Click-A-Coral</span>
                <span className="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-xs text-stone-500">Coming soon</span>
                <p className="mt-0.5 text-sm text-stone-400">Coral citizen science, gamified. Still brewing — check back later.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="px-5 py-16 sm:px-10">
        <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-8 text-center sm:p-12">
          <p className="text-3xl font-black text-stone-800 sm:text-4xl">Real science. No PhD required. 🔬</p>
          <p className="mx-auto mt-4 max-w-lg text-stone-500 leading-relaxed">
            Star Sailors is an open-source platform. Real TESS telescope data, real asteroid surveys —
            wrapped in games so anyone can contribute to published research, five minutes at a time or five hours.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-semibold">
            <a href="https://github.com/signal-k/client" target="_blank" rel="noreferrer" className="text-teal-600 underline underline-offset-4 hover:text-teal-700">GitHub ↗</a>
            <a href="https://zooniverse.org" target="_blank" rel="noreferrer" className="text-stone-400 underline underline-offset-4 hover:text-stone-600">Zooniverse ↗</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 px-5 py-7 sm:px-10" style={{ background: "#faf8f5" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between text-sm text-stone-400">
          <span>© 2026 Star Sailors</span>
          <div className="flex gap-5">
            <a href="/terms" className="hover:text-stone-600">Terms</a>
            <a href="/privacy" className="hover:text-stone-600">Privacy</a>
            <a href="https://github.com/signal-k/client" target="_blank" rel="noreferrer" className="hover:text-stone-600">GitHub</a>
          </div>
        </div>
      </footer>

      <VariantSwitcher />
    </div>
  );
}
