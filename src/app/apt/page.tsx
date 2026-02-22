"use client";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { ArrowRight, ExternalLink, Menu, Rocket, Star, X } from "lucide-react";

const projects = [
  {
    key: "web-client",
    name: "Star Sailors Web Client",
    status: "Live",
    description: "Primary frontend in this repository. Best for full progression, deploy loops, and active mechanics.",
    bestFor: "Text-first strategy loop and broadest current features.",
    href: "/auth",
    cta: "Play Web Client",
    external: false,
    disabled: false,
  },
  {
    key: "experiment-1",
    name: "PlanetHunters Experiment 1",
    status: "Live (Subset)",
    description: "Focused subset for game-first mission flow with smaller scope.",
    bestFor: "Players wanting a tighter mission-first loop.",
    href: "/auth",
    cta: "Start Here",
    external: false,
    disabled: false,
  },
  {
    key: "saily",
    name: "Saily",
    status: "External Frontend",
    description: "Saily is not part of this codebase and is linked as an external experience.",
    bestFor: "Daily puzzle cadence and short sessions.",
    href: "https://thedailysail.starsailors.space",
    cta: "Open Saily",
    external: true,
    disabled: false,
  },
  {
    key: "click-a-coral",
    name: "Click-A-Coral",
    status: "In Development",
    description: "Upcoming ecosystem surface, currently not ready for public playtesting.",
    bestFor: "Coral-focused puzzle gameplay (planned).",
    href: "",
    cta: "Coming Soon",
    external: false,
    disabled: true,
  },
];

export default function AptPage() {
  const posthog = usePostHog();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    posthog?.capture("landing_page_viewed");
  }, [posthog]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(45,212,191,0.2),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(249,115,22,0.15),transparent_30%),radial-gradient(circle_at_65%_80%,rgba(56,189,248,0.14),transparent_32%)]" />
        <div className="absolute inset-0 opacity-25 [background:linear-gradient(to_right,rgba(148,163,184,.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,.12)_1px,transparent_1px)] [background-size:34px_34px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-teal-400 text-slate-900">
              <Star className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-black tracking-tight">Star Sailors</h1>
          </div>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#ecosystem" className="text-sm text-slate-300 hover:text-teal-300">Ecosystem</a>
            <a href="#flow" className="text-sm text-slate-300 hover:text-teal-300">Flow</a>
          </nav>

          <Link href="/auth" className="hidden md:block">
            <Button className="rounded-full bg-teal-400 text-slate-900 hover:bg-teal-300">Play Web Client</Button>
          </Link>

          <button
            className="rounded-lg p-2 hover:bg-slate-800 md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-800 px-6 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              <a href="#ecosystem" onClick={() => setMobileMenuOpen(false)}>Ecosystem</a>
              <a href="#flow" onClick={() => setMobileMenuOpen(false)}>Flow</a>
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-full bg-teal-400 text-slate-900 hover:bg-teal-300">Play Web Client</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <section className="px-6 pb-14 pt-20">
        <div className="mx-auto max-w-7xl">
          <Badge className="mb-6 border border-teal-300/40 bg-teal-400/20 text-teal-200">Citizen Science Ecosystem</Badge>
          <h2 className="max-w-4xl text-5xl font-black leading-tight md:text-7xl">
            One Universe.
            <br />
            Multiple Frontends.
            <br />
            Clear Entry Points.
          </h2>
          <p className="mt-6 max-w-3xl text-lg text-slate-300 md:text-xl">
            Start in the web client for the most complete experience, then branch to specialized experiences like Saily.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/auth">
              <Button size="lg" className="rounded-full bg-teal-400 text-slate-900 hover:bg-teal-300">
                <Rocket className="mr-2 h-5 w-5" />
                Start Web Client
              </Button>
            </Link>
            <a href="https://thedailysail.starsailors.space" target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline" className="rounded-full border-slate-600 bg-slate-900/70 text-slate-100 hover:bg-slate-800">
                Open Saily
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section id="ecosystem" className="px-6 py-14">
        <div className="mx-auto max-w-7xl">
          <h3 className="text-3xl font-black md:text-4xl">Ecosystem Routing</h3>
          <p className="mt-3 max-w-3xl text-slate-300">What is live, who it is for, and where to go.</p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {projects.map((project) => (
              <Card key={project.key} className="border-slate-700 bg-slate-900/70">
                <CardHeader>
                  <div className="mb-2 flex items-center justify-between">
                    <CardTitle>{project.name}</CardTitle>
                    <Badge className="border-slate-600 bg-slate-800 text-slate-200">{project.status}</Badge>
                  </div>
                  <CardDescription className="text-slate-300">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-slate-300"><span className="font-semibold text-slate-100">Best for:</span> {project.bestFor}</p>
                  {project.disabled ? (
                    <Button disabled className="rounded-full">{project.cta}</Button>
                  ) : project.external ? (
                    <a href={project.href} target="_blank" rel="noreferrer">
                      <Button
                        className="rounded-full bg-sky-400 text-slate-900 hover:bg-sky-300"
                        onClick={() => posthog?.capture("ecosystem_cta_clicked", { project: project.key, cta: project.cta })}
                      >
                        {project.cta}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  ) : (
                    <Link href={project.href}>
                      <Button
                        className="rounded-full bg-teal-400 text-slate-900 hover:bg-teal-300"
                        onClick={() => posthog?.capture("ecosystem_cta_clicked", { project: project.key, cta: project.cta })}
                      >
                        {project.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="flow" className="px-6 py-14">
        <div className="mx-auto max-w-7xl rounded-3xl border border-slate-700 bg-slate-900/70 p-8 md:p-12">
          <h3 className="text-3xl font-black md:text-4xl">Web Client Flow</h3>
          <p className="mt-4 max-w-3xl text-slate-300">
            Enter Home Base, deploy structures, classify anomalies, and progress through mission loops. Notifications and surveys trigger after meaningful engagement.
          </p>
          <div className="mt-8">
            <Link href="/auth">
              <Button size="lg" className="rounded-full bg-teal-400 text-slate-900 hover:bg-teal-300">
                Launch
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-slate-400 md:flex-row">
          <p>© 2026 Star Sailors</p>
          <div className="flex items-center gap-4">
            <a href="/terms" className="hover:text-slate-200">Terms</a>
            <a href="/privacy" className="hover:text-slate-200">Privacy</a>
            <a href="https://github.com/signal-k/client" className="hover:text-slate-200">Codebase</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
