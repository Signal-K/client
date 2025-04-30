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

/*
'use client';

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { differenceInSeconds, startOfWeek } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import EventList from "./RecentEvents";

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
}

type ClassificationGroup = {
  classificationId: number;
  biome?: string;
  biomass?: number;
  density?: number;
};

export default function MultiWeatherEventStatus({
  classifications,
}: {
  classifications: ClassificationGroup[];
}) {
  const supabase = useSupabaseClient();
  const [statuses, setStatuses] = useState<Record<number, any>>({});

  useEffect(() => {
    classifications.forEach((group) => {
      const {
        classificationId,
        biome = "RockyHighlands",
        biomass = 0.01,
        density = 3.5,
      } = group;

      const planetType = getPlanetType(density);
      const startOfWeekMelbourne = startOfWeek(toZonedTime(new Date(), TIMEZONE), { weekStartsOn: 1 });
      startOfWeekMelbourne.setHours(0, 1, 0, 0);

      const fetchAndSetStatus = async () => {
        const { data: events, error } = await supabase
          .from("events")
          .select("*")
          .eq("classification_location", classificationId)
          .gte("time", startOfWeekMelbourne.toISOString());

        if (error) return;

        const hasEvent = events.length > 0;
        const lightningEventExists = events.some(e =>
          e.type?.toLowerCase().includes("lightning")
        );
        const pendingStorm = events.find(e =>
          e.status === "pending" &&
          (e.type?.toLowerCase().includes("storm") || e.type?.toLowerCase().includes("weather"))
        );

        let newEventType: string | null = null;
        if (
          planetType === "terrestrial" &&
          biomass >= 0.000001 &&
          biomass <= 0.02 &&
          !lightningEventExists
        ) {
          newEventType = "lightning-kickoff";
        } else if (!hasEvent) {
          newEventType = "rain-general";
        }

        const bacteriumVisible =
          classificationId === 40 || (lightningEventExists && biomass > 0.01 && biomass < 0.2);

        const upcomingStormType = biomeToStormMap[biome] || null;

        if (!hasEvent && (newEventType || upcomingStormType)) {
          await supabase.from("events").insert({
            type: newEventType ?? upcomingStormType,
            classification_location: classificationId,
            status: "pending",
            time: new Date().toISOString(),
          });
        }

        setStatuses(prev => ({
          ...prev,
          [classificationId]: {
            hasEvent,
            bacteriumVisible,
            nextEventType: newEventType,
            upcomingStormType,
            timeLeft: hasEvent ? getSecondsUntilNextWeek() : 0,
          }
        }));
      };

      fetchAndSetStatus();
    });
  }, [classifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatuses(prev => {
        const now = toZonedTime(new Date(), TIMEZONE);
        const nextWeek = startOfWeek(now, { weekStartsOn: 1 });
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(0, 1, 0, 0);
        const secondsLeft = differenceInSeconds(nextWeek, now);

        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          const numericKey = Number(key);
          if (updated[numericKey]?.hasEvent) {
            updated[numericKey].timeLeft = secondsLeft;
          }
        });
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function getSecondsUntilNextWeek() {
    const now = toZonedTime(new Date(), TIMEZONE);
    const nextWeek = startOfWeek(now, { weekStartsOn: 1 });
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(0, 1, 0, 0);
    return differenceInSeconds(nextWeek, now);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {classifications.map(({ classificationId, biomass = 0.01 }) => {
        const status = statuses[classificationId];
        if (!status) return null;

        const h = String(Math.floor(status.timeLeft / 3600)).padStart(2, "0");
        const m = String(Math.floor((status.timeLeft % 3600) / 60)).padStart(2, "0");
        const s = String(status.timeLeft % 60).padStart(2, "0");

        return (
          <div key={classificationId} className="p-4 border rounded-lg bg-black/50 text-white text-center space-y-4">
            <div className="font-bold">Classification #{classificationId}</div>

            {status.hasEvent ? (
              <div>Wait {h}:{m}:{s} for new weather event</div>
            ) : (
              <>
                {status.bacteriumVisible && (
                  <div className="p-2 bg-green-900/70 text-green-200 border border-green-400 rounded">
                    Bacterial microcolonies are stirring...
                  </div>
                )}

                {status.nextEventType && (
                  <Button className="bg-yellow-400 text-black hover:bg-yellow-500">
                    Next event: {status.nextEventType}
                  </Button>
                )}

                {status.upcomingStormType && (
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    Upcoming storm: {status.upcomingStormType}
                  </Button>
                )}
              </>
            )}

            <div className="text-sm opacity-70">Biomass: {biomass}</div>
            <EventList classificationId={classificationId} />
          </div>
        );
      })}
    </div>
  );
};
*/