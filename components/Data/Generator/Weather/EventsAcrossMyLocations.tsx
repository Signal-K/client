'use client';

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { startOfWeek } from "date-fns";
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

function getPlanetType(density: number): "terrestrial" | "gaseous" | "ocean" {
  if (density >= 3.5) return "terrestrial";
  if (density < 1.5) return "gaseous";
  return "ocean";
};

interface EventData {
  classificationId: number;
  eventCount: number;
  redeemed: boolean;
  nextEventType: string | null;
};

export default function WeatherEventsOverview({
  classificationInfo,
}: {
  classificationInfo: { id: number; biome: string; biomass: number; density: number }[];
}) {
  const supabase = useSupabaseClient();
  const [eventsData, setEventsData] = useState<EventData[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
    if (!classificationInfo || classificationInfo.length === 0) return;

      const startOfWeekMelbourne = startOfWeek(toZonedTime(new Date(), TIMEZONE), { weekStartsOn: 1 });
      startOfWeekMelbourne.setHours(0, 1, 0, 0);

      const classificationIds = classificationInfo.map(c => c.id);

      const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .in("classification_location", classificationIds)
        .gte("time", startOfWeekMelbourne.toISOString());

      if (error) {
        console.error("Error fetching events:", error);
        return;
      };

      const grouped: Record<number, { count: number; redeemed: boolean; nextEventType: string | null }> = {};

      for (const info of classificationInfo) {
        const { id, biome, biomass, density } = info;
        const planetType = getPlanetType(density);

        grouped[id] = { count: 0, redeemed: false, nextEventType: null };

        const eventsForLocation = events.filter(e => e.classification_location === id);

        for (const event of eventsForLocation) {
          grouped[id].count += 1;
          if (event.status === "redeemed") {
            grouped[id].redeemed = true;
          }
        }

        if (!grouped[id].redeemed) {
          const lightningEventExists = eventsForLocation.some(e =>
            e.type?.toLowerCase().includes("lightning")
          );

          let newEventType: string | null = null;

          if (
            planetType === "terrestrial" &&
            biomass >= 0.000001 &&
            biomass <= 0.02 &&
            !lightningEventExists
          ) {
            newEventType = "lightning-kickoff";
          } else {
            newEventType = biomeToStormMap[biome] || "rain-general";
          }

          grouped[id].nextEventType = newEventType;
        }
      }

      const newData: EventData[] = classificationInfo.map(info => ({
        classificationId: info.id,
        eventCount: grouped[info.id]?.count || 0,
        redeemed: grouped[info.id]?.redeemed || false,
        nextEventType: grouped[info.id]?.nextEventType || null,
      }));

      setEventsData(newData);
    };

    fetchEvents();
  }, [classificationInfo]);

  if (eventsData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {eventsData.map(event => (
        <div
          key={event.classificationId}
          className="bg-black/60 text-white p-4 rounded-lg shadow-md flex flex-col items-center"
        >
          <div className="text-lg font-semibold">Location ID: {event.classificationId}</div>
          <div className="text-sm">Events this week: {event.eventCount}</div>
          <div className={`text-sm ${event.redeemed ? 'text-green-400' : 'text-red-400'}`}>
            {event.redeemed ? 'Redeemed' : 'Not redeemed'}
          </div>
          {!event.redeemed && event.nextEventType && (
            <div className="text-yellow-400 text-sm mt-2">
              Next event: {event.nextEventType}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};