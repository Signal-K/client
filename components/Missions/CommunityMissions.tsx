import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Rocket, Navigation } from "lucide-react";
import Link from "next/link";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import CommunityMissionList from "./Requests";

const missions = [
  { id: 1, title: "Clean up Space Debris", location: "Orbit", reward: "500 credits" },
  { id: 2, title: "Alien Flora Survey", location: "Jungle", reward: "300 credits" },
  { id: 3, title: "Mineral Extraction", location: "Mountains", reward: "600 credits" },
  { id: 4, title: "Atmospheric Data Collection", location: "Sky City", reward: "400 credits" },
];
 
const stations = [
  { id: 31011, name: "Greenhouse" },
  { id: 31012, name: "Weather balloon" },
  { id: 31013, name: "Space telescope" },
];

export default function CommunityMissions() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [stationStatus, setStationStatus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const fetchStationData = async () => {
      try {
        if (!activePlanet?.id) return;

        const { data, error } = await supabase
          .from("inventory")
          .select("item")
          .eq("anomaly", activePlanet?.id)
          .in("item", stations.map((station) => station.id));

        if (error) throw error;

        const existingStationIds = new Set(data.map((row: { item: number }) => row.item));
        const statusMap: Record<number, boolean> = {};

        stations.forEach((station) => {
          statusMap[station.id] = existingStationIds.has(station.id);
        });

        setStationStatus(statusMap);
      } catch (error) {
        console.error("Error fetching station data:", error);
      }
    };

    fetchStationData();
  }, [activePlanet, supabase]);

  const handleBuildClick = async (stationName: string) => {
    await addSpecificStructure(stationName);
  };

  async function addSpecificStructure(structureType: string) {
    if (!session || !activePlanet) {
      return;
    }

    const structureItem = stations.find((station) => station.name === structureType);

    if (!structureItem) {
      console.error("Invalid structure type");
      return;
    }

    try {
      const { error: inventoryError } = await supabase
        .from("inventory")
        .insert([
          {
            owner: session?.user.id,
            anomaly: activePlanet?.id,
            item: structureItem.id,
            quantity: 1,
            configuration: { Uses: 5 },
          },
        ]);

      if (inventoryError) {
        throw inventoryError;
      }

      // Update the status to reflect that the station is now built
      setStationStatus((prev) => ({
        ...prev,
        [structureItem.id]: true,
      }));
    } catch (error: any) {
      console.error("Error adding structure to inventory", error.message);
    }
  }

  return (
    <div className="bg-[#2C4F64] text-[#CFD1D1] min-h-screen overflow-auto">
      <div className="container mx-auto p-4 space-y-6 max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#5FCBC3]">
          Available community missions
        </h1>

        <Card className="bg-[#1D2833] border-[#2C3A4A] border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#5FCBC3]">
              <MapPin className="h-6 w-6" />
              Community Stations
            </CardTitle>
            <CardDescription className="text-[#CFD1D1] opacity-80">
              Community stations are facilities where users can add and collate new data, collaborate on combined missions and pool resources. If your planet or area doesn't have a station you need, you can create one for free.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {stations.map((station) => (
                <li key={station.id}>
                  <Card
                    className={`bg-[#2C3A4A] border ${
                      stationStatus[station.id] ? "border-[#85DDA2]" : "border-[#5FCBC3]"
                    }`}
                  >
                    <CardHeader>
                      <CardTitle className="text-[#CFD1D1]">{station.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {stationStatus[station.id] ? (
                        <Button variant="outline" className="border-[#85DDA2] text-[#85DDA2] hover:bg-[#85DDA2] hover:text-[#1D2833]" asChild>
                          <Link href={`/starnet/consensus`}>
                            <Navigation className="mr-2 h-4 w-4" />
                            Navigate & browse missions
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="border-[#5FCBC3] text-[#5FCBC3] hover:bg-[#5FCBC3] hover:text-[#1D2833]"
                          onClick={() => handleBuildClick(station.name)}
                        >
                          Build Station
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* <Card className="bg-[#1D2833] border-[#2C3A4A] border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#5FCBC3]">
              <Rocket className="h-6 w-6" />
              Available Missions
            </CardTitle>
            <CardDescription className="text-[#CFD1D1] opacity-80">
              Complete missions to earn rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {missions.map((mission) => (
                <li key={mission.id}>
                  <Card className="bg-[#2C3A4A] border-[#5FCBC3] border">
                    <CardHeader>
                      <CardTitle className="text-[#CFD1D1]">{mission.title}</CardTitle>
                      <CardDescription className="text-[#CFD1D1] opacity-80">
                        Location: {mission.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-2 text-[#5FCBC3]">Reward: {mission.reward}</p>
                      <Button className="bg-[#5FCBC3] text-[#1D2833] hover:bg-[#CFD1D1] hover:text-[#1D2833]" asChild>
                        <Link href={`/missions/${mission.id}`}>Start Mission</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};