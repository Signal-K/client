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
import { RooverFromAppeears } from "@/components/Projects/Auto/Mars-Photos";
 
interface RoverData {
  photos: string[];
  resourceSites: { name: string; deposits: string[] }[];
};

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
    configuration: '{"Uses": 8}',
  };

  const researchStructureToInventoryData = {
    item: 3106,
    owner: session?.user.id,
    quantity: 1,
    notes: "Created for introductory mission group",
    anomaly: activePlanet?.id,
    configuration: '{"Uses": 8}',
  }

  const [isDeployed, setIsDeployed] = useState<boolean>(false);
  const [roverData, setRoverData] = useState<RoverData | null>(null);
  const [dialogueStep, setDialogueStep] = useState<number>(1);

  const deployRover = () => {
    console.log("Deploying rover...");
    setIsDeployed(true);
    setDialogueStep(2);
    setTimeout(() => {
      setRoverData({
        photos: Array(6).fill("/placeholder.svg?height=200&width=200"),
        resourceSites: [
          { name: "Site A", deposits: ["Iron", "Copper"] },
          { name: "Site B", deposits: ["Titanium", "Aluminum"] },
          { name: "Site C", deposits: ["Silicon", "Rare Earth"] },
        ],
      });
      setDialogueStep(3);
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
        };

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
          };

          const { error: insertResearchError } = await supabase
            .from("inventory")
            .insert(researchStructureToInventoryData);
          
          if (insertResearchError) {
              console.error("Error creating research structure in inventory: ", insertResearchError);
            } else {
              console.log("Research structure added to inventory.");
            };
        };
      } catch (error) {
        console.error("Unexpected error: ", error);
      }
    };

    if (session?.user?.id) {
      fetchInventoryItems();
    }
  }, [session, supabase, newRoverToInventoryData]);

  return (
    <div className="flex flex-col items-center gap-4 pb-4 relative w-full max-w-lg mx-auto text-white">
      <Card className="w-full text-white rounded-lg bg-opacity-10">
        {/* <CardHeader>
          <div className="flex items-center gap-4">
            <div>
              <CardDescription className="text-white">
                Deploy and monitor your automated Mars rovers.
              </CardDescription>
            </div>
          </div>
        </CardHeader> */}
        <CardContent>
          <div className="flex flex-col gap-4 py-2">
            {dialogueStep === 1 && !isDeployed && (
              <div className="flex items-center flex-row gap-4">
                <Avatar className="h-12 w-12 bg-pastel-pink text-white">
                  <AvatarImage src="/assets/Captn.jpg" alt="Cosmos" />
                </Avatar>
                <div className="relative p-4 bg-[#2C3A4A] bg-opacity-75 border border-[#85DDA2] rounded-md shadow-md text-lg font-medium text-white">
                  <div className="absolute top-1/2 left-[-16px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-[#2C3A4A] border-r-8 border-r-transparent"></div>
                  Now that we've discovered a planet, let's deploy a rover to get a closer look!
                </div>
              </div>
            )}
            {dialogueStep === 2 && isDeployed && !roverData && (
              <div className="relative p-4 bg-[#2C3A4A] bg-opacity-75 border border-[#85DDA2] rounded-md shadow-md text-lg font-medium text-white">
                <div className="absolute top-1/2 left-[-16px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-[#2C3A4A] border-r-8 border-r-transparent"></div>
                Now let's analyze your rover photos...
              </div>
            )}
            {dialogueStep === 3 && roverData && (
              <>
                <RooverFromAppeears />
                <div className="relative p-4 bg-[#2C3A4A] bg-opacity-75 border border-[#85DDA2] rounded-md shadow-md text-lg font-medium text-white mt-4">
                  <div className="absolute top-1/2 left-[-16px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-[#2C3A4A] border-r-8 border-r-transparent"></div>
                  Select from the available options based on what you can see in the photo.
                </div>
              </>
            )}
            {!isDeployed && (
              <div className="grid grid-cols-3 gap-4">
                {["Rover"].map((rover, index) => (
                  <Button
                    key={index}
                    className="flex flex-col items-center justify-center gap-2 bg-[#85DDA2] h-24 w-24 text-white rounded-lg"
                    onClick={deployRover}
                    disabled={isDeployed}
                  >
                    <Avatar className="h-12 w-12 bg-pastel-pink text-white">
                      <AvatarImage
                        src="https://cdn-icons-png.flaticon.com/512/124/124544.png"
                        alt={rover}
                      />
                      <AvatarFallback>{`R${index + 1}`}</AvatarFallback>
                    </Avatar>
                    {/* <div className="text-sm font-medium">{rover}</div> */}
                    {isDeployed ? "Rover Deployed" : "Deploy Rover"}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};