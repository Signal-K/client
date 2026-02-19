import type { DatabaseAnomaly } from "./TelescopeUtils"
import type { Anomaly, Star } from "@/types/Structures/telescope"
import { seededRandom1 } from "./TelescopeUtils"
import { generateStars } from "@/src/components/classification/telescope/utils/sector-utils"

export async function fetchAnomalies(deploymentType: string | null, setTessAnomalies: (a: DatabaseAnomaly[]) => void) {
  try {
    if (deploymentType !== "stellar" && deploymentType !== "planetary") {
      return;
    }

    const response = await fetch(
      `/api/gameplay/deploy/telescope?action=anomalies&deploymentType=${deploymentType}`,
      { cache: "no-store" }
    );
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      console.error("Error fetching anomalies:", payload?.error || response.statusText);
      return;
    }

    setTessAnomalies((payload?.anomalies || []) as DatabaseAnomaly[]);
  } catch (err) {
    console.error("Unexpected error in fetchAnomalies: ", err);
  }
}

export async function checkDeployment(
  setAlreadyDeployed: (b: boolean) => void,
  setDeploymentMessage: (m: string | null) => void
) {
  const response = await fetch("/api/gameplay/deploy/telescope?action=status", { cache: "no-store" });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("Error fetching deployment status:", payload?.error || response.statusText);
    return;
  }
  setAlreadyDeployed(Boolean(payload?.alreadyDeployed));
  setDeploymentMessage(payload?.deploymentMessage ?? null);
}

export function loadSector(x: number, y: number, tessAnomalies: DatabaseAnomaly[], setStars: (s: Star[]) => void, setSectorAnomalies: (a: Anomaly[]) => void, generateAnomalyFromDB: (db: DatabaseAnomaly, sx: number, sy: number) => Anomaly) {
  setStars(generateStars(x, y))
  const seed = x * 1000 + y
  const candidates = tessAnomalies
    .filter((_, i) => Math.floor(seededRandom1(seed + i) * 10) < 3)
    .slice(0, 8)
    .map(a => generateAnomalyFromDB(a, x, y))
  setSectorAnomalies(candidates)
}

export async function fetchSkillProgress(setSkillProgress: (s: { [k:string]: number }) => void) {
  const response = await fetch("/api/gameplay/deploy/telescope?action=skill-progress", { cache: "no-store" });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    console.error("Error fetching skill progress:", payload?.error || response.statusText);
    return;
  }
  setSkillProgress(payload?.skillProgress || { telescope: 0, weather: 0 });
}

type HandleDeployParams = {
  userId?: string | null
  selectedSector: { x:number; y:number } | null
  deploymentType: string | null
  tessAnomalies: DatabaseAnomaly[]
  setDeploying: (b: boolean) => void
  setDeploymentResult: (r: { anomalies: string[]; sectorName: string } | null) => void
  setShowConfirmation: (b: boolean) => void
  setDeploymentMessage: (m: string | null) => void
  setAlreadyDeployed: (b: boolean) => void
  generateSectorName: (x:number,y:number)=>string
}

