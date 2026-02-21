"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Progress } from "@/src/components/ui/progress";
import { Sun, Shield, Rocket } from "lucide-react";

interface SolarTabProps {
  onExpandedChange?: (expanded: boolean) => void;
}

const PROBE_TARGET = 10;

export default function SolarTab({ onExpandedChange }: SolarTabProps = {}) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [eventId, setEventId] = useState<number | null>(null);
  const [probesLaunched, setProbesLaunched] = useState(0);
  const [message, setMessage] = useState("");

  function toggleExpanded() {
    const next = !expanded;
    setExpanded(next);
    onExpandedChange?.(next);
  }

  const weekRange = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() - now.getUTCDay());
    weekStart.setUTCHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 7);
    return { weekStart, weekEnd };
  }, []);

  async function ensureWeeklyEvent() {
    setBusy(true);
    setMessage("");

    try {
      const res = await fetch("/api/gameplay/solar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ensure_event",
          weekStart: weekRange.weekStart.toISOString(),
          weekEnd: weekRange.weekEnd.toISOString(),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || "Failed to prepare solar event");

      const id = Number(payload?.id);
      if (Number.isFinite(id)) {
        setEventId(id);
      }
      setMessage("Weekly solar event prepared.");
    } catch (error: any) {
      setMessage(error?.message || "Solar action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function launchProbe() {
    if (!eventId) {
      setMessage("Prepare the weekly event first.");
      return;
    }

    setLaunching(true);
    setMessage("");

    try {
      const res = await fetch("/api/gameplay/solar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "launch_probe", eventId, count: 1 }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || "Failed to launch probe");
      setProbesLaunched((prev) => prev + 1);
      setMessage("Probe launched.");
    } catch (error: any) {
      setMessage(error?.message || "Probe launch failed.");
    } finally {
      setLaunching(false);
    }
  }

  async function markDefended() {
    if (!eventId) {
      setMessage("Prepare the weekly event first.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/gameplay/solar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_defended", eventId }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || "Failed to mark defended");
      setMessage("Solar region marked defended.");
    } catch (error: any) {
      setMessage(error?.message || "Update failed.");
    } finally {
      setBusy(false);
    }
  }

  const progressPercent = Math.min(100, (probesLaunched / PROBE_TARGET) * 100);

  return (
    <div className="rounded-xl border border-orange-300/20 bg-gradient-to-br from-[#2a1306] via-[#1b1324] to-[#0a172d] p-4 text-white">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sun className="h-5 w-5 text-orange-300" />
          <h3 className="text-lg font-semibold">Solar Defense</h3>
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-200">
            Weekly
          </Badge>
        </div>
        <Button variant="outline" onClick={toggleExpanded}>
          {expanded ? "Collapse" : "Expand"}
        </Button>
      </div>

      {expanded ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-white/70">
            Coordinate probe launches to stabilize this week&apos;s solar front.
          </p>

          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="mb-2 flex items-center justify-between text-xs text-white/80">
              <span>Community Probe Threshold</span>
              <span>
                {probesLaunched}/{PROBE_TARGET}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button onClick={ensureWeeklyEvent} disabled={busy} className="gap-2">
              <Shield className="h-4 w-4" />
              {busy ? "Preparing..." : "Prepare Event"}
            </Button>
            <Button onClick={launchProbe} disabled={launching || !eventId} variant="secondary" className="gap-2">
              <Rocket className="h-4 w-4" />
              {launching ? "Launching..." : "Launch Probe"}
            </Button>
            <Button onClick={markDefended} disabled={busy || !eventId} variant="outline">
              Mark Defended
            </Button>
          </div>

          <div className="text-xs text-white/60">
            Window: {weekRange.weekStart.toUTCString()} - {weekRange.weekEnd.toUTCString()}
          </div>

          {message ? <p className="text-sm text-cyan-200">{message}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
