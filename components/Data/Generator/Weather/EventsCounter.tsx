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

export default function WeatherEventStatus({ classificationId, biome }: { classificationId: number, biome: string }) {
  const supabase = useSupabaseClient();
  const [hasEventThisWeek, setHasEventThisWeek] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [upcomingStormType, setUpcomingStormType] = useState<string | null>(null);

  useEffect(() => {
    const checkWeatherEvent = async () => {
        const startOfWeekMelbourne = startOfWeek(toZonedTime(new Date(), TIMEZONE), { weekStartsOn: 1 });
        startOfWeekMelbourne.setHours(0, 1, 0, 0);
      
        const { data: events, error: eventsError } = await supabase
          .from("events")
          .select("*")
          .eq("classification_location", classificationId)
          .or("type.ilike.weather,type.ilike.storm")
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
      
        if (pendingStorm && biomeToStormMap[biome]) {
          setUpcomingStormType(biomeToStormMap[biome]);
        } else if (!hasEvent && biomeToStormMap[biome]) {
          // Fallback: show expected storm even if no event yet
          setUpcomingStormType(biomeToStormMap[biome]);
        } else {
          setUpcomingStormType(null);
        }
      };      

    checkWeatherEvent();
  }, [classificationId, biome]);

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
    <div className="flex flex-col items-center justify-center gap-2">
      <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
        Upcoming storm...view {upcomingStormType}
        {/* {biome} */}
      </Button>
      {/* {upcomingStormType && (
        <div className="text-white bg-black/60 px-4 py-2 rounded-md text-sm">
          Most likely: <strong>{upcomingStormType}</strong>
        </div>
      )} */}
    </div>
  );
};