import type { DatabaseAnomaly } from "./TelescopeUtils"
import type { Anomaly, Star } from "@/types/Structures/telescope"
import { seededRandom1 } from "./TelescopeUtils"
import { generateStars } from "@/src/components/classification/telescope/utils/sector-utils"

export async function fetchAnomalies(supabase: any, deploymentType: string | null, session: any, setTessAnomalies: (a: DatabaseAnomaly[]) => void) {
  try {
    let setsToFetch: string[] = [];
    if (deploymentType === "stellar") {
      setsToFetch = ['diskDetective', 'superwasp-variable', 'telescope-superwasp-variable'];
    } else if (deploymentType === "planetary") {
      setsToFetch = ['telescope-tess', 'telescope-minorPlanet'];
      
      // Check for active asteroids unlock
      let includeActiveAsteroids = false;
      if (session?.user?.id) {
        const { count, error: countError } = await supabase
          .from("classifications")
          .select("id", { count: "exact", head: true })
          .eq("author", session.user.id)
          .eq("classificationtype", "telescope-minorPlanet");
        if (!countError && typeof count === 'number' && count >= 2) {
          includeActiveAsteroids = true;
        }
      }
      if (includeActiveAsteroids) setsToFetch.push('active-asteroids');
      
      // Check for NGTS access unlock
      let includeNGTS = false;
      if (session?.user?.id) {
        const { data: ngtsData, error: ngtsError } = await supabase
          .from("researched")
          .select("tech_type")
          .eq("user_id", session.user.id)
          .eq("tech_type", "ngtsAccess")
          .single();
        
        if (!ngtsError && ngtsData) {
          includeNGTS = true;
        }
      }
      if (includeNGTS) setsToFetch.push('telescope-ngts');
    } else {
      return;
    }

    const { data, error } = await supabase
      .from("anomalies")
      .select("*")
      .in("anomalySet", setsToFetch);

    if (error) {
      console.error("Error fetching anomalies: ", error);
      return;
    }

    if (data) {
      // fetched anomalies by set
      setTessAnomalies(data as DatabaseAnomaly[]);
    }
  } catch (err) {
    console.error("Unexpected error in fetchAnomalies: ", err);
  }
}

export async function checkDeployment(supabase: any, session: any, setAlreadyDeployed: (b: boolean) => void, setDeploymentMessage: (m: string | null) => void) {
  if (!session?.user?.id) return
  const userId = session.user.id
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const { data: linkedAnomalies, error: linkedAnomaliesError } = await supabase
    .from("linked_anomalies")
    .select("*")
    .eq("automaton", "Telescope")
    .eq("author", userId)
    .gte("date", oneWeekAgo.toISOString())

  if (linkedAnomaliesError) {
    console.error("Error fetching linked anomalies:", linkedAnomaliesError)
    return
  }

  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select("id, classification_id, classification:classifications(author)")
    .eq("author", userId)
    .gte("created_at", oneWeekAgo.toISOString())

  if (commentsError) {
    console.error("Error fetching comments:", commentsError)
    return
  }

  const validComments = (comments || []).filter((c: any) => c.classification?.author && c.classification.author !== userId)

  const { data: votes, error: votesError } = await supabase
    .from("votes")
    .select("id, classification_id, classification:classifications(author)")
    .eq("user_id", userId)
    .eq("vote_type", "up")
    .gte("created_at", oneWeekAgo.toISOString())

  if (votesError) {
    console.error("Error fetching votes:", votesError)
    return
  }

  const validVotes = (votes || []).filter((v: any) => v.classification?.author && v.classification.author !== userId)

  const linkedCount = linkedAnomalies?.length ?? 0
  const commentsCount = validComments.length
  const votesCount = validVotes.length
  const additionalDeploys = Math.floor(votesCount / 3) + commentsCount
  const totalAllowedDeploys = linkedCount + additionalDeploys
  const userCanRedeploy = totalAllowedDeploys > linkedCount

  // deployment counts computed: linkedCount/commentsCount/votesCount/totalAllowedDeploys

  if (linkedCount === 0) {
    setAlreadyDeployed(false)
    setDeploymentMessage(null)
  } else if (userCanRedeploy) {
    setAlreadyDeployed(false)
    setDeploymentMessage("You have earned additional deploys by interacting with the community this week!")
  } else {
    setAlreadyDeployed(true)
    setDeploymentMessage("Telescope has already been deployed this week. Recalibrate & search again next week.")
  }
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

export async function fetchSkillProgress(supabase: any, session: any, setSkillProgress: (s: { [k:string]: number }) => void) {
  if (!session) return
  const skillCounts: { [key: string]: number} = { telescope: 0, weather: 0 }
  const start = new Date("2000-01-01").toISOString()

  const queries = [
    supabase
      .from("classifications")
      .select("*", { count: "exact" })
      .eq("author", session.user.id)
      .in("classificationtype", ["planet", "telescope-minorPlanet"])
      .gte("created_at", start),
    supabase
      .from("classifications")
      .select("*", { count: "exact" })
      .eq("author", session.user.id)
      .in("classificationtype", ["cloud", "lidar-jovianVortexHunter"])
      .gte("created_at", start),
  ]

  const [telescopeRes, weatherRes] = await Promise.all(queries)
  if (!telescopeRes.error && telescopeRes.count !== null) skillCounts.telescope = telescopeRes.count
  if (!weatherRes.error && weatherRes.count !== null) skillCounts.weather = weatherRes.count
  setSkillProgress(skillCounts)
}

type HandleDeployParams = {
  supabase: any
  session: any
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
  const { supabase, session, selectedSector, deploymentType, tessAnomalies, setDeploying, setDeploymentResult, setShowConfirmation, setDeploymentMessage, setAlreadyDeployed, generateSectorName } = params

  if (!session || !selectedSector) return

  setDeploying(true)
  const seed = selectedSector.x * 1000 + selectedSector.y

  let anomalyCount = 4
  if (session?.user?.id) {
    const { data: researched } = await supabase
      .from("researched")
      .select("tech_type")
      .eq("user_id", session.user.id)
      .eq("tech_type", "probereceptors")
    if (researched && researched.length > 0) {
      anomalyCount = 6
      // telescope upgrade detected
    }
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

  const inserts = selectedAnomalies.map(anomaly => supabase.from("linked_anomalies").insert({ author: session.user.id, anomaly_id: anomaly.id, classification_id: null, automaton: "Telescope" }))
  const results = await Promise.all(inserts)
  const hasError = results.some((r:any)=>r.error)

  if (!hasError) {
    const anomalyNames = selectedAnomalies.map(a => a.content || `${deploymentType === "stellar" ? "DSK" : "TESS"}-${String(a.id).padStart(3, "0")}`)
    const sectorName = generateSectorName(selectedSector!.x, selectedSector!.y)
    setDeploymentResult({ anomalies: anomalyNames, sectorName })
    try {
      const notificationTitle = "Telescope Deployed Successfully"
      const targetType = deploymentType === "stellar" ? "stellar objects" : "exoplanet candidates"
      const notificationBody = `${selectedAnomalies.length} ${targetType} discovered in ${sectorName}`
      await fetch('/api/notify-my-discoveries', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, customMessage: { title: notificationTitle, body: notificationBody, url: '/structures/telescope' } })
      })
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
