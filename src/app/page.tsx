import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, ExternalLink } from "lucide-react";

import { createSupabaseServerClient } from "@/src/lib/supabase/ssr";
import { cn } from "@/src/shared/utils";
import { LandingAnalytics } from "./apt/_components/LandingAnalytics";
import { LandingMobileMenu } from "./apt/_components/LandingMobileMenu";
import { LandingStats, LandingStatsFallback } from "./apt/_components/LandingStats";

export const experimental_ppr = true;

export const metadata: Metadata = {
  title: "Star Sailors — Real astronomy. Your kind of game.",
  description:
    "Play games. Do real science. Star Sailors wraps genuine NASA and TESS research inside three distinct play experiences.",
  openGraph: {
    title: "Star Sailors",
    description: "Real astronomy. Your kind of game.",
    images: [{ url: "/assets/Images/landing1.jpg", width: 1200, height: 630 }],
  },
};

const EXPERIMENT_1_URL = "/auth";
const SAILY_URL = "https://thedailysail.starsailors.space";

const projects = [
  {
    key: "web-client",
    n: "01",
    name: "Star Sailors",
    sub: "Web Client",
    accent: "text-teal-500",
    glow: "glow-teal",
    tagline: "The full game loop — deploy structures, classify real NASA data, build your base.",
    detail: "Strategy & science · 10+ missions",
    cta: "Launch",
    href: "/auth",
    external: false,
  },
  {
    key: "experiment-1",
    n: "02",
    name: "Experiment 1",
    sub: "Rocket Missions",
    accent: "text-amber-500",
    glow: "glow-amber",
    tagline: "Build rockets, fly to real targets, scan with live TESS light-curve data.",
    detail: "Game-first · 3 focused missions",
    cta: "Play",
    href: EXPERIMENT_1_URL,
    external: false,
  },
  {
    key: "saily",
    n: "03",
    name: "Saily",
    sub: "Daily Puzzle",
    accent: "text-sky-500",
    glow: "glow-sky",
    tagline: "One real telescope anomaly every day. Annotate it. Submit. Climb the leaderboard.",
    detail: "Solo annotation · Streaks & badges",
    cta: "Open",
    href: SAILY_URL,
    external: true,
  },
] as const;

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/game?from=landing");
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <LandingAnalytics />

      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md sm:px-12">
        <span className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
          Star Sailors
        </span>

        <div className="hidden items-center gap-8 text-sm md:flex">
          <a
            href="https://docs.starsailors.space"
            target="_blank"
            rel="noreferrer"
            data-track="guide_link_clicked"
            className="text-muted-foreground transition hover:text-foreground"
          >
            Full Guide
          </a>
          <a
            href={SAILY_URL}
            target="_blank"
            rel="noreferrer"
            data-track="cross_game_navigation"
            data-track-props='{"destination":"saily","source_section":"landing_nav"}'
            className="text-muted-foreground transition hover:text-foreground"
          >
            Games Ecosystem
          </a>
          <Link
            href="/auth"
            data-track="hero_cta_clicked"
            data-track-props='{"source":"nav"}'
            className="font-bold text-foreground underline underline-offset-8 decoration-primary/40 hover:decoration-primary transition-all"
          >
            Launch Web Client →
          </Link>
        </div>

        <div className="relative md:hidden">
          <LandingMobileMenu />
        </div>
      </header>

      <section className="relative overflow-hidden px-6 pb-24 pt-24 sm:px-12 lg:pt-36">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 star-field opacity-40 dark:opacity-60"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-1/4 top-0 h-[1000px] w-[1000px] sunburst-hero opacity-20 animate-orbit"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]"
        />

        <div className="relative max-w-6xl">
          <p className="mb-8 inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
            The Citizen Science Ecosystem
          </p>

          <h1 className="text-[clamp(3.5rem,12vw,8.5rem)] font-black leading-[0.9] tracking-tighter text-foreground">
            Real
            <br />
            astronomy.
            <br />
            <span className="text-primary italic">Your pace.</span>
          </h1>

          <div className="mt-12 max-w-2xl">
            <p className="text-xl leading-relaxed text-muted-foreground sm:text-2xl">
              Star Sailors wraps genuine NASA and TESS research inside playable experiences.
              Deploy orbital structures, classify anomalies, and contribute to published
              scientific research from your browser.
            </p>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-6">
            <Link
              href="/auth"
              data-track="hero_cta_clicked"
              data-track-props='{"source":"hero"}'
              className="btn-glow group inline-flex items-center gap-3 rounded-full bg-primary px-10 py-4 text-sm font-black uppercase tracking-wider text-primary-foreground transition-all hover:scale-105 active:scale-95"
            >
              Launch Web Client
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <a href="#explore" className="group flex items-center gap-2 text-sm font-bold text-muted-foreground transition hover:text-foreground">
              Explore the fleet
              <span className="inline-block transition-transform group-hover:translate-y-1">↓</span>
            </a>
          </div>
        </div>
      </section>

      <div className="mx-6 border-t border-border sm:mx-12" />

      <section id="explore" className="px-6 py-12 sm:px-12">
        <h2 className="mb-12 text-xs font-bold uppercase tracking-[0.4em] text-muted-foreground/50">
          Active Missions
        </h2>

        {projects.map((p, idx) => (
          <div key={p.key} className="group relative">
            <div className="grid grid-cols-1 gap-8 py-16 md:grid-cols-[8rem_1fr_auto] md:items-center md:gap-16">
              <div className="relative">
                <span className="text-7xl font-black text-border/40 transition-colors group-hover:text-primary/20 md:text-8xl" aria-hidden>
                  {p.n}
                </span>
                <div className={cn("absolute inset-0 -z-10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100", p.glow)} />
              </div>

              <div className="sci-fi-panel border-none bg-transparent p-0 shadow-none backdrop-blur-0">
                <div className="flex flex-wrap items-baseline gap-4">
                  <h3 className="text-4xl font-black tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-5xl">
                    {p.name}
                  </h3>
                  <span className={cn("rounded-full border border-border/50 bg-muted/50 px-3 py-1 text-xs font-bold uppercase tracking-[0.3em]", p.accent)}>
                    {p.sub}
                  </span>
                </div>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                  {p.tagline}
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="h-px w-8 bg-border transition-all group-hover:w-12 group-hover:bg-primary" />
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">{p.detail}</p>
                </div>
              </div>

              <div className="shrink-0 pt-4 md:pt-0">
                {p.external ? (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${p.cta} ${p.name} — opens in new tab`}
                    data-track="cross_game_navigation"
                    data-track-props={JSON.stringify({ destination: p.key, source_section: "landing_project_row" })}
                    className="inline-flex items-center gap-3 rounded-full border-2 border-foreground px-8 py-3.5 text-sm font-black uppercase tracking-wider text-foreground transition-all hover:scale-105 hover:bg-foreground hover:text-background"
                  >
                    {p.cta} <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                ) : (
                  <Link
                    href={p.href}
                    aria-label={`${p.cta} ${p.name}`}
                    data-track={p.key === "experiment-1" ? "cross_game_navigation" : "structure_preview_card_clicked"}
                    data-track-props={JSON.stringify(
                      p.key === "experiment-1"
                        ? { destination: "experiment-1", source_section: "landing_project_row" }
                        : { structure: p.key, destination: p.href }
                    )}
                    className="inline-flex items-center gap-3 rounded-full border-2 border-foreground px-8 py-3.5 text-sm font-black uppercase tracking-wider text-foreground transition-all hover:scale-105 hover:bg-foreground hover:text-background"
                  >
                    {p.cta} <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
              </div>
            </div>

            {idx < projects.length - 1 && <div className="border-t border-border/30" />}
          </div>
        ))}
      </section>

      <section id="about" className="bg-muted/30 px-6 py-24 sm:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div>
              <h2 className="mb-8 text-xs font-bold uppercase tracking-[0.4em] text-primary">
                Play Games. Do Science.
              </h2>
              <p className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                Every scan you submit goes directly to NASA, ESA, and Zooniverse databases.
              </p>
              <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
                We bridge the gap between heavy research data and engaging play. Whether you have
                5 minutes or 2 hours, your time contributes to real discoveries in our galaxy and
                on our home planet.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <Suspense fallback={<LandingStatsFallback />}>
                <LandingStats />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
