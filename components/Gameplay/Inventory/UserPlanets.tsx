"use client"

import { useEffect, useState, useRef, Fragment, createContext } from "react";
import { useActivePlanet } from "@/context/ActivePlanet";

import { AllAutomatons, SingleAutomaton, SingleAutomatonCraftItem } from "./Automatons/Automaton";
import { PlanetGrid, ResponsiveLayout } from "@/components/Onboarding";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { ProfileCard } from "@/auth/UserProfileFields";
import UserItemsUndeployed from "./InactiveItems";
import { AllStructures } from "./Structures/Structure";
import CraftStructure from "./Actions/CraftStructure";
import UserAnomaliesComponent from "@/components/Content/Anomalies/YourAnomalies";
import ExampleComponent from "./Structures/structure-borderline";
import TravelBuddy from "@/components/Utilities/TravelBuddy";
import SpacecraftButton from "./Structures/Vehicles/Spacecraft";
import { SidebarLayout } from "@/app/layout";
import TutorialText from "@/components/Tutorial/TextBlocks";
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

// View structures, planet info & automatons
const UserPlanetPage = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  
  const { activePlanet } = useActivePlanet() || {};
  
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

  async function fetchUserUtilityStructures() {
    if (session && activePlanet) {
      try {
        const { data, error } = await supabase
          .from("inventory")
          .select("item")
          .eq("owner", session.user.id)
          .eq("anomaly", activePlanet.id)
          .eq("item", 33) // Update this to use the `/gameplay/inventory` api `route.ts`

        if (error) {
          console.error("Error fetching user utility structures: ", error.message);
          return;
        };

        const utilityStructureSet = new Set(data.map((item) => item.item));
        setUserUtilityStructures(utilityStructureSet);
      } catch (error: any) {
        console.error("Error fetching user utility structures: ", error.message);
      };
    };
  };

  useEffect(() => {
    fetchMissionCompletionStatus();
    fetchUserInventory();
    fetchUserUtilityStructures();
  }, [session, supabase, activePlanet]);

  const renderContent = () => {
    if (!missionCompletionStatus.has(1)) {
      return <PlanetGrid />;
    } else if (!missionCompletionStatus.has(4)) {
      return (
        <>
          <UserItemsUndeployed />
          <AllStructures />
        </>
      );
    } else if (!missionCompletionStatus.has(5)) {
      return <AllStructures />;
    } else {
      return (
        <>
          <AllStructures />
          {!missionCompletionStatus.has(7) && (
            <center><CraftStructure structureId={14} /></center>
          )}
          {!missionCompletionStatus.has(8) && missionCompletionStatus.has(7) && (
            <></>
          )}
        </>
      );
    }
  };

  const renderAutomatonContent = () => {
    if (!missionCompletionStatus.has(4)) {
      return <>No automatons</>;
    } else if (missionCompletionStatus.has(21)) {
      return <>
        <AllAutomatons />
        {/* <SpacecraftButton /> */}
      </>;
    } else if (missionCompletionStatus.has(9)) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SingleAutomaton />
          {/* <SpacecraftButton /> */}
        </div>
      );
    } else if (missionCompletionStatus.has(8)) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SingleAutomatonCraftItem craftItemId={30} />
          {/* <SpacecraftButton /> */}
        </div>
      );
    } else {
      return <AllAutomatons />;
    }
  };
  
  const renderUtilitiesContext = () => {
    if (missionCompletionStatus.has(21)) {
      return (
        <> {/* Show launchpad here maybe? */}
          <TravelBuddy />
        </>
      );
    } else if (missionCompletionStatus.has(8) && !userInventory.has(30)) {
      return (
        <>
          {!userInventory.has(26) && <CraftStructure structureId={30} />}
        </>
      );
    } else  if (missionCompletionStatus.has(13)) {
      return (
        <>
          {/* <DeleteMineralsAtEndOfMission /> */}
          {/* {!userInventory.has(31) && <CraftStructure structureId={31} />}
          {/* {!userInventory.has(24) && <CraftStructure structureId={24} />}
          {!userInventory.has(32) && <CraftStructure structureId={32} />} */}
          {!userInventory.has(28) && <CraftStructure structureId={28} />}
          {!userInventory.has(32) && <CraftStructure structureId={32} />}
        </>
      );
    } else if (missionCompletionStatus.has(8) && userInventory.has(30)) {
      return (
        <>
          {!userInventory.has(26) && <CraftStructure structureId={26} />}
        </>
      );
    } else if (missionCompletionStatus.has(18)) {
      return (
        <>
          <div>
            <TellUsWhatYouThinkClassification />
          </div>
        </>
      );
    } else {
      return (
        <>
          {!userInventory.has(31) && <CraftStructure structureId={31} />}
          {/* {!userInventory.has(24) && <CraftStructure structureId={24} />} */}
          {!userInventory.has(32) && <CraftStructure structureId={32} />}
        </>
      );
    };
  };

  const interactablesContentContainer = () => {
    if (session) {
      return (
        <>
          <div className="hidden md:grid md:grid-cols-1 md:grid-rows-3 md:gap-4 md:relative md:h-full">
            <div className="md:row-span-1 md:col-span-8 md:flex md:items-center md:justify-center p-4"> 
              {renderContent()}
            </div>
            <div className="md:row-span-1 md:col-span-5 md:flex md:items-center md:justify-center">{renderUtilitiesContext()}</div> 
            <div className="md:row-span-1 md:col-span-5 md:flex md:items-center md:justify-center p-2 mb-12"> 
              {renderAutomatonContent()}
            </div>
          </div>

          <div className="grid grid-cols-1 grid-rows-auto gap-4 md:hidden relative min-h-screen">
            <div className="col-span-1 flex justify-center items-end pb-5">
              {renderContent()}
            </div>
            {/* <div>{renderUtilitiesContext() }</div> */}
            <div className="col-span-1 flex justify-center items-end pb-5">
              {renderAutomatonContent()}
            </div>
          </div>
        </>
      );
    };
  };

  return (
    <SidebarLayout leftContent={<><TutorialText /></>} middleContent={interactablesContentContainer()} />
  );
};  

export default UserPlanetPage;