export async function handleDeployAction(params: HandleDeployParams) {
  const { userId, selectedSector, deploymentType, tessAnomalies, setDeploying, setDeploymentResult, setShowConfirmation, setDeploymentMessage, setAlreadyDeployed, generateSectorName } = params

  if (!selectedSector) return

  setDeploying(true)
  const seed = selectedSector.x * 1000 + selectedSector.y

  let anomalyCount = 4
  try {
    const progressRes = await fetch("/api/gameplay/research/summary", { cache: "no-store" });
    const progressPayload = await progressRes.json().catch(() => null);
    if (progressRes.ok && (progressPayload?.researched || []).some((r: any) => r.tech_type === "probereceptors")) {
      anomalyCount = 6;
    }
  } catch (error) {
    console.warn("Could not resolve upgrade status for deployment", error);
  }
  anomalyCount = Math.min(anomalyCount, 6)

  let selectedAnomalies: DatabaseAnomaly[] = []

  if (deploymentType === "stellar") {
    const diskDetectiveObjects = tessAnomalies.filter(a => a.anomalySet === 'diskDetective')
    const superwaspObjects = tessAnomalies.filter(a => a.anomalySet === 'superwasp-variable' || a.anomalySet === 'telescope-superwasp-variable')

    const shuffleAndPick = (arr: DatabaseAnomaly[], count: number) => {
      if (arr.length === 0) return []
      const safeCount = Math.min(count, 6, arr.length)
      return arr.map((item, i) => ({ item, r: seededRandom1(seed, i) })).sort((a,b)=>a.r-b.r).slice(0,safeCount).map(o=>o.item)
    }

    if (diskDetectiveObjects.length > 0 && superwaspObjects.length > 0) {
      const diskPick = shuffleAndPick(diskDetectiveObjects, Math.ceil(anomalyCount / 2))
      const superwaspPick = shuffleAndPick(superwaspObjects, Math.ceil(anomalyCount / 2))
      const remainingPool = [...diskDetectiveObjects, ...superwaspObjects].filter(a => !diskPick.includes(a) && !superwaspPick.includes(a))
      const remaining = shuffleAndPick(remainingPool, anomalyCount - diskPick.length - superwaspPick.length)
      selectedAnomalies = [...diskPick, ...superwaspPick, ...remaining]
    } else {
      const all = [...diskDetectiveObjects, ...superwaspObjects]
      selectedAnomalies = shuffleAndPick(all, anomalyCount)
    }
    selectedAnomalies = selectedAnomalies.slice(0, Math.min(anomalyCount, 6))
  } else if (deploymentType === "planetary") {
    const planets = tessAnomalies.filter(a => a.anomalySet === 'telescope-tess')
    const asteroids = tessAnomalies.filter(a => a.anomalySet === 'telescope-minorPlanet')
    const activeAsteroids = tessAnomalies.filter(a => a.anomalySet === 'active-asteroids')

    const shuffleAndPick = (arr: DatabaseAnomaly[], count: number) => {
      if (arr.length === 0) return []
      const safeCount = Math.min(count, 6, arr.length)
      return arr.map((item,i)=>({item,r:seededRandom1(seed,i)})).sort((a,b)=>a.r-b.r).slice(0,safeCount).map(o=>o.item)
    }

    if (activeAsteroids.length > 0) {
      const planetPick = shuffleAndPick(planets, Math.ceil(anomalyCount / 3))
      const asteroidPick = shuffleAndPick(asteroids, Math.ceil(anomalyCount / 3))
      const activeAsteroidPick = shuffleAndPick(activeAsteroids, Math.ceil(anomalyCount / 3))
      const remainingPool = [...planets, ...asteroids, ...activeAsteroids].filter(a => !planetPick.includes(a) && !asteroidPick.includes(a) && !activeAsteroidPick.includes(a))
      const remaining = shuffleAndPick(remainingPool, anomalyCount - planetPick.length - asteroidPick.length - activeAsteroidPick.length)
      selectedAnomalies = [...planetPick, ...asteroidPick, ...activeAsteroidPick, ...remaining]
    } else if (asteroids.length > 0) {
      const planetPick = shuffleAndPick(planets, Math.ceil(anomalyCount / 2))
      const asteroidPick = shuffleAndPick(asteroids, Math.ceil(anomalyCount / 2))
      const remainingPool = [...planets, ...asteroids].filter(a => !planetPick.includes(a) && !asteroidPick.includes(a))
      const remaining = shuffleAndPick(remainingPool, anomalyCount - planetPick.length - asteroidPick.length)
      selectedAnomalies = [...planetPick, ...asteroidPick, ...remaining]
    } else {
      selectedAnomalies = shuffleAndPick(planets, anomalyCount)
    }
  }

  if (selectedAnomalies.length === 0) {
    setDeploymentMessage("No anomalies found in selected sector")
    setDeploying(false)
    return
  }

  if (selectedAnomalies.length > 6) selectedAnomalies = selectedAnomalies.slice(0,6)
  if (selectedAnomalies.length > anomalyCount) selectedAnomalies = selectedAnomalies.slice(0, anomalyCount)

  let hasError = false;
  const deployResponse = await fetch("/api/gameplay/deploy/telescope", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deploymentType,
      anomalyIds: selectedAnomalies.map((anomaly) => Number(anomaly.id)).filter((id) => Number.isFinite(id)),
    }),
  });
  if (!deployResponse.ok) {
    hasError = true;
  }

  if (!hasError) {
    const anomalyNames = selectedAnomalies.map(a => a.content || `${deploymentType === "stellar" ? "DSK" : "TESS"}-${String(a.id).padStart(3, "0")}`)
    const sectorName = generateSectorName(selectedSector!.x, selectedSector!.y)
    setDeploymentResult({ anomalies: anomalyNames, sectorName })
    try {
      const notificationTitle = "Telescope Deployed Successfully"
      const targetType = deploymentType === "stellar" ? "stellar objects" : "exoplanet candidates"
      const notificationBody = `${selectedAnomalies.length} ${targetType} discovered in ${sectorName}`
      if (userId) {
        await fetch('/api/notify-my-discoveries', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, customMessage: { title: notificationTitle, body: notificationBody, url: '/structures/telescope' } })
        })
      }
    } catch (e) { console.error('Failed to send deployment notification:', e) }
    setShowConfirmation(true)
  }

  setDeploymentMessage(hasError ? "Error deploying telescope. Please try again." : `Telescope deployed! ${selectedAnomalies.length} ${deploymentType} targets are now active.`)
  setAlreadyDeployed(!hasError)
  setDeploying(false)
}

// small helper used internally
function generateSectorName(x:number,y:number){
  return `${x},${y}`
}
