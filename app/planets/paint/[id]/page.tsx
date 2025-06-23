'use client'

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useParams, useRouter } from "next/navigation";
import { Classification } from "../../[id]/page";
import GameNavbar from "@/components/Layout/Tes";
import PlanetGenerator from "@/components/Data/Generator/Astronomers/PlanetHunters/PlanetGenerator";
import { Button } from "@/components/ui/button";
import { Cog } from "lucide-react";

export default function PaintYourPlanetPage() {
  const params = useParams();
  const id = params?.id as string;

  const router = useRouter();
  const supabase = useSupabaseClient();
  const session = useSession();

  const [classification, setClassification] = useState<Classification | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const fetchClassification = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("classifications")
        .select("*, anomaly:anomalies(*), classificationConfiguration, media")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching planet details: ", error);
        setError('Failed to fetch classification data');
        return;
      }

      setClassification(data);
    };

    fetchClassification();
  }, [id]);

  if (!classification) return <p>Loading...</p>;

  return (
    <div className="min-h-screen w-screen flex flex-col bg-black text-white">
      <GameNavbar />

      <div className="relative flex-1 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Image
            src="/assets/Backdrops/background1.jpg"
            alt="background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
        </div>

        <main className="relative z-10 flex flex-col h-full px-4 pt-4">
          <div className="flex-grow overflow-auto max-h-[calc(100vh-160px)]">
            <PlanetGenerator
              classificationId={classification.id.toString()}
              editMode={true}
              showSettings={showSettings}
              onToggleSettings={() => setShowSettings(prev => !prev)}
            />
          </div>

          <blockquote className="mx-auto my-6 max-w-xl rounded-lg border border-blue-600 bg-blue-900/30 px-6 py-4 text-blue-300 text-center text-sm leading-relaxed">
            Complete missions, make key discoveries about your planet with your Telescope, and unlock deeper planet editing tools.
            From atmosphere tweaks to anomaly behaviors, your progress will shape what you can customise.
            The more you uncover, the more control you'll have over your planet’s unique traits.
          </blockquote>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-[#D8DEE9] pb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => router.push(`/structures/telescope`)}>
                🧬 Back to Telescope
              </Button>
              <Button variant="ghost" onClick={() => router.push('/')}>
                🏠 Home
              </Button>
            </div>

            {/* Mobile-only Planet Settings Button */}
            <div className="md:hidden">
              <Button
                onClick={() => setShowSettings(prev => !prev)}
                className="flex items-center gap-2 text-white border border-white/20"
                variant="outline"
              >
                <Cog className="w-4 h-4" />
                Planet Settings
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};