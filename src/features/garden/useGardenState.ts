"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CATALOG,
  growthFor,
  hopById,
  structureById,
  type HopDef,
  type MinigameDef,
  type StructureId,
} from "./catalog";

const STORAGE_KEY = "ssc.garden.v1";
const HYDRO_TICK_MS = 14000;
const FLIGHT_TICK_MS = 500;
const TOAST_MS = 2400;

export interface StructureRecord {
  tier: number;
  locked: boolean;
  tendedAt: number;
  ready: boolean;
  readyAt: number;
}

export interface FlightRecord {
  status: "away" | "home";
  sentAt: number;
  eta: number;
}

export interface GardenState {
  credits: number;
  structures: Record<StructureId, StructureRecord>;
  flights: Partial<Record<StructureId, FlightRecord>>;
  hydroTick: number;
}

function defaultState(): GardenState {
  const structures = {} as Record<StructureId, StructureRecord>;
  for (const s of CATALOG.structures) {
    structures[s.id] = {
      tier: s.locked ? 0 : s.startTier,
      locked: !!s.locked,
      tendedAt: 0,
      ready: !s.locked && !!s.minigame,
      readyAt: 0,
    };
  }
  return {
    credits: 80,
    structures,
    flights: {},
    hydroTick: Date.now(),
  };
}

function loadState(): GardenState {
  const base = defaultState();
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    return {
      ...base,
      ...parsed,
      structures: { ...base.structures, ...(parsed.structures || {}) },
      flights: parsed.flights || {},
    };
  } catch {
    return base;
  }
}

