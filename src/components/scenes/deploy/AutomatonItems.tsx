'use client';

import { Button } from "@/src/components/ui/button";
import { Vehicle } from "@/types/Vehicles";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";
import SelectLocationForAutomatonDeploymentDropdown from "./SelectDeployLocation";

// Helper to get ISO week and year for a date
function getISOWeekYear(date: Date) {
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return { year: target.getFullYear(), week };
}

const automatons: Vehicle[] = [
  {
    id: "1",
    name: "Probe",
    // description: "Simple and versatile satellite used to obtain data of nearby exoplanets",
    description: "Send probes to your discovered planets to find clouds and study the surface",
    image: "/assets/Automatons/Sat.png",
    stats: { speed: 100, armor: 100, capacity: 100 },
    cost: 1,
    quantity: 0,
  },
  {
    id: "2",
    name: "Scout Roover",
    // description: "Train roover",
    description: "Send rovers alongside your probes to planets to train the rover AI and find cool sights (and alien artifacts) on the planets discovered by you and the community!",
    image: "/assets/Automatons/ExploreRover1.png",
    stats: { speed: 100, armor: 100, capacity: 100 },
    cost: 1,
    quantity: 0,
  },
];

interface Classification {
  author: string;
  id: number;
  content: string;
  classificationtype: string;
  anomaly: number;
  media: (string | { uploadUrl?: string })[] | null;
  image_url?: string;
  images?: string[];
  anomalyContent?: string;
  relatedClassifications?: Classification[];
}

type CapacityKey = "probeCount" | "probeDistance" | "roverCount";
type UserCapacities = Record<CapacityKey, number>;

