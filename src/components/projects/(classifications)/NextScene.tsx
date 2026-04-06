"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import { SourceClassificationCallout } from "@/src/components/classifications/SourceClassificationCallout";
import { MediaSlider } from "@/src/components/classifications/MediaSlider";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";
import { TelescopeBackground } from "@/src/components/classification/telescope/telescope-background";

// Extracted Result Components
import { DiskDetectiveResults } from "./results/DiskDetectiveResults";
import { DiskDetectiveSlideshow } from "./results/DiskDetectiveSlideshow";
import { MineralDepositCallout } from "./results/MineralDepositCallout";
import { MilestoneDisplay } from "./results/MilestoneDisplay";

type Props = {
  id: string;
};

const telescopeTypes = ["planet", "active-asteroid", "diskDetective", "telescope-minorPlanet"];
const balloonTypes = ["cloud", "lidar-jovianVortexHunter", "balloon-marsCloudShapes", "satellite-planetFour"];
const roverTypes = ["automaton-aiForMars"];

const projectMap: Record<string, string> = {
  planet: "planethunters",
  "active-asteroid": "asteroids",
  diskDetective: "diskdetective",
  "telescope-minorPlanet": "dailyminorplanet",
  sunspot: "sunspot",
  cloud: "cloudspotting",
  "lidar-jovianVortexHunter": "jvh",
  "balloon-marsCloudShapes": "cloudspotting-shapes",
  "automaton-aiForMars": "ai-for-mars",
  "satellite-planetFour": "planet-four",
};

const badgeColors = [
  "bg-red-100 text-red-800",
  "bg-green-100 text-green-800",
  "bg-blue-100 text-blue-800",
  "bg-yellow-100 text-yellow-800",
  "bg-purple-100 text-purple-800",
  "bg-pink-100 text-pink-800",
  "bg-indigo-100 text-indigo-800",
];

