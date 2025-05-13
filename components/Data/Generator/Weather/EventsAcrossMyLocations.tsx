'use client';

import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { startOfWeek, addWeeks, differenceInSeconds } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { Button } from "@/components/ui/button";

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

interface EnvironmentalEffect {
  humidity: number;     // -1 to 1 (percentage points, e.g., 0.05 = +5%)
  temperature: number;  // In °C change
  biomass: number;      // Very small, ±0.00X to ±0.02
}

const stormEffectsMap: Record<string, EnvironmentalEffect> = {
  "Dust Storm": {
    humidity: -0.05,
    temperature: -1,
    biomass: -0.005,
  },
  "lightning-kickoff": {
    humidity: +0.05,
    temperature: +2,
    biomass: +0.01,
  },
  "Radiation Storm": {
    humidity: -0.10,
    temperature: +3,
    biomass: -0.015,
  },
  "Sandstorm": {
    humidity: -0.04,
    temperature: +2,
    biomass: -0.01,
  },
  "Snowstorm": {
    humidity: +0.10,
    temperature: -5,
    biomass: -0.002,
  },
  "Ashfall": {
    humidity: -0.02,
    temperature: +4,
    biomass: -0.01,
  },
  "Windstorm": {
    humidity: -0.03,
    temperature: +1,
    biomass: -0.002,
  },
  "Flash Flood": {
    humidity: +0.15,
    temperature: -1,
    biomass: +0.005,
  },
  "Seismic Shock": {
    humidity: 0,
    temperature: 0,
    biomass: -0.02,
  },
  "Ice Storm": {
    humidity: +0.08,
    temperature: -6,
    biomass: -0.01,
  },
  "Thunderstorm": {
    humidity: +0.12,
    temperature: +1,
    biomass: +0.01,
  },
  "Cyclone": {
    humidity: +0.20,
    temperature: -2,
    biomass: +0.015,
  },
  "Monsoon": {
    humidity: +0.25,
    temperature: -1,
    biomass: +0.02,
  },
  "Deluge": {
    humidity: +0.30,
    temperature: -2,
    biomass: +0.015,
  },
  "Supercell": {
    humidity: +0.18,
    temperature: +1,
    biomass: +0.01,
  },
  "Heatwave": {
    humidity: -0.20,
    temperature: +6,
    biomass: -0.02,
  },
};

interface EventData {
  classificationId: number;
  eventCount: number;
  hasEvent: boolean;
  redeemed: boolean;
  nextEventType: string | null;
  anomalyId: number;
  countdown: string;
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

// Theme matching the parent component (light pastel tones)
const structureTheme = {
  background: 'bg-transparent', // parent already applies background
  cardBackground: 'bg-white/20 backdrop-blur',
  cardBorder: 'border border-white/10',
  title: 'text-[#2E3440]',
  subtitle: 'text-[#4C566A]',
  redeemed: 'text-green-600',
  notRedeemed: 'text-red-500',
  countdown: 'text-[#D08770]',
  nextEvent: 'text-[#5E81AC]',
};

export default function WeatherEventsOverview() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [eventsData, setEventsData] = useState<EventData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      if (!session) return;

      const { data: classifications, error: classError } = await supabase
        .from("classifications")
        .select("id, anomaly")
        .eq("author", session.user.id)
        .in("classificationtype", ["planet", "telescope-minorPlanet"]);

      if (classError || !classifications) {
        console.error("Error fetching classifications:", classError);
        setLoading(false);
        return;
      }

      const classificationInfo = classifications.map((item) => ({
        id: item.id,
        biome: "RockyHighlands", // placeholder; replace with actual biome data
        biomass: 0.01,
        density: 3.5,
        anomaly_id: item.anomaly,
      }));

      const now = new Date();
      const startOfWeekMelbourne = startOfWeek(toZonedTime(now, TIMEZONE), { weekStartsOn: 1 });
      startOfWeekMelbourne.setHours(0, 1, 0, 0);
      const endOfWeekMelbourne = addWeeks(startOfWeekMelbourne, 1);

      const classificationIds = classificationInfo.map(c => c.id);

      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .in("classification_location", classificationIds)
        .gte("time", startOfWeekMelbourne.toISOString());

      if (eventsError) {
        console.error("Error fetching events:", eventsError);
        setLoading(false);
        return;
      }

