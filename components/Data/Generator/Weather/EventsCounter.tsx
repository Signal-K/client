'use client';

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { differenceInSeconds, startOfWeek } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TIMEZONE = 'Australia/Melbourne';

const biomeToStormMap: Record<string, string> = {
  "RockyHighlands": "Dust Storm",
  "Barren (Pending)": "Dust Storm",
  "Barren Wasteland": "Radiation Storm",
  "Arid Dunes": "Sandstorm",
  "Frigid Expanse": "Snowstorm",
  "Volcanic Terrain": "Ashfall",
  "Basalt Plains": "Windstorm",
  "Sediment Flats": "Flash Flood",
  "Cratered Terrain": "Seismic Shock",
  "Tundra Basin": "Ice Storm",
  "Temperate Highlands": "Thunderstorm",
  "Oceanic World": "Cyclone",
  "Tropical Jungle": "Monsoon",
  "Flood Basin": "Deluge",
  "Coral Reefs": "Supercell",
  "Dune Fields": "Heatwave",
};

export default function WeatherEventStatus({
  classificationId,
  biome,
  biomass,
}: {
  classificationId: number;
  biome: string;
  biomass: number;
}) {
  const supabase = useSupabaseClient();
  const [hasEventThisWeek, setHasEventThisWeek] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [upcomingStormType, setUpcomingStormType] = useState<string | null>(null);
  const [bacteriumVisible, setBacteriumVisible] = useState<boolean>(false);

  useEffect(() => {
    const checkWeatherEvent = async () => {
      const startOfWeekMelbourne = startOfWeek(toZonedTime(new Date(), TIMEZONE), { weekStartsOn: 1 });
      startOfWeekMelbourne.setHours(0, 1, 0, 0);

      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("classification_location", classificationId)
        .gte("time", startOfWeekMelbourne.toISOString());

      if (eventsError) {
        console.error("Error fetching weather events:", eventsError);
        return;
      }

      const hasEvent = events.length > 0;
      setHasEventThisWeek(hasEvent);

      const pendingStorm = events.find(e =>
        e.status === 'pending' &&
        (e.type?.toLowerCase().includes('storm') || e.type?.toLowerCase().includes('weather'))
      );

      const lightningEvent = events.find(e =>
        e.type?.toLowerCase().includes('lightning')
      );

      // Handle bacteria spawn logic
      if (
        classificationId === 40 ||
        (lightningEvent && biomass > 0.01 && biomass < 0.2)
      ) {
        setBacteriumVisible(true);
      } else {
        setBacteriumVisible(false);
      }

      if (pendingStorm && biomeToStormMap[biome]) {
        setUpcomingStormType(biomeToStormMap[biome]);
      } else if (!hasEvent && biomeToStormMap[biome]) {
        setUpcomingStormType(biomeToStormMap[biome]);
      } else {
        setUpcomingStormType(null);
      }
    };

    checkWeatherEvent();
  }, [classificationId, biome, biomass]);

  useEffect(() => {
    if (hasEventThisWeek === false) return;

    const interval = setInterval(() => {
      const now = toZonedTime(new Date(), TIMEZONE);
      const nextWeek = startOfWeek(now, { weekStartsOn: 1 });
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(0, 1, 0, 0);

      const secondsLeft = differenceInSeconds(nextWeek, now);
      setTimeLeft(secondsLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [hasEventThisWeek]);

  if (hasEventThisWeek === null) return null;

  if (hasEventThisWeek) {
    const h = String(Math.floor(timeLeft / 3600)).padStart(2, "0");
    const m = String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0");
    const s = String(timeLeft % 60).padStart(2, "0");

    return (
      <div className="bg-black/60 text-white px-6 py-4 rounded-xl shadow-md w-fit mx-auto text-center">
        Wait {h}:{m}:{s} for new weather event
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {bacteriumVisible && (
        <div className="relative p-4 rounded-lg bg-green-900/70 border border-green-400 text-green-200 text-center shadow-lg">
          <svg className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
            <defs>
              <pattern id="bacterium" patternUnits="userSpaceOnUse" width="30" height="30">
                <circle cx="15" cy="15" r="6" fill="limegreen" />
                <circle cx="18" cy="18" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#bacterium)" />
          </svg>
          <div className="relative z-10 font-semibold text-sm">Bacterial microcolonies are stirring...</div>
        </div>
      )}

      <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
        Upcoming storm...view {upcomingStormType}
      </Button>
    </div>
  );
};