export default function AutomatonDeploySection() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [probeLocations, setProbeLocations] = useState<(Classification | null)[]>([]);
  const [roverLocations, setRoverLocations] = useState<(Classification | null)[]>([]);
  const [userCapacities, setUserCapacities] = useState<UserCapacities>({
    probeCount: 1,
    probeDistance: 1,
    roverCount: 1,
  });

  const [dropdownOpenState, setDropdownOpenState] = useState<Record<string, boolean>>({});
  const [deployDisabled, setDeployDisabled] = useState(false);

  // Check for existing anomalies linked this week and disable deploy if found
  useEffect(() => {
    if (!session) return;

    async function checkDeployAvailability() {
      const { data, error } = await supabase
        .from("linked_anomalies")
        .select("date")
        .eq("author", session?.user.id)
        .eq("automaton", "Probe")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching linked anomalies:", error);
        return;
      }

      console.log("linked_anomalies data:", data);

      if (!data || data.length === 0) {
        setDeployDisabled(false);
        return;
      };

      const now = new Date();
      const currentWeek = getISOWeekYear(now);

      // Check if any linked anomalies are in this week
      const foundThisWeek = data.some((entry) => {
        if (!entry.date) return false;
        const d = new Date(entry.date);
        const { year, week } = getISOWeekYear(d);
        return year === currentWeek.year && week === currentWeek.week;
      });
      
      setDeployDisabled(false);
      setDeployDisabled(foundThisWeek);
    }

    checkDeployAvailability();
  }, [session, supabase]);

  useEffect(() => {
    setProbeLocations((prev) => {
      if (prev.length === userCapacities.probeCount) return prev;
      return Array(userCapacities.probeCount).fill(null);
    });
    setRoverLocations((prev) => {
      if (prev.length === userCapacities.roverCount) return prev;
      return Array(userCapacities.roverCount).fill(null);
    });
  }, [userCapacities]);

  useEffect(() => {
    if (!session) return;

    async function fetchResearchData() {
      try {
        const { data: researched, error } = await supabase
          .from("researched")
          .select("tech_type")
          .eq("user_id", session?.user.id);

        if (error) throw error;

        let probeCount = 1;
        let probeDistance = 1;
        let roverCount = 1;

        researched?.forEach((item) => {
          if (item.tech_type === "probecount") probeCount += 1;
          if (item.tech_type === "proberange") probeDistance += 1;
          if (item.tech_type === "rovercount") roverCount += 1;
        });

        setUserCapacities({ probeCount, probeDistance, roverCount });

        await fetch(`api/gameplay/research/upgrades?techType=proberange&count=${probeDistance}`);
      } catch (error) {
        console.error("Error fetching research data:", error);
      };
    };

    fetchResearchData();
  }, [session, supabase]);

  const handleSelectLocation = (
    index: number,
    type: "probe" | "rover",
    location: Classification
  ) => {
    if (type === "probe") {
      const updated = [...probeLocations];
      updated[index] = location;
      setProbeLocations(updated);
    } else {
      const updated = [...roverLocations];
      updated[index] = location;
      setRoverLocations(updated);
    }
  };

  const handleDropdownOpenChange = (key: string, isOpen: boolean) => {
    setDropdownOpenState((prev) => ({ ...prev, [key]: isOpen }));
  };

  const handleSubmit = async () => {
    if (!session) return;

    // Check if user has fast deploy enabled (no classifications made)
    const { count: userClassificationCount } = await supabase
      .from('classifications')
      .select('id', { count: 'exact', head: true })
      .eq('author', session.user.id);

    const isFastDeployEnabled = (userClassificationCount || 0) === 0;
    console.log("Fast deploy enabled:", isFastDeployEnabled);
    
    // Set deployment date - one day prior for fast deploy, current time otherwise
    const currentTime = new Date();
    const deploymentDate = isFastDeployEnabled 
      ? new Date(currentTime.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
      : currentTime;
    const deploymentDateISO = deploymentDate.toISOString();
    
    console.log("Deployment date:", deploymentDateISO, isFastDeployEnabled ? "(fast deploy)" : "(normal)");

    // Before inserting new linked anomalies:
    // Delete linked anomalies older than this week for this user

    // Fetch existing linked anomalies by author
    const { data: existingLinked, error: fetchErr } = await supabase
      .from("linked_anomalies")
      .select("id, date")
      .eq("author", session.user.id);

    if (fetchErr) {
      console.error("Error fetching existing linked anomalies:", fetchErr);
      return;
    };

    const now = new Date();
    const currentWeek = getISOWeekYear(now);

    // Filter anomalies NOT in current week (to delete)
    const toDeleteIds = (existingLinked || [])
      .filter((entry) => {
        if (!entry.date) return false;
        const d = new Date(entry.date);
        const { year, week } = getISOWeekYear(d);
        return !(year === currentWeek.year && week === currentWeek.week);
      })
      .map((entry) => entry.id);

    if (toDeleteIds.length > 0) {
      const { error: deleteErr } = await supabase
        .from("linked_anomalies")
        .delete()
        .in("id", toDeleteIds);

      if (deleteErr) {
        console.error("Error deleting old linked anomalies:", deleteErr);
        return;
      }
    }

    // Now proceed with deployment logic:

    const probes = probeLocations.filter(Boolean) as Classification[];
    const rovers = roverLocations.filter(Boolean) as Classification[];

    const anomalySetMap: Record<string, string> = {
      AI4M: "automaton-aiForMars",
      JVH: "lidar-jovianVortexHunter",
      P4: "satellite-planetFour",
      Clouds: "cloudspottingOnMars",
    };

    const getRandomTypes = (types: string[]) => {
      const shuffled = [...types].sort(() => 0.5 - Math.random());
      return Math.random() > 0.5 ? [shuffled[0], shuffled[1]] : [shuffled[0], shuffled[0]];
    };

    const neededSets: Record<string, number> = {};

const roverCount = rovers.length;
const probeCount = probes.length;

// Ensure 3 of each anomaly set for every rover
neededSets["automaton-aiForMars"] = roverCount * 3;
neededSets["lidar-jovianVortexHunter"] = roverCount * 3;
neededSets["satellite-planetFour"] = roverCount * 3;
neededSets["cloudspottingOnMars"] = roverCount * 3;

// For probes, keep the randomized behavior (optional: adjust to fixed 2 each as well if needed)
probes.forEach(() => {
  getRandomTypes(["P4", "Clouds"]).forEach((type) => {
    const key = anomalySetMap[type];
    neededSets[key] = (neededSets[key] || 0) + 1;
  });
});

    const anomalyIdPool: Record<string, number[]> = {};

    for (const [set, count] of Object.entries(neededSets)) {
      const { data, error } = await supabase
        .from("anomalies")
        .select("id")
        .eq("anomalySet", set);

      if (error) {
        console.error(`Error fetching anomalies for ${set}:`, error);
        continue;
      }

      const ids = (data?.map((a) => a.id) || []).slice(0, count);
      anomalyIdPool[set] = ids;
    }

    const assignments: {
      classification: Classification;
      anomalySet: string;
      anomalyId: number | null;
      automaton: "Rover" | "Probe";
    }[] = [];

    const assignAnomalies = (
      locations: Classification[],
      types: string[],
      automaton: "Rover" | "Probe"
    ) => {
      locations.forEach((loc) => {
        const selected = getRandomTypes(types);
        selected.forEach((type) => {
          const set = anomalySetMap[type];
          const ids = anomalyIdPool[set] || [];

          const assignedId = ids.length ? ids.shift()! : null;

          assignments.push({
            classification: loc,
            anomalySet: set,
            anomalyId: assignedId,
            automaton,
          });
        });
      });
    };

    // Assign anomalies for rovers: 3 each of all 4 types per rover
rovers.forEach((loc) => {
  ["automaton-aiForMars", "lidar-jovianVortexHunter", "satellite-planetFour", "cloudspottingOnMars"].forEach((set) => {
    for (let i = 0; i < 3; i++) {
      const ids = anomalyIdPool[set] || [];
      const assignedId = ids.length ? ids.shift()! : null;

      assignments.push({
        classification: loc,
        anomalySet: set,
        anomalyId: assignedId,
        automaton: "Rover",
      });
    }
  });
});
    assignAnomalies(probes, ["P4", "Clouds"], "Probe");

    const entriesToInsert = assignments
      .filter((a) => a.anomalyId !== null)
      .map((a) => ({
        author: session.user.id,
        classification_id: a.classification.id,
        anomaly_id: a.anomalyId!,
        automaton: a.automaton,
        date: deploymentDateISO,
      }));

    if (entriesToInsert.length === 0) {
      alert("No anomalies available to deploy.");
      return;
    }

    const { error: insertError } = await supabase
      .from("linked_anomalies")
      .insert(entriesToInsert);

    if (insertError) { 
      console.error("Error inserting into linked_anomalies:", insertError);
      alert("Deployment failed. Please try again.");
    } else {
      alert("Successfully deployed automatons!");
      setDeployDisabled(true);
    }
  };

  return (
    <>
      <h3 className="text-md mb-2">Available automatons</h3>
      {!deployDisabled && (
        <div className="grid grid-cols-2 gap-4">
        {automatons.map((vehicle) => {
          const isProbe = vehicle.name === "Probe";
          const count = isProbe ? userCapacities.probeCount : userCapacities.roverCount;
          const slots = Array.from({ length: count });

          return (
            <div
              key={vehicle.id}
              className="border border-white/40 rounded-lg p-4 bg-muted/10"
            >
              <div className="flex flex-col items-center">
                <img
                  src={vehicle.image}
                  alt="Vehicle image"
                  className="w-24 h-24 object-contain"
                />
                <h4 className="font-semibold mt-2">{vehicle.name}</h4>
                <p className="text-sm text-muted-foreground">{vehicle.description}</p>
                <p className="text-xs mt-1">
                  {isProbe
                    ? `Count: ${userCapacities.probeCount}`
                    : `Count: ${userCapacities.roverCount}`}
                </p>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                {slots.map((_, i) => {
                  const selectedLoc = isProbe ? probeLocations[i] : roverLocations[i];
                  const dropdownKey = `${isProbe ? "probe" : "rover"}-${i}`;
                  return (
                    <div
                      key={`${dropdownKey}-${selectedLoc?.id ?? "none"}`}
                      className="flex items-center gap-2"
                    >
                      <span>{vehicle.name} #{i + 1}:</span>
                      <SelectLocationForAutomatonDeploymentDropdown
                        selected={selectedLoc}
                        setSelectedLocation={(loc) =>
                          handleSelectLocation(i, isProbe ? "probe" : "rover", loc)
                        }
                        open={!!dropdownOpenState[dropdownKey]}
                        onOpenChange={(open) =>
                          handleDropdownOpenChange(dropdownKey, open)
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      )}

      <div className="mt-6 text-center">
        <Button onClick={handleSubmit} disabled={deployDisabled}>
          {deployDisabled ? "Already deployed this week" : "Deploy Automatons"}
        </Button>
      </div>
    </>
  );
};