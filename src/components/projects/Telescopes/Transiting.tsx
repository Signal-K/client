"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import ImageAnnotator from "../(classifications)/Annotating/AnnotatorView";
import { Button } from "@/src/components/ui/button";
import TutorialContentBlock from "../TutorialContentBlock";
import NGTSTutorial from "./NGTSTutorial";

type Anomaly = {
  id: number;
  anomalySet?: string;
  avatar_url?: string | null;
  content?: string | null;
};

function buildPlanetImageUrl(anomaly: Anomaly) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  if (anomaly.avatar_url) {
    return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${anomaly.avatar_url}`;
  }
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/anomalies/${anomaly.id}/Sector1.png`;
}

export function TelescopeTessWithId({ anomalyId }: { anomalyId: string }) {
  const session = useSession();
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showNGTSTutorial, setShowNGTSTutorial] = useState(false);

  useEffect(() => {
    async function initializeComponent() {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        let anomaly: Anomaly | null = null;
        if (anomalyId && anomalyId !== "random") {
          const res = await fetch(`/api/gameplay/anomalies?id=${encodeURIComponent(anomalyId)}&limit=1`);
          const payload = await res.json().catch(() => ({}));
          anomaly = res.ok ? payload?.anomalies?.[0] || null : null;
        } else {
          const res = await fetch("/api/gameplay/anomalies?anomalySet=telescope-tess&limit=1");
          const payload = await res.json().catch(() => ({}));
          anomaly = res.ok ? payload?.anomalies?.[0] || null : null;
        }

        if (!anomaly) {
          setError("Anomaly not found.");
          return;
        }

        setSelectedAnomaly(anomaly);
        setCurrentImageUrl(buildPlanetImageUrl(anomaly));
      } catch {
        setError("Unable to load anomaly.");
      } finally {
        setLoading(false);
      }
    }

    void initializeComponent();
  }, [session?.user?.id, anomalyId]);

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (loading) return <div className="text-white p-4">Loading...</div>;
  if (!selectedAnomaly || !currentImageUrl) return <div className="text-white p-4">No anomaly found.</div>;

  const isNGTSAnomaly =
    selectedAnomaly.anomalySet?.includes("telescope-ngts") ||
    selectedAnomaly.anomalySet?.includes("telescope-planetHunters-ngts");

  return (
    <div className="w-full h-[calc(100vh-8rem)] overflow-hidden flex flex-col gap-2 px-4">
      {showNGTSTutorial && <NGTSTutorial onClose={() => setShowNGTSTutorial(false)} />}
      <div className="w-full rounded-xl backdrop-blur-md bg-white/10 shadow-md p-2 flex justify-center items-center gap-4 flex-shrink-0">
        <Button variant="outline" onClick={() => setShowTutorial(true)}>
          Want a walkthrough? Start the tutorial
        </Button>
        {isNGTSAnomaly && (
          <Button
            variant="outline"
            onClick={() => setShowNGTSTutorial(true)}
            className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
          >
            View NGTS Tutorial
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-hidden min-h-0">
        {showTutorial ? (
          <div className="w-full h-full overflow-auto">
            <FirstTelescopeClassification
              anomalyid={selectedAnomaly.id.toString()}
              onTutorialComplete={() => setShowTutorial(false)}
            />
          </div>
        ) : (
          <div className="w-full h-full overflow-hidden">
            <ImageAnnotator
              anomalyType="planet"
              missionNumber={1372001}
              structureItemId={3103}
              assetMentioned={selectedAnomaly.id.toString()}
              annotationType={isNGTSAnomaly ? "NGTS" : "PH"}
              initialImageUrl={currentImageUrl}
              anomalyId={selectedAnomaly.id.toString()}
              className="h-full w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function StarterTelescopeTess() {
  return <TelescopeTessWithId anomalyId="random" />;
}

interface TelescopeProps {
  anomalyid: string;
  onTutorialComplete?: () => void | Promise<void>;
}

const FirstTelescopeClassification: React.FC<TelescopeProps> = ({ anomalyid, onTutorialComplete }) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/anomalies/${anomalyid}/Binned.png`;

  const [part, setPart] = useState(1);
  const nextPart = () => setPart(2);

  const tutorialSlides = [
    { title: "Planet Discovery Journey", text: "Start by discovering your first planet.", image: "/assets/Template.png" },
    { title: "Examine Lightcurves", text: "Look for dips and recurring patterns.", image: "/assets/Docs/Curves/Step2.png" },
    { title: "Ready to Analyze", text: "Classify this target to continue.", image: "/assets/Docs/Curves/Step4.png" },
  ];

  return (
    <div className="rounded-lg">
      <div className="flex flex-col items-center">
        {part === 1 && (
          <TutorialContentBlock slides={tutorialSlides} classificationtype="planet" onComplete={nextPart} />
        )}
        {part === 2 && (
          <div className="max-w-4xl mx-auto rounded-lg text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
            <ImageAnnotator
              initialImageUrl={imageUrl}
              anomalyType="planet"
              missionNumber={3000001}
              structureItemId={3103}
              assetMentioned={anomalyid}
              annotationType="PH"
              anomalyId={anomalyid}
              className="h-full w-full"
              onClassificationComplete={() => {
                if (onTutorialComplete) onTutorialComplete();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

