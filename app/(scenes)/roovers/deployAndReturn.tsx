import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import RooverFromAppeears from "@/app/(anomalies)/(data)/Mars-Photos";

interface RoverData {
  photos: string[];
  resourceSites: { name: string; deposits: string[] }[];
}

interface InventoryItem {
  id: number;
  item: number;
  owner: string;
  quantity: number;
  notes: string;
  parentItem: string | null;
  time_of_deploy: string | null;
  anomaly: string;
}

export default function DeployRooversInitial() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const newRoverToInventoryData = {
    item: 23,
    owner: session?.user?.id,
    quantity: 1,
    notes: "Created for mission 1370104",
    parentItem: null,
    time_of_deploy: null,
    anomaly: activePlanet?.id,
  };

  const [isDeployed, setIsDeployed] = useState<boolean>(false);
  const [roverData, setRoverData] = useState<RoverData | null>(null);

  const deployRover = () => {
    console.log("Deploying rover...");
    setIsDeployed(true);
    setTimeout(() => {
      setRoverData({
        photos: Array(6).fill("/placeholder.svg?height=200&width=200"),
        resourceSites: [
          { name: "Site A", deposits: ["Iron", "Copper"] },
          { name: "Site B", deposits: ["Titanium", "Aluminum"] },
          { name: "Site C", deposits: ["Silicon", "Rare Earth"] },
        ],
      });
    }, 5000);
  };

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const { data, error } = await supabase
          .from("inventory")
          .select("*")
          .eq("item", 23)
          .eq("owner", session?.user?.id);

        if (error) {
          console.error("Error fetching inventory items: ", error);
          return;
        }

        if (data && data.length > 0) {
          console.log(`Rover already in inventory with ID: ${data[0].id}`);
        } else {
          const { error: insertError } = await supabase
            .from("inventory")
            .insert(newRoverToInventoryData);

          if (insertError) {
            console.error("Error creating rover in inventory: ", insertError);
          } else {
            console.log("New rover added to inventory.");
          }
        }
      } catch (error) {
        console.error("Unexpected error: ", error);
      }
    };

    if (session?.user?.id) {
      fetchInventoryItems();
    }
  }, [session, supabase, newRoverToInventoryData]);

  return (
    <div className="bg-pastel-blue text-gray-700 font-body p-4 rounded-lg">
      <Card className="w-full border-gray-300 bg-cyan-50 text-gray-800 rounded-lg">
        <CardHeader>
          <CardTitle className="text-pastel-pink font-heading">
            Mars Rover Control Panel
          </CardTitle>
          <CardDescription className="text-gray-600">
            Deploy and monitor your automated Mars rovers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {!isDeployed ? (
              <div className="grid grid-cols-3 gap-4">
                {["Rover 1"].map((rover, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center gap-2"
                  >
                    <Avatar className="h-12 w-12 bg-pastel-pink text-gray-800">
                      <AvatarImage
                        src="https://cdn-icons-png.flaticon.com/512/124/124544.png"
                        alt={rover}
                      />
                      <AvatarFallback>{`R${index + 1}`}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-medium">{rover}</div>
                  </div>
                ))}
              </div>
            ) : (
              <RooverFromAppeears />
            )}
            <Button
              className={`w-full ${
                isDeployed ? "bg-pastel-green" : "bg-pastel-pink"
              } text-gray-800`}
              onClick={deployRover}
              disabled={isDeployed}
            >
              {isDeployed ? "Rover Deployed" : "Deploy Rover"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};