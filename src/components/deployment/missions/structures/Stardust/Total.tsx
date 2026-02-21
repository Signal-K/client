import { useEffect, useState, forwardRef, useImperativeHandle } from "react";

interface TotalPointsProps {
  onPointsUpdate?: (totalPoints: number) => void;
  onExport?: (points: {
    planetHuntersPoints: number;
    dailyMinorPlanetPoints: number;
    ai4mPoints: number;
    planetFourPoints: number;
    jvhPoints: number;
    cloudspottingPoints: number;
    planktonPoints: number;
    milestonePoints: number;
    totalPoints: number;
  }) => void;
  type?: string;
}

interface TotalPointsHandle {
  refreshPoints: () => Promise<void>;
  planetHuntersPoints: number;
  dailyMinorPlanetPoints: number;
  ai4mPoints: number;
  planetFourPoints: number;
  jvhPoints: number;
  planktonPoints: number;
  cloudspottingPoints: number;
  milestonePoints: number;
  researchedPenalty: number;
  totalPoints: number;
}

type TotalsState = {
  planetHuntersPoints: number;
  dailyMinorPlanetPoints: number;
  ai4mPoints: number;
  planetFourPoints: number;
  jvhPoints: number;
  cloudspottingPoints: number;
  planktonPoints: number;
  milestonePoints: number;
  researchedPenalty: number;
  referralPoints: number;
};

const quantityUpgrades = new Set(["probereceptors", "satellitecount", "roverwaypoints"]);

const initialTotals: TotalsState = {
  planetHuntersPoints: 0,
  dailyMinorPlanetPoints: 0,
  ai4mPoints: 0,
  planetFourPoints: 0,
  jvhPoints: 0,
  cloudspottingPoints: 0,
  planktonPoints: 0,
  milestonePoints: 0,
  researchedPenalty: 0,
  referralPoints: 0,
};

function computeTotalPoints(totals: TotalsState) {
  return (
    totals.planetHuntersPoints +
    totals.dailyMinorPlanetPoints +
    totals.ai4mPoints +
    totals.planetFourPoints +
    totals.jvhPoints +
    totals.cloudspottingPoints +
    totals.referralPoints +
    totals.planktonPoints +
    totals.milestonePoints -
    totals.researchedPenalty
  );
}

const TotalPoints = forwardRef<TotalPointsHandle, TotalPointsProps>((props, ref) => {
  const { onPointsUpdate, onExport, type } = props;
  const [loading, setLoading] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [totals, setTotals] = useState<TotalsState>(initialTotals);

  const fetchAllPoints = async () => {
    setLoading(true);

    try {
      const summaryRes = await fetch("/api/gameplay/research/summary");
      const summaryPayload = await summaryRes.json();
      if (!summaryRes.ok) {
        throw new Error(summaryPayload?.error || "Failed to load research summary");
      }

      const counts = summaryPayload?.counts || {};
      const researchedTechTypes: string[] = Array.isArray(summaryPayload?.researchedTechTypes)
        ? summaryPayload.researchedTechTypes
        : [];

      const researchedPenalty = researchedTechTypes.reduce(
        (sum, tech) => sum + (quantityUpgrades.has(tech) ? 10 : 2),
        0
      );

      const nextTotals: TotalsState = {
        planetHuntersPoints: Number(counts?.planet || 0) * 2,
        dailyMinorPlanetPoints: Number(counts?.asteroid || 0) * 2,
        ai4mPoints: 0,
        planetFourPoints: 0,
        jvhPoints: 0,
        cloudspottingPoints: Number(counts?.cloud || 0),
        planktonPoints: 0,
        milestonePoints: 0,
        researchedPenalty,
        referralPoints: Number(summaryPayload?.referralBonus || 0),
      };

      setTotals(nextTotals);
      const totalPoints = computeTotalPoints(nextTotals);
      onPointsUpdate?.(totalPoints);
      onExport?.({
        planetHuntersPoints: nextTotals.planetHuntersPoints,
        dailyMinorPlanetPoints: nextTotals.dailyMinorPlanetPoints,
        ai4mPoints: nextTotals.ai4mPoints,
        planetFourPoints: nextTotals.planetFourPoints,
        jvhPoints: nextTotals.jvhPoints,
        cloudspottingPoints: nextTotals.cloudspottingPoints,
        planktonPoints: nextTotals.planktonPoints,
        milestonePoints: nextTotals.milestonePoints,
        totalPoints,
      });
    } catch {
      setTotals(initialTotals);
      onPointsUpdate?.(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAllPoints();
  }, []);

  const totalPoints = computeTotalPoints(totals);

  useImperativeHandle(ref, () => ({
    refreshPoints: fetchAllPoints,
    planetHuntersPoints: totals.planetHuntersPoints,
    dailyMinorPlanetPoints: totals.dailyMinorPlanetPoints,
    ai4mPoints: totals.ai4mPoints,
    planetFourPoints: totals.planetFourPoints,
    jvhPoints: totals.jvhPoints,
    planktonPoints: totals.planktonPoints,
    cloudspottingPoints: totals.cloudspottingPoints,
    milestonePoints: totals.milestonePoints,
    researchedPenalty: totals.researchedPenalty,
    totalPoints,
  }));

  if (loading) {
    return <h1 className="text-md">Loading...</h1>;
  }

  if (type === "ai4mPoints") return <span>{totals.ai4mPoints}</span>;
  if (type === "planetHuntersPoints") return <span>{totals.planetHuntersPoints}</span>;
  if (type === "dailyMinorPlanetPoints") return <span>{totals.dailyMinorPlanetPoints}</span>;
  if (type === "planetFourPoints") return <span>{totals.planetFourPoints}</span>;
  if (type === "jvhPoints") return <span>{totals.jvhPoints}</span>;
  if (type === "cloudspottingPoints") return <span>{totals.cloudspottingPoints}</span>;
  if (type === "planktonPoints") return <span>{totals.planktonPoints}</span>;
  if (type === "milestonePoints") return <span>{totals.milestonePoints}</span>;
  if (type === "researchedPenalty") return <span>{totals.researchedPenalty}</span>;

  return (
    <div
      className="cursor-pointer"
      onClick={() => setShowBreakdown((prev) => !prev)}
      aria-label="Toggle points breakdown"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setShowBreakdown((p) => !p);
      }}
    >
      <div className="text-lg font-bold">{totalPoints}</div>
      {showBreakdown && (
        <div className="text-sm mt-2 space-y-1">
          <div>🪐 Planet Hunters: {totals.planetHuntersPoints}</div>
          <div>📷 Daily Minor Planets: {totals.dailyMinorPlanetPoints}</div>
          <div>🤖 AI4Mars: {totals.ai4mPoints}</div>
          <div>🛰️ Planet Four: {totals.planetFourPoints}</div>
          <div>🌪️ Jovian Vortex Hunter: {totals.jvhPoints}</div>
          <div>☁️ Cloudspotting: {totals.cloudspottingPoints}</div>
          <div>🌊 Plankton: {totals.planktonPoints}</div>
          <div>🎯 Milestones: {totals.milestonePoints}</div>
          <div>🎁 Referrals: {totals.referralPoints}</div>
          <div>❌ Researched Penalty: -{totals.researchedPenalty}</div>
        </div>
      )}
    </div>
  );
});

TotalPoints.displayName = "TotalPoints";

export default TotalPoints;

