import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, ExternalLink } from "lucide-react";
import { LandingAnalytics } from "./_components/LandingAnalytics";
import { LandingMobileMenu } from "./_components/LandingMobileMenu";

// TODO(task-30-p2-landing-page): Add experimental_ppr = true once upgraded to Next.js 15+

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

// TODO(task-tdi1lj): Replace with confirmed Experiment 1 Godot build URL
const EXPERIMENT_1_URL = "/auth";
const SAILY_URL = "https://thedailysail.starsailors.space";

const projects = [
  {
    key: "web-client",
    n: "01",
    name: "Star Sailors",
    sub: "Web Client",
    accent: "text-teal-500",
    tagline: "The full game loop — deploy structures, classify real NASA data, build your base.",
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
    accent: "text-amber-500",
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
    accent: "text-sky-500",
    tagline: "One real telescope anomaly every day. Annotate it. Submit. Climb the leaderboard.",
    detail: "~5 min daily · Solo annotation · Streaks & badges",
    cta: "Open",
    href: SAILY_URL,
    external: true,
  },
] as const;

// Static fallback — replaced by real Prisma data in Phase 7
function ActiveSailorsCount() {
  return (
    <span className="tabular-nums animate-number-count">
      —
    </span>
  );
}

export default function AptPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingAnalytics />

      {/* ─── Nav ─── */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/90 px-6 py-4 backdrop-blur-md sm:px-12">
        <span className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
          Star Sailors
        </span>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 text-sm md:flex">
          <a
            href={SAILY_URL}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground transition hover:text-foreground"
          >
            Saily ↗
          </a>
          <Link
            href="/auth"
            className="font-semibold text-foreground underline underline-offset-4 hover:text-primary"
          >
            Web Client →
          </Link>
        </div>

        {/* Mobile menu */}
        <div className="relative md:hidden">
          <LandingMobileMenu />
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden px-6 pb-20 pt-20 sm:px-12 lg:pt-32">
        {/* Star field — decorative, CSS only */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 star-field opacity-40 dark:opacity-60"
        />
        {/* Sunburst behind headline */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 h-full w-full sunburst-bg opacity-50"
        />

        <div className="relative max-w-5xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Citizen Science Ecosystem
          </p>

          <h1 className="text-[clamp(3rem,10vw,7rem)] font-black leading-[0.92] tracking-tight text-foreground">
            Real<br />astronomy.<br />
            <span className="text-primary">Your pace.</span>
          </h1>

          <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Star Sailors wraps genuine NASA and TESS research inside three distinct play
            experiences. Every scan you submit goes to real scientific databases.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/auth"
              className="btn-glow inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-black uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90"
            >
              Launch Web Client <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <a href="#explore" className="text-sm font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground">
              See projects ↓
            </a>
          </div>

          {/* Active sailors — dynamic slot */}
          <p className="mt-8 text-xs text-muted-foreground/60 tracking-wide">
            <Suspense fallback={<span>— sailors</span>}>
              <ActiveSailorsCount />
            </Suspense>
            {" "}active sailors right now
          </p>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="mx-6 border-t border-border sm:mx-12" />

      {/* ─── Project rows ─── */}
      <section id="explore" className="px-6 sm:px-12">
        {projects.map((p, idx) => (
          <div key={p.key}>
            <div className="grid grid-cols-1 gap-6 py-10 md:grid-cols-[5rem_1fr_auto] md:items-center md:gap-12">
              {/* Number */}
              <span className="text-5xl font-black text-border md:text-6xl" aria-hidden>
                {p.n}
              </span>

              {/* Name + detail */}
              <div>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-3xl font-black text-foreground sm:text-4xl">{p.name}</h2>
                  <span className={`text-xs font-semibold uppercase tracking-[0.2em] ${p.accent}`}>
                    {p.sub}
                  </span>
                </div>
                <p className="mt-2 max-w-xl text-base text-muted-foreground">{p.tagline}</p>
                <p className="mt-2 text-xs text-muted-foreground/60">{p.detail}</p>
              </div>

              {/* CTA */}
              <div className="shrink-0">
                {p.external ? (
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${p.cta} ${p.name} — opens in new tab`}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-foreground px-6 py-2.5 text-sm font-black uppercase tracking-wider text-foreground transition hover:bg-foreground hover:text-background"
                  >
                    {p.cta} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                ) : (
                  <Link
                    href={p.href}
                    aria-label={`${p.cta} ${p.name}`}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-foreground px-6 py-2.5 text-sm font-black uppercase tracking-wider text-foreground transition hover:bg-foreground hover:text-background"
                  >
                    {p.cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </Link>
                )}
              </div>
            </div>

            {idx < projects.length - 1 && (
              <div className="border-t border-border/50" />
            )}
          </div>
        ))}
      </section>

      {/* ─── Click-A-Coral teaser row ─── */}
      <div className="mx-6 border-t border-border/50 sm:mx-12" />
      <div className="px-6 py-10 sm:px-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[5rem_1fr_auto] md:items-center md:gap-12">
          <span className="text-5xl font-black text-border/40 md:text-6xl" aria-hidden>04</span>
          <div>
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-3xl font-black text-muted-foreground/50 sm:text-4xl">
                Click-A-Coral
              </h2>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/40">
                In Development
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground/40">
              A coral-breeding puzzle linked to real reef monitoring data. Coming soon.
            </p>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center rounded-full border-2 border-border/30 px-6 py-2.5 text-sm font-black uppercase tracking-wider text-muted-foreground/30">
              Soon
            </span>
          </div>
        </div>
      </div>

      {/* ─── About strip ─── */}
      <div className="mx-6 border-t border-border sm:mx-12" />
      <section id="about" className="px-6 py-16 sm:px-12">
        <div className="flex max-w-6xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Open-source citizen science. Real TESS telescope data, real asteroid surveys,
            real coral reef monitoring — wrapped in playable experiences. Every frame you
            annotate contributes to published scientific research.
          </p>
          <div className="flex shrink-0 flex-wrap gap-5 text-sm">
            <a
              href="https://github.com/signal-k/client"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-foreground underline underline-offset-4 hover:text-primary"
            >
              GitHub ↗
            </a>
            <a
              href="https://zooniverse.org"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Zooniverse ↗
            </a>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-12 flex flex-wrap gap-8 border-t border-border pt-8">
          {[
            { value: "11+", label: "Science projects" },
            { value: "3", label: "Deployment structures" },
            { value: "3", label: "Live frontends" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-black text-primary">{s.value}</div>
              <div className="mt-0.5 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <div className="mx-6 border-t border-border sm:mx-12" />
      <section className="px-6 py-16 sm:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-black text-foreground sm:text-3xl">
            Ready to explore?
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/auth"
              className="btn-glow inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-black uppercase tracking-wider text-primary-foreground transition hover:bg-primary/90"
            >
              Launch Web Client <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <a
              href={SAILY_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border-2 border-border px-7 py-3 text-sm font-black uppercase tracking-wider text-foreground transition hover:bg-muted"
            >
              Open Saily <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border px-6 py-6 sm:px-12">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 Star Sailors</span>
          <nav className="flex gap-4" aria-label="Footer navigation">
            <a href="/terms" className="hover:text-foreground">Terms</a>
            <a href="/privacy" className="hover:text-foreground">Privacy</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
