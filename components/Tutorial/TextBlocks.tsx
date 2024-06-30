"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { TellUsWhatYouThinkClassification } from "@/Classifications/ClassificationForm";

interface ActivePlanetContextValue {
    activePlanet: UserPlanetData | null;
    setActivePlanet: (planet: UserPlanetData | null) => void;
};

export interface UserStructure {
    id: string;
    item: number;
    name: string;
    icon_url: string;
    description: string;
    // Function (what is executed upon click)
};

export interface UserPlanetData {
    id: string;
    content: string;
    ticId: string;
    type: string;
    radius: number;
    mass: number;
    density: number;
    gravity: number;
    temperatureEq: number;
    temperature: number;
    smaxis: number;
    orbital_period: number;
    classification_status: string;
    avatar_url: string;
    created_at: string;
    deepnote: string;
    starSystems: number;
    Faction: number;
    lightkurve: string;
};

export default function TutorialText() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [missionCompletionStatus, setMissionCompletionStatus] = useState(new Map());
    const [userInventory, setUserInventory] = useState(new Set());
    const [userUtilityStructures, setUserUtilityStructures] = useState(new Set());

    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    // async function fetchUserUtilityStructures() {
    //     if (session && activePlanet) {
    //       try {
    //         const { data, error } = await supabase
    //           .from("inventory")
    //           .select("item")
    //           .eq("owner", session.user.id)
    //           .eq("anomaly", activePlanet.id)
    //           .eq("item", 33)
  
    //         if (error) {
    //           console.error("Error fetching user utility structures: ", error.message);
    //           return;
    //         };
  
    //         const utilityStructureSet = new Set(data.map((item) => item.item));
    //         setUserUtilityStructures(utilityStructureSet);
    //       } catch (error: any) {
    //         console.error("Error fetching user utility structures: ", error.message);
    //       };
    //     };
    // };

    useEffect(() => {
        const fetchMissionCompletionStatus = async () => {
          if (session) {
            try {
              const { data, error } = await supabase
                .from('missions')
                .select('mission')
                .eq('user', session.user.id);
    
              if (error) {
                console.error('Error fetching missions:', error.message);
                return;
              }
    
              const missionStatusMap = new Map();
              data.forEach((mission) => {
                missionStatusMap.set(mission.mission, true);
              });
    
              setMissionCompletionStatus(missionStatusMap);
            } catch (error: any) {
              console.error('Error fetching mission completion status:', error.message);
            }
          }
        };
    
        const fetchUserInventory = async () => {
          if (session && activePlanet) {
            try {
              const { data, error } = await supabase
                .from('inventory')
                .select('item')
                .eq('owner', session.user.id)
                .eq('anomaly', activePlanet.id);
    
              if (error) {
                console.error('Error fetching user inventory:', error.message);
                return;
              }
    
              const inventorySet = new Set(data.map((item) => item.item));
              setUserInventory(inventorySet);
            } catch (error: any) {
              console.error('Error fetching user inventory:', error.message);
            };
          };
        };
    
        fetchMissionCompletionStatus();
        fetchUserInventory();
        // fetchUserUtilityStructures();
    }, [session, supabase, activePlanet]);

    const renderTextualInformation = () => {
        if (!missionCompletionStatus.has(1)) {
            return (
                <p>Start your journey here. Choose a planet (by clicking on it) that you think looks fun and interesting. You'll start building your base and discovering the planet as you go, and you'll be able to visit other planets later</p>
            );
        // } else if (!missionCompletionStatus.has(2)) {
        //     return (
        //         <p>Mission 2 (Profile) - we're moving this</p>
        //     );
        // } else if (!missionCompletionStatus.has(3)) {
        //     return (
        //         <p>Start exploring your planet: Click on your spacecraft here and pilot it to your new home. You'll then be able to start building and exploring your surroundings</p>
        //     );
        } else if (!missionCompletionStatus.has(4)) {
            return (
                <div>
                    <p>Structures are tools for exploring the planet and discovering their vast ecosystems. You've been given a special tool that allows you to build robots. Click on the deploy button below its icon to place it on your planet and begin your journey!</p>
                    <br />
                    <p>Please note you'll need to refresh the tab/page to continue</p>
                </div>
            );
        } else if (!missionCompletionStatus.has(5)) {
            return (
                <div>
                    <p>Click on the Vehicle Structure to build your first automaton rover. These little critters explore the planet for you and collect resources! You'll need to collect some resources to build your first telescope, so click this button to build your first one!</p>
                </div>
            );
        } else if (!missionCompletionStatus.has(6)) {
            return (
                <div>
                    <p>You've built your first rover, nicely done!  He has found a mineral deposit already! Click on his picture to send him out to collect the resources</p>
                </div>
            );
        } else if (!missionCompletionStatus.has(7)) {
            return (
                <div>
                    <p>
                        You can now upgrade your existing telescope to receive transit information, allowing you to discover different planets and validate your own. Click the "Craft Structure" button to complete the upgrade using the resources you just collected
                    </p>
                </div>
            );
        } else if (!missionCompletionStatus.has(8)) {
            return (
                <div>
                    <p>
                        Great work. Now that your telescope has been upgraded, you can click on the new module (the "Transiting Telescope") which will show you some data it's collected about your home planet. We'll walk you through the process of validating its existence as a planet in real life
                    </p>
                </div>
            );
        } else if (!missionCompletionStatus.has(10)) {
            return (
                <div>
                    <p>
                        So it's up to you what you'd like to do next. Later on, your telescope will be able to collect data from other far away planets and you'll be able to make more classifications, so if you're just here to discover planets you've got everything you need. If you'd like, click on one of the arrow keys at the top of the screen to fly to another planet and begin building another base there - you can always return here, anytime! If you'd like to discover more things here, like clouds and wildlife, you'll need to dig up some more resources, quickly. Fortunately, there's a tool for that - the mining station! Get your automaton to collect some more coal and you'll be able to build a new mining station.
                    </p>
                </div>
            )
        } else if (!userInventory.has(26)) {
            return (
                <div>
                    <p>
                        Your new mining station has found a mineral deposit again! Click on it and activate it to mine some more coal. The mining station works a lot faster so you will only have to keep it turned on for a couple of seconds! Once you've done that, you'll be able to create a Meteorology tool that will allow you to classify cloud data from your planet!
                    </p>
                </div>
            )
        } else if (userInventory.has(26) && !missionCompletionStatus.has(13)) {
            return (
                <div>
                    <p>
                        Click on your meteorology tool (you may have to click on the arrows next to your structure to see it) and tell us what you think of the cloud. For now, just describe the shape and colours you see. There's no wrong answers!
                    </p>
                </div>
            )
        } else if (!missionCompletionStatus.has(14) && !userInventory.has(28)) {
            return (
                <div>
                    <p>
                        If you'd like, you can upgrade your rovers so they can return pictures of their journeys for you. You can even write little posts about them and share the photos so others can see what your rovers are discovering (note: these photos are REAL pictures from the Mars Rovers). Craft a "Camera module" for your rovers to get started
                    </p>
                </div>
            )
        } else if (!missionCompletionStatus.has(18) && userInventory.has(28) && !userInventory.has(32)) {
            return (
                <div>
                    <p>
                        Great work - now your rovers can take pictures. But they can't send their awesome discoveries to you, and you can't write any posts. Create a Camera Receiver station now to fix this
                    </p>
                </div>
            )
        } else if (!missionCompletionStatus.has(18) && userInventory.has(32)) {
            return (
                <div>
                    <p>
                        Your rovers have been busy, they've already sent you a few photos to look at! Click on the camera station in your structures, and collect an image that looks interesting. Once you've done this, if you'd like, you can write a post about it!
                    </p>
                </div>
            )
        } else if (missionCompletionStatus.has(18)) {
            return (
                <div>
                    <p>
                        You've now finished the tutorial (for the first pre-release). Continue mining, exploring and feel free to click the arrow buttons at the top of the page to jump to other planets and begin your journey there. We're releasing weekly updates and would love to hear your thoughts. Tell us what you think here:
                    </p>
                    <div className="bg-white">
                        <TellUsWhatYouThinkClassification />
                    </div>
                </div>
            )
        // } else if (!missionCompletionStatus.has(20)) {
            // return (
            //     <div>
            //         <p>
            //             You can go back into your telescope or meteorology tool anytime and make more classifications, but you can also now create a surveyor module. Using this module, you can help astronomers determine properties for the planet like its gravity!
            //         </p>
            //     </div>
            // )
        } else if (missionCompletionStatus.has(21)) {
            return (
                <>You've done it!</>
            )
        } else {
            return (
                <>No missions</>
            );
        };
    };

    return (
        <div className="px-4 py-4 rounded-lg shadow-lg">
            <div className="text-white bg-opacity-30 bg-black p-4 rounded-lg font-sans tracking-wide leading-relaxed">
                {renderTextualInformation()}
                <br />
                <br />
                <br />
                <br />
                {/* (Please remember you may have to refresh the page if things don't change quickly. This is to reduce load on our servers while we are in these early stages) */}
            </div>
        </div>
    );
};