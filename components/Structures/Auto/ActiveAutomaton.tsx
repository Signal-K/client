import React, { useRef, useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { MineralDeposit, Automaton } from "@/types/Items";
import AutomatonUpgrade from "../Config/AutomatonUpgradeBox";
import { InventoryItem } from "@/types/Items";
import { Battery, MapPin, Rocket, Clock } from "lucide-react";

import "../../../styles/Anims/MiningAnimations.css";
import "../../../styles/Structures/RoverPath.css";
import "../../../styles/Structures/MapHighlight.css";

interface ActiveAutomatonForMiningProps {
  deposit: MineralDeposit;
};

type SpeedLevel = 1 | 2 | 3;
export type CapacityLevel = 1 | 2 | 3;

export function ActiveAutomatonForMining({
  deposit,
}: ActiveAutomatonForMiningProps) {
  const supabase = useSupabaseClient();
    const session = useSession();
  
  const { activePlanet } = useActivePlanet();

  const [userAutomaton, setUserAutomaton] = useState<Automaton | null>(null);
  const [roverIconUrl, setRoverIconUrl] = useState<string | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [miningInProgress, setMiningInProgress] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [countdownTime, setCountdownTime] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        if (!session?.user?.id || !activePlanet?.id) {
          throw new Error("User session or active planet is not available.");
        }

        const { data: automatonData, error: automatonError } = await supabase
        .from("inventory")
        .select("*")
        .eq("owner", session.user.id)
        .eq("item", 23)
        .eq("anomaly", activePlanet.id)
        .single();
      

        if (automatonError) {
          throw new Error(
            `Error fetching automaton data: ${automatonError.message}`
          );
        }

        const parsedAutomatonData: Automaton = {
          ...automatonData,
          configuration:
            automatonData.configuration as Automaton["configuration"], // Ensure proper typing
        };

        setUserAutomaton(parsedAutomatonData);

        const inventoryResponse = await fetch("/api/gameplay/inventory");
        if (!inventoryResponse.ok) {
          throw new Error(
            `Error fetching inventory items: ${inventoryResponse.statusText}`
          );
        }
        const inventoryData: InventoryItem[] = await inventoryResponse.json();
        setInventoryItems(inventoryData);

        const automatonItem = inventoryData.find(
          (item) => item.id === automatonData.item
        );
        if (automatonItem) {
          setRoverIconUrl(automatonItem?.gif ?? null);
        } else {
          throw new Error("Rover icon URL not found for the specified item.");
        }
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, supabase, activePlanet]);

  const handleSendRover = async () => {
    if (!userAutomaton) {
      setErrorMessage("No automaton available to perform mining.");
      return;
    }

    const speedLevel: SpeedLevel = userAutomaton.configuration?.Speed ?? 1;
    const capacityLevel: CapacityLevel =
      userAutomaton.configuration?.Capacity ?? 1;
    const powerLevel: number = userAutomaton.configuration?.Power ?? 1;

    const mineralName = deposit.mineralconfiguration.mineral;

    if (mineralName === "water" && powerLevel < 2) {
      setErrorMessage(
        "This automaton requires a Power level of 2 or greater to mine water. Please upgrade your automaton."
      );
      return;
    }

    if (deposit.mineralconfiguration.mineral === "21" && powerLevel < 2) {
      setErrorMessage(
        "This automaton requires a Power level of 2 or greater to mine water. Please upgrade your automaton."
      );
      return;
    }

    setMiningInProgress(true);
    setErrorMessage(null);

    const miningDurations: Record<SpeedLevel, number> = {
      1: 25000,
      2: 15000,
      3: 10000,
    };
    const miningDuration = miningDurations[speedLevel] || miningDurations[1];

    setCountdownTime(miningDuration);

    try {
      const item = inventoryItems.find(
        (invItem) => invItem.id.toString() === mineralName
      );

      if (!item) {
        throw new Error(
          `No item found in inventory for mineral: ${mineralName}`
        );
      }

      const deployTime = new Date().toISOString();
      const { error: updateInventoryError } = await supabase
        .from("inventory")
        .update({
          time_of_deploy: deployTime,
        })
        .eq("id", userAutomaton.id);

      if (updateInventoryError) {
        throw new Error(
          `Error updating rover deploy time: ${updateInventoryError.message}`
        );
      }

      setTimeout(async () => {
        try {
          const { data: mineralData, error: mineralError } = await supabase
            .from("mineralDeposits")
            .select("mineralconfiguration")
            .eq("id", deposit.id)
            .single();

          if (mineralError || !mineralData) {
            throw new Error(
              `Error fetching mineral deposit data: ${mineralError?.message}`
            );
          }

          const mineralConfig = mineralData.mineralconfiguration as {
            mineral: string;
            quantity: number;
          };

          if (mineralConfig.quantity <= 0) {
            throw new Error(`No quantity left for mineral: ${mineralName}`);
          }

          const haulQuantity = Math.min(mineralConfig.quantity, capacityLevel);
          const updatedQuantity = mineralConfig.quantity - haulQuantity;

          const { error: updateMineralError } = await supabase
            .from("mineralDeposits")
            .update({
              mineralconfiguration: {
                ...mineralConfig,
                quantity: updatedQuantity,
              },
            })
            .eq("id", deposit.id);

          if (updateMineralError) {
            throw new Error(
              `Error updating mineral deposit: ${updateMineralError.message}`
            );
          }

          const { data: existingInventory, error: inventoryError } =
            await supabase
              .from("inventory")
              .select("*")
              .eq("item", item.id)
              .eq("owner", session?.user?.id)
              .eq("anomaly", activePlanet?.id)
              .single();

          if (inventoryError && inventoryError.code !== "PGRST116") {
            throw new Error(
              `Error fetching inventory data: ${inventoryError.message}`
            );
          }

          if (existingInventory) {
            const { error: updateExistingInventoryError } = await supabase
              .from("inventory")
              .update({
                quantity: existingInventory.quantity + haulQuantity,
              })
              .eq("id", existingInventory.id);

            if (updateExistingInventoryError) {
              throw new Error(
                `Error updating inventory: ${updateExistingInventoryError.message}`
              );
            }
          } else {
            const { error: insertInventoryError } = await supabase
              .from("inventory")
              .insert({
                item: item.id,
                owner: session?.user?.id,
                quantity: haulQuantity,
                notes: `Created by rover ${userAutomaton.id}`,
                time_of_deploy: deployTime,
                anomaly: activePlanet?.id,
                configuration: null,
              });

            if (insertInventoryError) {
              throw new Error(
                `Error inserting inventory: ${insertInventoryError.message}`
              );
            }
          }

          const { error: clearDeployTimeError } = await supabase
            .from("inventory")
            .update({
              time_of_deploy: null,
            })
            .eq("id", userAutomaton.id);

          if (clearDeployTimeError) {
            throw new Error(
              `Error clearing rover deploy time: ${clearDeployTimeError.message}`
            );
          }

          console.log("Mineral collected and added to inventory.");
          console.log(`Successfully collected ${haulQuantity} ${mineralName}(s)!`);
          setMiningInProgress(false);
          setCountdownTime(null);
        } catch (error: any) {
          console.error("Error collecting mineral:", error.message);
          setErrorMessage(error.message);
          setMiningInProgress(false);
          setCountdownTime(null);
        }
      }, miningDuration);
    } catch (error: any) {
      console.error("Error collecting mineral:", error.message);
      setErrorMessage(error.message);
      setMiningInProgress(false);
      setCountdownTime(null);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (miningInProgress && countdownTime !== null && countdownTime > 0) {
      timer = setInterval(() => {
        setCountdownTime((prevTime) => {
          if (prevTime !== null && prevTime > 1000) {
            return prevTime - 1000;
          } else {
            clearInterval(timer!);
            return 0;
          }
        });
      }, 1000);
    } else if (!miningInProgress) {
      setCountdownTime(null);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [miningInProgress, countdownTime]);

  const formattedCountdown =
    countdownTime !== null ? Math.ceil(countdownTime / 1000) : 0;

  const handleConfigureAutomaton = () => {
    setIsConfiguring(true);
  };

  const handleSaveConfiguration = () => {
    setIsConfiguring(false);
  };

  if (loading) {
    return <div>Loading automaton and inventory data...</div>;
  }

  if (errorMessage) {
    return (
      <div className="p-4 border rounded-lg shadow-md bg-red-100 text-red-800">
        <p>Error: {errorMessage}</p>
      </div>
    );
  }

  if (!userAutomaton) {
    return (
      <div className="p-4 border rounded-lg shadow-md bg-yellow-100 text-yellow-800">
        <p>You don't have a rover/automaton available for mining.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white bg-opacity-82 overflow-hidden">
      {roverIconUrl && (
        <div className="relative h-32">
          <img
            src={roverIconUrl}
            alt="Rover Icon"
            className="w-32 h-32 absolute"
            style={{
              top: 0,
              left: 0,
              animation: "slide 4s infinite alternate ease-in-out",
              transform: "scaleX(-1)",
            }}
          />
        </div>
      )}
      {miningInProgress ? (
        <MapHighlight
          timeRemaining={formattedCountdown}
          distanceRemaining={30 * formattedCountdown}
          destinationName={deposit.mineralconfiguration.mineral}
          speed={5}
        />
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">Automaton Control</h2>
          <p className="text-sm mb-4">
            Rover ID: {userAutomaton.id} - Ready to collect{" "}
            <strong>{deposit.mineralconfiguration.mineral}</strong>
          </p>
          {userAutomaton && (
            <div>
              <h3>Configuration:</h3>
              <pre
                style={{
                  backgroundColor: "#f4f4f4",
                  padding: "10px",
                  borderRadius: "5px",
                  fontSize: "14px",
                  color: "#333",
                  overflowX: "auto",
                  maxWidth: "100%",
                }}
              >
                {JSON.stringify(userAutomaton.configuration, null, 2)}
              </pre>
            </div>
          )}
          <div className="flex space-x-4 mt-4">
            <button
              className={`block bg-[#85DDA2] text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                miningInProgress ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleSendRover}
              disabled={miningInProgress}
            >
              Deploy Rover
            </button>
            <button
              className="block bg-[#b3ebf2] text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={handleConfigureAutomaton}
            >
              Configure Automaton
            </button>
          </div>
          {isConfiguring && (
            <div className="my-3 mx-2">
              <AutomatonUpgrade
                inventoryId={userAutomaton.id}
                onSave={handleSaveConfiguration}
              />
            </div>
          )}
        </> 
      )}
    </div>
  );
};

export function AutomatonUpgrader() {
  const supabase = useSupabaseClient();
    const session = useSession();
  
  const { activePlanet } = useActivePlanet();

  const [automatons, setAutomatons] = useState<Automaton[]>([]);
  const [currentAutomatonIndex, setCurrentAutomatonIndex] = useState(0);
  const [roverIconUrl, setRoverIconUrl] = useState<string | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        if (!session?.user?.id || !activePlanet?.id) {
          throw new Error("User session or active planet is not available.");
        }

        const { data: automatonsData, error: automatonsError } = await supabase
          .from("inventory")
          .select("*")
          .eq("owner", session.user.id)
          .eq("item", 23)
          .eq("anomaly", activePlanet.id)
          .order("id", { ascending: true }); // Fetch and order automatons by id

        if (automatonsError) {
          throw new Error(
            `Error fetching automatons data: ${automatonsError.message}`
          );
        }

        const parsedAutomatonsData: Automaton[] = automatonsData.map((item: any) => ({
          ...item,
          configuration: item.configuration as Automaton["configuration"], // Ensure proper typing
        }));

        setAutomatons(parsedAutomatonsData);

        const inventoryResponse = await fetch("/api/gameplay/inventory");
        if (!inventoryResponse.ok) {
          throw new Error(
            `Error fetching inventory items: ${inventoryResponse.statusText}`
          );
        }
        const inventoryData: InventoryItem[] = await inventoryResponse.json();
        setInventoryItems(inventoryData);

        if (parsedAutomatonsData.length > 0) {
          const automatonItem = inventoryData.find(
            (item) => item.id === parsedAutomatonsData[0].item
          );
          if (automatonItem) {
            setRoverIconUrl(automatonItem?.gif ?? null);
          } else {
            throw new Error("Rover icon URL not found for the specified item.");
          }
        }
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
        setErrorMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, supabase, activePlanet]);

  const handleConfigureAutomaton = () => {
    setIsConfiguring(true);
  };

  const handleSaveConfiguration = () => {
    setIsConfiguring(false);
  };

  const handleNextAutomaton = () => {
    if (automatons.length > 1) {
      setCurrentAutomatonIndex((prevIndex) => (prevIndex + 1) % automatons.length);
      setRoverIconUrl(automatons[(currentAutomatonIndex + 1) % automatons.length]?.gif ?? null);
    }
  };

  const handlePreviousAutomaton = () => {
    if (automatons.length > 1) {
      setCurrentAutomatonIndex((prevIndex) => 
        (prevIndex - 1 + automatons.length) % automatons.length
      );
      setRoverIconUrl(automatons[(currentAutomatonIndex - 1 + automatons.length) % automatons.length]?.gif ?? null);
    }
  };

  if (loading) {
    return <div>Loading automaton and inventory data...</div>;
  }

  return (
    <div className="my-3 mx-2">
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
      {automatons.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            {/* <button onClick={handlePreviousAutomaton}>← Previous</button> */}
            <AutomatonUpgrade
              inventoryId={automatons[currentAutomatonIndex].id}
              onSave={handleSaveConfiguration}
            />
            {/* <button onClick={handleNextAutomaton}>Next →</button> */}
          </div>
        </div>
      ) : (
        <div>No automatons found.</div>
      )}
    </div>
  );
};

interface MapHighlightProps {
  distanceRemaining: number;
  timeRemaining: number;
  speed: number;
  destinationName: string;
};

function MapHighlight({
  distanceRemaining,
  timeRemaining,
  speed,
  destinationName,
}: MapHighlightProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pulseSize, setPulseSize] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const getRandomOffset = (range: number) => {
      return Math.random() * range - range / 2;
    };

    const drawWarpedTopographicRings = () => {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const layers = 15;
      const baseRadius = 25;

      for (let i = 1; i <= layers; i++) {
        const radius = i * baseRadius;
        const points = 29;

        ctx.beginPath();
        for (let j = 0; j < points; j++) {
          const angle = ((Math.PI * 2) / points) * j;
          const x = centerX + Math.cos(angle) * (radius + getRandomOffset(10));
          const y = centerY + Math.sin(angle) * (radius + getRandomOffset(10));

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }
    };

    const drawDestinationMarker = () => {
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(canvas.width * 0.7, canvas.height * 0.3, 5, 0, Math.PI * 2);
      ctx.fill();

      // Draw a small crater around the destination
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.beginPath();
      ctx.arc(canvas.width * 0.7, canvas.height * 0.3, 15, 0, Math.PI * 2);
      ctx.stroke();
    };

    // Initial draw (no animation loop)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawWarpedTopographicRings();
    drawDestinationMarker();

    const pulsateInterval = setInterval(() => {
      setPulseSize((prevSize) => (prevSize + 1) % 20);
    }, 50);

    return () => clearInterval(pulsateInterval);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-red-700 rounded-lg overflow-hidden shadow-lg">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={300}
          className="w-full h-auto"
        />
        <div
          className="absolute left-[70%] top-[30%] w-3 h-3 bg-white rounded-full"
          style={{
            boxShadow: `0 0 0 ${pulseSize}px rgba(255, 255, 255, 0.3)`,
          }}
        />
      </div>
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center text-white">
          <Battery className="w-6 h-6" />
          <span className="text-lg font-bold">170 km</span>
        </div>
        <h2 className="text-2xl font-bold text-white">MINING...</h2>
        <h1 className="text-4xl font-bold text-white">{destinationName}</h1>
        <div className="flex justify-between text-white">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            <span>{distanceRemaining} m</span>
          </div>
          <div className="flex items-center">
            <Rocket className="w-5 h-5 mr-2" />
            <span>{timeRemaining} s</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            <span>10:20 am</span>
          </div>
        </div>
      </div>
    </div>
  );
};