export default function ClientClassificationPage({ id }: Props) {
  const session = useSession();
  const router = useRouter();
  const { isDark, toggleDarkMode } = UseDarkMode();

  const [classification, setClassification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<any[] | null>(null);
  const [diskDetectiveImages, setDiskDetectiveImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [sourceClassificationMedia, setSourceClassificationMedia] = useState<string[]>([]);
  const [mineralDeposit, setMineralDeposit] = useState<any>(null);

  const fetchMineralDeposit = useCallback(async () => {
    try {
      const response = await fetch(`/api/gameplay/mineral-deposits?discovery=${id}`);
      const payload = await response.json();
      if (response.ok && payload?.deposits?.[0]) {
        setMineralDeposit(payload.deposits[0]);
      }
    } catch (error) {
      console.error("[NextScene] Mineral fetch error:", error);
    }
  }, [id]);

  const detectDiskDetectiveImages = async (anomalyId: number) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return [];
    const urls: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const url = `${supabaseUrl}/storage/v1/object/public/telescope/telescope-diskDetective/${anomalyId}/${i}.png`;
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (res.ok) urls.push(url); else break;
      } catch { break; }
    }
    return urls;
  };

  const checkMilestones = useCallback(async (type: string, date: string) => {
    try {
      const res = await fetch("/api/gameplay/milestones");
      const { playerMilestones } = await res.json();
      const week = playerMilestones.find((w: any) => {
        const start = new Date(w.weekStart);
        const end = new Date(start); end.setDate(start.getDate() + 7);
        const d = new Date(date);
        return d >= start && d < end;
      });
      if (!week) return setMilestones([]);
      const relevant = week.data?.filter((m: any) => m.table === "classifications" && m.value === type) || [];
      const statuses = await Promise.all(relevant.map(async (m: any) => {
        const start = new Date(week.weekStart);
        const end = new Date(start); end.setDate(start.getDate() + 7);
        const countRes = await fetch(`/api/gameplay/classifications/count?classificationtype=${encodeURIComponent(type)}&createdAtGte=${encodeURIComponent(start.toISOString())}&createdAtLt=${encodeURIComponent(end.toISOString())}`);
        const { count } = await countRes.json();
        const req = m.requiredCount ?? 5;
        return { name: m.name, requiredCount: req, currentCount: Number(count), achieved: Number(count) >= req };
      }));
      setMilestones(statuses);
    } catch { setMilestones([]); }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      fetchMineralDeposit();
      try {
        const res = await fetch(`/api/gameplay/classifications/${id}`);
        const { classification: data, sourceMedia } = await res.json();
        if (!data) return;
        setClassification(data);
        setSourceClassificationMedia(Array.isArray(sourceMedia) ? sourceMedia : []);
        if (data.classificationtype === "diskDetective" && data.anomaly) {
          setLoadingImages(true);
          setDiskDetectiveImages(await detectDiskDetectiveImages(data.anomaly));
          setLoadingImages(false);
        }
        if (session) checkMilestones(data.classificationtype, data.created_at);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    init();
  }, [id, session, fetchMineralDeposit, checkMilestones]);

  if (loading) return <div className="text-center mt-10 text-[#2E3440]">Loading...</div>;
  if (!classification) return null;

  const type = classification.classificationtype;
  const viewportUrl = telescopeTypes.includes(type) ? "/structures/telescope" : balloonTypes.includes(type) ? "/viewports/satellite" : roverTypes.includes(type) ? "/viewports/rover" : "/";
  
  const mediaUrl = Array.isArray(classification.media) ? classification.media.find((m: any) => Array.isArray(m) && typeof m[0] === "string" && m[0].startsWith("http"))?.[0] : undefined;
  const annotationBadges = Object.entries((classification?.classificationConfiguration?.annotationOptions ?? []).reduce((acc: any, l: string) => {
    const k = l.trim(); acc[k] = (acc[k] || 0) + 1; return acc;
  }, {})).map(([label, count], idx) => (
    <span key={label} className={`inline-block px-3 py-1 rounded-full text-xs font-medium mr-2 mb-2 ${badgeColors[idx % badgeColors.length]}`}>
      {count > 1 ? `${label} (${count})` : label}
    </span>
  ));

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <TelescopeBackground variant="stars-only" isDarkTheme={isDark} onAnomalyClick={() => {}} />
      </div>

      <MainHeader isDark={isDark} onThemeToggle={toggleDarkMode} notificationsOpen={false} onToggleNotifications={() => {}} activityFeed={[]} otherClassifications={[]} />

      <div className="flex items-center justify-center min-h-screen px-2 py-4 pt-24 sm:px-4 sm:py-8">
        <div className="bg-[#F8FAFC] rounded-2xl shadow-xl p-3 sm:p-6 max-w-4xl w-full border border-[#88C0D0] space-y-4 sm:space-y-6 max-h-[95vh] overflow-y-auto">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-[#2E3440]">Discovery Summary</h1>
            <p className="text-md text-[#4C566A]">{classification.content}</p>
          </div>

          {classification?.classificationConfiguration?.source_classification_id && (
            <SourceClassificationCallout classificationConfiguration={classification.classificationConfiguration} />
          )}

          {mediaUrl && <MediaSlider media={[mediaUrl]} sourceMedia={sourceClassificationMedia} />}

          <DiskDetectiveResults classification={classification} />
          <MineralDepositCallout deposit={mineralDeposit} />
          <DiskDetectiveSlideshow images={diskDetectiveImages} loading={loadingImages} />

          {annotationBadges.length > 0 && type !== "diskDetective" && <div className="flex flex-wrap pt-2">{annotationBadges}</div>}

          <div className="bg-[#D8F3DC] text-[#2E7D32] text-sm font-medium p-2 rounded-lg border border-[#A5D6A7]">
            +2 Stardust earned for this classification
          </div>

          <MilestoneDisplay milestones={milestones} />

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#D8DEE9]">
            <Button variant="outline" onClick={() => router.push(viewportUrl)} className="text-xs sm:text-sm">🧬 Back to Structure</Button>
            <Button variant="ghost" onClick={() => router.push("/")} className="text-xs sm:text-sm">🏠 Home</Button>
            <Button variant="default" onClick={() => router.push(viewportUrl)} className="text-xs sm:text-sm">⚙️ Next Discovery</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
