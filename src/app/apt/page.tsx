"use client";
export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/src/components/ui/button";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  Menu,
  Rocket,
  Star,
  Telescope,
  Zap,
  X,
} from "lucide-react";
import { VariantSwitcher } from "@/src/components/landing/VariantSwitcher";

// TODO(task-tdi1lj): Replace EXPERIMENT_1_URL with real URL once Experiment 1
// Godot build URL contract is defined. Currently links to web client auth as fallback.
const EXPERIMENT_1_URL = "/auth";
const EXPERIMENT_1_EXTERNAL = false;

const SAILY_URL = "https://thedailysail.starsailors.space";

interface Project {
  key: string;
  icon: React.ReactNode;
  color: string;
  iconBg: string;
  badgeColor: string;
  ctaColor: string;
  ctaBorder: string;
  name: string;
  forWho: string;
  tagline: string;
  bullets: string[];
  session: string;
  cta: string;
  href: string;
  external: boolean;
  image: string;
}

export default function AptPage() {
  const posthog = usePostHog();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    posthog?.capture("landing_page_viewed");
  }, [posthog]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileMenuOpen]);

  const projects: Project[] = [
    {
      key: "web-client",
      icon: <Telescope className="h-6 w-6" />,
      color: "text-teal-600",
      iconBg: "bg-teal-50 border-teal-100",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
      ctaColor: "bg-teal-500 hover:bg-teal-600 text-white",
      ctaBorder: "border-t-4 border-teal-400",
      name: "Star Sailors",
      forWho: "Strategy & science explorers",
      tagline: "The full game loop — deploy structures, classify real starlight, and build a space base.",
      bullets: [
        "Deploy telescope, rover & satellite structures",
        "Classify real TESS & NASA data on 10+ missions",
        "Mine minerals, research upgrades, earn stardust",
      ],
      session: "30–90 min sessions",
      cta: "Launch Web Client",
      href: "/auth",
      external: false,
      image: "/assets/Images/landing2.jpg",
    },
    {
      key: "experiment-1",
      icon: <Rocket className="h-6 w-6" />,
      color: "text-amber-600",
      iconBg: "bg-amber-50 border-amber-100",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
      ctaColor: "bg-amber-500 hover:bg-amber-600 text-white",
      ctaBorder: "border-t-4 border-amber-400",
      name: "Experiment 1",
      forWho: "Game-first players",
      tagline: "Build rockets, fly to real astronomical targets, mine the solar system.",
      bullets: [
        "Launch missions to real asteroids & exoplanet candidates",
        "Scan targets using live TESS light-curve data",
        "Focused scope: PlanetHunters, Asteroids & Minor Planets",
      ],
      session: "10–30 min sessions",
      cta: "Play Experiment 1",
      href: EXPERIMENT_1_URL,
      external: EXPERIMENT_1_EXTERNAL,
      image: "/assets/Images/landing3.jpg",
    },
    {
      key: "saily",
      icon: <Zap className="h-6 w-6" />,
      color: "text-sky-600",
      iconBg: "bg-sky-50 border-sky-100",
      badgeColor: "bg-sky-50 text-sky-700 border-sky-200",
      ctaColor: "bg-sky-500 hover:bg-sky-600 text-white",
      ctaBorder: "border-t-4 border-sky-400",
      name: "Saily",
      forWho: "Daily puzzle players",
      tagline: "One real telescope anomaly every day. Annotate it, submit, climb the leaderboard.",
      bullets: [
        "Fresh TESS light-curve data released each day",
        "Annotate and classify solo — no hints required",
        "Streaks, badges, and community discussion",
      ],
      session: "~5 min daily",
      cta: "Open Saily",
      href: SAILY_URL,
      external: true,
      image: "/assets/Images/landing4.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ─── Nav ─── */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-teal-500 text-white">
              <Star className="h-4 w-4" aria-hidden />
            </div>
            <span className="text-lg font-black tracking-tight text-gray-900">Star Sailors</span>
          </div>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            <a href="#choose" className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition">
              Explore
            </a>
            <a href="#about" className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition">
              About
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href={SAILY_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => posthog?.capture("nav_cta_clicked", { destination: "saily" })}
              className="rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 text-sm font-semibold text-sky-700 hover:bg-sky-100 transition"
            >
              Saily ↗
            </a>
            <Link href="/auth">
              <Button
                size="sm"
                className="rounded-full bg-teal-500 text-white hover:bg-teal-600"
                onClick={() => posthog?.capture("nav_cta_clicked", { destination: "web-client" })}
              >
                Web Client
              </Button>
            </Link>
          </div>

          <button
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-100 px-5 pb-5 pt-4 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
              <a href="#choose" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100">Explore</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100">About</a>
            </nav>
            <div className="mt-4 flex flex-col gap-2">
              <a href={SAILY_URL} target="_blank" rel="noreferrer" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-full border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100">
                  Open Saily <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden />
                </Button>
              </a>
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-full bg-teal-500 text-white hover:bg-teal-600">Launch Web Client</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="relative h-[520px] w-full sm:h-[600px] lg:h-[680px]">
          <Image
            src="/assets/Images/landing1.jpg"
            alt="Star field with distant galaxies and nebulae"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70" />
          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center sm:px-8">
            <span className="mb-4 inline-block rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
              Citizen Science Ecosystem
            </span>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-white sm:text-6xl">
              Real astronomy.<br />Your kind of game.
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
              Star Sailors wraps genuine NASA and TESS research inside playable experiences.
              Every classification you make contributes to real science.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#choose">
                <Button size="lg" className="rounded-full bg-white text-gray-900 hover:bg-gray-100 font-semibold shadow-lg">
                  Find your experience
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                </Button>
              </a>
              <a href={SAILY_URL} target="_blank" rel="noreferrer">
                <Button size="lg" variant="outline" className="rounded-full border-white/50 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20">
                  Open Saily <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Project chooser ─── */}
      <section id="choose" className="bg-gray-50 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">
              Three experiences. One universe.
            </h2>
            <p className="mt-3 text-base text-gray-500 sm:text-lg">
              Pick the frontend that matches your session length and playstyle.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {projects.map((project) => (
              <article
                key={project.key}
                className={`group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 ${project.ctaBorder}`}
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={`${project.name} preview`}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  {/* For-who badge */}
                  <span className={`mb-3 inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${project.badgeColor}`}>
                    {project.forWho}
                  </span>

                  {/* Icon + name */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`rounded-lg border p-2 ${project.iconBg} ${project.color}`} aria-hidden>
                      {project.icon}
                    </div>
                    <h3 className="text-xl font-black text-gray-900">{project.name}</h3>
                  </div>

                  {/* Tagline */}
                  <p className="text-sm text-gray-600 mb-5">{project.tagline}</p>

                  {/* Bullets */}
                  <ul className="flex flex-1 flex-col gap-2 mb-5" aria-label={`${project.name} features`}>
                    {project.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <svg className={`mt-0.5 h-4 w-4 shrink-0 ${project.color}`} fill="none" viewBox="0 0 16 16" aria-hidden>
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>

                  {/* Session */}
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
                    <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span>{project.session}</span>
                  </div>

                  {/* CTA */}
                  {project.external ? (
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${project.cta} — opens in a new tab`}
                      onClick={() => posthog?.capture("ecosystem_cta_clicked", { project: project.key, destination: project.href })}
                    >
                      <Button className={`w-full rounded-full font-semibold ${project.ctaColor}`}>
                        {project.cta}
                        <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
                      </Button>
                    </a>
                  ) : (
                    <Link
                      href={project.href}
                      aria-label={project.cta}
                      onClick={() => posthog?.capture("ecosystem_cta_clicked", { project: project.key, destination: project.href })}
                    >
                      <Button className={`w-full rounded-full font-semibold ${project.ctaColor}`}>
                        {project.cta}
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                      </Button>
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Click-A-Coral teaser */}
          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-dashed border-gray-300 bg-white p-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-800">Click-A-Coral</span>
                <span className="rounded-full bg-gray-100 border border-gray-200 px-2 py-0.5 text-xs text-gray-500">In Development</span>
              </div>
              <p className="text-sm text-gray-500">
                A coral-breeding puzzle game linked to the ClickACoral citizen science project. Not yet ready for playtesting.
              </p>
            </div>
            <Button disabled variant="outline" className="shrink-0 rounded-full border-gray-200 text-gray-400">
              Coming Soon
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Image strip ─── */}
      <section className="overflow-hidden bg-white">
        <div className="flex h-52 sm:h-64">
          {["/assets/Images/landing5.jpg", "/assets/Images/landing6.jpg", "/assets/Images/landing2.jpg"].map((src, i) => (
            <div key={i} className="relative flex-1 overflow-hidden">
              <Image
                src={src}
                alt=""
                fill
                className="object-cover object-center"
                aria-hidden
              />
            </div>
          ))}
        </div>
      </section>

      {/* ─── About ─── */}
      <section id="about" className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="mb-4 inline-block text-xs font-bold uppercase tracking-widest text-teal-600">
                About the project
              </span>
              <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">
                Play games. Do real science.
              </h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                Star Sailors is an open-source citizen science platform. Each frontend wraps genuine
                astronomical research — exoplanet detection from TESS data, asteroid surveys, coral reef monitoring —
                inside playable loops. Every annotation you submit goes to real scientific databases.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { value: "11+", label: "Science projects" },
                  { value: "3", label: "Deployment structures" },
                  { value: "3", label: "Live frontends" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-center">
                    <div className="text-2xl font-black text-teal-600">{s.value}</div>
                    <div className="mt-0.5 text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="https://github.com/signal-k/client" target="_blank" rel="noreferrer" className="text-sm font-semibold text-teal-600 underline underline-offset-4 hover:text-teal-700">
                  View on GitHub ↗
                </a>
                <a href="https://zooniverse.org" target="_blank" rel="noreferrer" className="text-sm font-semibold text-gray-400 underline underline-offset-4 hover:text-gray-600">
                  Partner: Zooniverse ↗
                </a>
              </div>
            </div>
            <div className="relative h-72 overflow-hidden rounded-2xl shadow-lg lg:h-96">
              <Image
                src="/assets/Images/landing3.jpg"
                alt="Telescope observing a star field"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA Band ─── */}
      <section className="bg-teal-500 px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            Ready to explore?
          </h2>
          <p className="mt-3 text-teal-100">
            Start with the web client, try the daily Saily puzzle, or follow missions in Experiment 1.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/auth" onClick={() => posthog?.capture("ecosystem_cta_clicked", { project: "web-client", destination: "/auth" })}>
              <Button size="lg" className="rounded-full bg-white text-teal-700 hover:bg-gray-100 font-semibold shadow">
                Launch Web Client
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Button>
            </Link>
            <a href={SAILY_URL} target="_blank" rel="noreferrer" onClick={() => posthog?.capture("ecosystem_cta_clicked", { project: "saily", destination: SAILY_URL })}>
              <Button size="lg" variant="outline" className="rounded-full border-white/50 bg-white/10 text-white hover:bg-white/20">
                Open Saily <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-200 bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-gray-400 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid h-6 w-6 place-items-center rounded-full bg-teal-500 text-white">
              <Star className="h-3 w-3" aria-hidden />
            </div>
            <span className="font-semibold text-gray-600">Star Sailors</span>
            <span>© 2026</span>
          </div>
          <nav className="flex items-center gap-5" aria-label="Footer navigation">
            <a href="/terms" className="hover:text-gray-700">Terms</a>
            <a href="/privacy" className="hover:text-gray-700">Privacy</a>
            <a href="https://github.com/signal-k/client" target="_blank" rel="noreferrer" className="hover:text-gray-700">GitHub</a>
          </nav>
        </div>
      </footer>

      <VariantSwitcher />
    </div>
  );
}