      const grouped: Record<number, EventData> = {};

      for (const info of classificationInfo) {
        const { id, biome, biomass, density, anomaly_id } = info;
        const planetType = getPlanetType(density);

        const eventsForLocation = events.filter(e => e.classification_location === id);
        const hasEventThisWeek = eventsForLocation.length > 0;
        const redeemed = eventsForLocation.some(e => e.status === "redeemed");
        const lightningEventExists = eventsForLocation.some(e =>
          e.type?.toLowerCase().includes("lightning")
        );

        let newEventType: string | null = null;

        if (!hasEventThisWeek) {
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
        }

        const secondsLeft = differenceInSeconds(endOfWeekMelbourne, toZonedTime(now, TIMEZONE));
        grouped[id] = {
          classificationId: id,
          eventCount: eventsForLocation.length,
          hasEvent: hasEventThisWeek,
          redeemed,
          nextEventType: newEventType,
          anomalyId: anomaly_id,
          countdown: formatCountdown(secondsLeft),
        };
      }

      setEventsData(Object.values(grouped));
      setLoading(false);
    }

    fetchData();
  }, [session]);

  const handleCreateEvent = async (classificationId: number, anomalyId: number, type: string) => {
    if (!session) return;
  
    const stormEffect = stormEffectsMap[type];
    if (!stormEffect) {
      console.warn(`No environmental effect defined for storm type: ${type}`);
      return;
    }
  
    // Step 1: Create the Event
    const { data: eventInsertData, error: eventError } = await supabase
      .from("events")
      .insert({
        classification_location: classificationId,
        location: anomalyId,
        type,
        configuration: stormEffect,
        completed: false,
      })
      .select("id") // so we get the created event ID
      .single();
  
    if (eventError || !eventInsertData) {
      console.error("Error creating event:", eventError);
      return;
    }
  
    const eventId = eventInsertData.id;
  
    // Step 2: Create 3 Comments (humidity, temperature, biomass)
    const commentPayloads = ["humidity", "temperature", "biomass"].map((category) => ({
      content: `Change in ${category}: ${stormEffect[category as keyof EnvironmentalEffect]}`,
      author: session.user.id,
      classification_id: classificationId,
      category,
      value: stormEffect[category as keyof EnvironmentalEffect].toString(),
      configuration: JSON.stringify({
        type: "weather-effect",
        effect: type,
        delta: stormEffect[category as keyof EnvironmentalEffect],
      }),
      event: eventId,
    }));
  
    const { error: commentError } = await supabase
      .from("comments")
      .insert(commentPayloads);
  
    if (commentError) {
      console.error("Error inserting comments:", commentError);
    }
  
    // Reload to show updates
    window.location.reload();
  };  

  if (loading) return <div className="text-[#2E3440] p-4">Loading weather events...</div>;
  if (eventsData.length === 0) return <div className="text-[#2E3440] p-4">No planets found.</div>;

  return (
    <div className={`min-h-screen p-4 space-y-8 ${structureTheme.background}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {eventsData.map(event => (
          <div
            key={event.classificationId}
            className={`${structureTheme.cardBackground} ${structureTheme.cardBorder} text-[#2E3440] p-6 rounded-2xl shadow-lg space-y-2`}
          >
            <h2 className={`text-xl font-bold ${structureTheme.title}`}>
              Planet #{event.classificationId}
            </h2>
            <p className={`text-sm ${structureTheme.subtitle}`}>
              Events this week: <span className="font-semibold">{event.eventCount}</span>
            </p>
            <p className={`text-sm font-semibold ${event.redeemed ? structureTheme.redeemed : structureTheme.notRedeemed}`}>
              {event.redeemed ? 'Redeemed' : 'Not Redeemed'}
            </p>
            {event.hasEvent ? (
              <p className={`text-sm ${structureTheme.countdown}`}>
                Next event in: <span className="font-mono">{event.countdown}</span>
              </p>
            ) : (
              event.nextEventType && (
                <>
                  <p className={`text-sm ${structureTheme.nextEvent}`}>
                    Next Suggested Event: <strong>{event.nextEventType}</strong>
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-2 text-sm"
                    onClick={() =>
                      handleCreateEvent(event.classificationId, event.anomalyId, event.nextEventType!)
                    }
                  >
                    Create Event
                  </Button>
                </>
              )
            )}
          </div>
        ))}
      </div>
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