function saveState(state: GardenState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useGardenState() {
  const [state, setState] = useState<GardenState>(() => defaultState());
  const [hydrated, setHydrated] = useState(false);
  const [openPanelId, setOpenPanelId] = useState<StructureId | null>(null);
  const [openMinigame, setOpenMinigame] = useState<MinigameDef | null>(null);
  const [probeGrainOpen, setProbeGrainOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Load persisted state on mount (client-only; avoids SSR/localStorage mismatch).
  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  const pushToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const addCredits = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, credits: prev.credits + amount }));
  }, []);

  // ---- flight / hydro / readiness ticking ----
  useEffect(() => {
    if (!hydrated) return;
    const id = setInterval(() => {
      const now = Date.now();
      setState((prev) => {
        let dirty = false;
        const structures = { ...prev.structures };
        const flights = { ...prev.flights };

        for (const [sid, flight] of Object.entries(flights) as [StructureId, FlightRecord][]) {
          if (flight.status === "away" && now >= flight.eta) {
            flights[sid] = { ...flight, status: "home" };
            structures[sid] = { ...structures[sid], ready: true };
            dirty = true;
          }
        }

        const hydro = structures["ssc.structure.hydro"];
        const habitat = structures["ssc.structure.habitat"];
        let credits = prev.credits;
        let hydroTick = prev.hydroTick;
        if (hydro?.tendedAt && now - prev.hydroTick > HYDRO_TICK_MS) {
          hydroTick = now;
          const bonusStage = growthFor(structureById("ssc.structure.habitat"), habitat?.tier || 1);
          const idleBonus = (bonusStage?.capacity.idleBonus as number | undefined) || 0;
          credits += 1 * hydro.tier + idleBonus;
          dirty = true;
        }

        for (const s of CATALOG.structures) {
          const rec = structures[s.id];
          if (!rec || rec.locked || rec.ready || !s.minigame) continue;
          if (flights[s.id]) continue;
          if (rec.readyAt && now >= rec.readyAt) {
            structures[s.id] = { ...rec, ready: true, readyAt: 0 };
            dirty = true;
          }
        }

        if (!dirty) return prev;
        return { ...prev, structures, flights, credits, hydroTick };
      });
    }, FLIGHT_TICK_MS);
    return () => clearInterval(id);
  }, [hydrated]);

  const openPanel = useCallback((id: StructureId) => setOpenPanelId(id), []);
  const closePanel = useCallback(() => setOpenPanelId(null), []);

  const tendHydro = useCallback(() => {
    setState((prev) => {
      const rec = prev.structures["ssc.structure.hydro"];
      const structures = {
        ...prev.structures,
        "ssc.structure.hydro": { ...rec, tendedAt: Date.now(), ready: false },
      };
      return { ...prev, structures, credits: prev.credits + 4 + rec.tier };
    });
    pushToast("Garden watered. Credits will tick while you are away.");
    closePanel();
  }, [closePanel, pushToast]);

  const sitHabitat = useCallback(() => {
    pushToast("Home. The garden is the game.");
    closePanel();
  }, [closePanel, pushToast]);

  const upgrade = useCallback((id: StructureId) => {
    const def = structureById(id);
    if (!def) return;
    setState((prev) => {
      const rec = prev.structures[id];
      const next = rec.tier + 1;
      if (next > CATALOG.upgrade.maxTier) return prev;
      const cost = CATALOG.upgrade.costs[next - 1];
      if (prev.credits < cost) {
        pushToast(`Need ${cost} CR.`);
        return prev;
      }
      pushToast(`${def.name} is T${next}.`);
      return {
        ...prev,
        credits: prev.credits - cost,
        structures: { ...prev.structures, [id]: { ...rec, tier: next } },
      };
    });
  }, [pushToast]);

  const sendFlight = useCallback((structureId: StructureId, minigame: MinigameDef): boolean => {
    let ok = true;
    setState((prev) => {
      const rec = prev.structures[structureId];
      if (minigame.cost) {
        if (prev.credits < minigame.cost) {
          ok = false;
          return prev;
        }
      }
      const wait = Math.max(6000, (minigame.flightMs || 12000) - rec.tier * 1500);
      return {
        ...prev,
        credits: prev.credits - (minigame.cost || 0),
        structures: { ...prev.structures, [structureId]: { ...rec, ready: false } },
        flights: {
          ...prev.flights,
          [structureId]: { status: "away", sentAt: Date.now(), eta: Date.now() + wait },
        },
      };
    });
    if (!ok) {
      pushToast(`Need ${minigame.cost} CR to send.`);
      return false;
    }
    pushToast("Sent. Come back when it is a speck on the sky.");
    return true;
  }, [pushToast]);

  const collectFlight = useCallback((id: StructureId) => {
    const def = structureById(id);
    if (!def || !def.minigame) return;
    const mgDef = CATALOG.minigames[def.minigame];
    let reward = 0;
    setState((prev) => {
      const rec = prev.structures[id];
      const stage = growthFor(def, rec.tier);
      const flights = { ...prev.flights };
      delete flights[id];
      const bonus = 4 * rec.tier;
      reward = mgDef.reward + bonus;
      return {
        ...prev,
        credits: prev.credits + reward,
        flights,
        structures: {
          ...prev.structures,
          [id]: { ...rec, ready: false, readyAt: Date.now() + (stage?.readyMs || 20000) },
        },
      };
    });
    pushToast(`It's home. +${reward} CR on the dirt.`);
    closePanel();
    if (id === "ssc.structure.probe") {
      setProbeGrainOpen(true);
    }
  }, [closePanel, pushToast]);

  // Real citizen-science structures (telescope/satellite/solar) mount their real,
  // full-production classify component in the sky band. There is no pass/fail signal
  // from those components, so the reward is granted when the player finishes engaging
  // with the instrument and closes the sky-classify overlay.
  const completeSkyClassify = useCallback((structureId: StructureId) => {
    const def = structureById(structureId);
    if (!def) return;
    setState((prev) => {
      const rec = prev.structures[structureId];
      const stage = growthFor(def, rec.tier);
      const reward = CATALOG.minigames[def.minigame!].reward + rec.tier;
      return {
        ...prev,
        credits: prev.credits + reward,
        structures: {
          ...prev.structures,
          [structureId]: {
            ...rec,
            ready: false,
            tendedAt: Date.now(),
            readyAt: Date.now() + (stage?.readyMs || 20000),
          },
        },
      };
    });
    pushToast("Noted. The instrument can sit.");
  }, [pushToast]);

  const startMinigame = useCallback((mgDef: MinigameDef) => {
    closePanel();
    if (mgDef.deferred) {
      pushToast("Rover is a later session.");
      return;
    }
    setOpenMinigame(mgDef);
  }, [closePanel, pushToast]);

  const closeMinigame = useCallback(() => {
    setOpenMinigame(null);
  }, []);

  const closeProbeGrain = useCallback(() => setProbeGrainOpen(false), []);

  const hopOut = useCallback((hop: HopDef) => {
    pushToast(`Leaving the garden for ${hop.label.replace("Open ", "")}.`);
    if (typeof window !== "undefined") {
      window.open(hop.href, "_blank", "noopener");
    }
  }, [pushToast]);

  return {
    state,
    hydrated,
    openPanelId,
    openPanel,
    closePanel,
    openMinigame,
    startMinigame,
    closeMinigame,
    completeSkyClassify,
    probeGrainOpen,
    closeProbeGrain,
    toast,
    pushToast,
    tendHydro,
    sitHabitat,
    upgrade,
    sendFlight,
    collectFlight,
    addCredits,
    hopOut,
    hopById,
    structureById,
    growthFor,
  };
}
