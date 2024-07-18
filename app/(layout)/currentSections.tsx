import { AllStructures } from "@/components/Gameplay/Inventory/Structures/Structure";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import UserStructures from "../(structures)/StructureModal";
import TutorialText from "@/components/Tutorial/TextBlocks";
import CraftStructure from "@/components/Gameplay/Inventory/Actions/CraftStructure";
import TravelBuddyButton from "@/components/Utilities/TravelBuddy";
import { AllAutomatons, SingleAutomaton } from "@/components/Gameplay/Inventory/Automatons/Automaton";
import UserItemsUndeployed from "@/components/Gameplay/Inventory/InactiveItems";
import { PlanetGrid } from "@/components/Onboarding";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { TellUsWhatYouThinkClassification } from "@/Classifications/ClassificationForm";
import NavigationMenu from "./navigation/pogo-menu";

export function Panels() {
    const [isMiddleHovered, setIsMiddleHovered] = useState(false);
    const [maximizedSection, setMaximizedSection] = useState<null | string>(null);

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
          console.error('Error fetching missions: ', error.message);
          return;
        };

        const missionStatusMap = new Map();
        data.forEach((mission) => {
          missionStatusMap.set(mission.mission, true);
        });

        setMissionCompletionStatus(missionStatusMap);
      } catch (error: any) {
        console.error('Error fetching mission completion status:', error.message);
      };
    };
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
      </>;
    } else if (missionCompletionStatus.has(9)) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SingleAutomaton />
        </div> 
      );
    } else if (missionCompletionStatus.has(8)) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SingleAutomaton structureId={30} />
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
          <TravelBuddyButton />
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
  
    return (
      <div className="flex h-screen flex-col">
        {!isModalOpen && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="relative flex-1 overflow-hidden bg-primary-foreground transition-all duration-300">
              <div className="absolute top-4 right-4 z-10">
                {/* <Button variant="ghost" size="icon" onClick={() => openModal('section1')}>
                  <MaximizeIcon className="h-6 w-6" /> 
                </Button> */}
              </div>
              <div className="flex h-full items-center justify-center p-8">
                <div className="space-y-4 text-center">
                    {renderContent()}
                </div>
              </div>
            </div>
            <div
              className={`relative flex-1 overflow-hidden bg-secondary-foreground transition-all duration-300 group ${isMiddleHovered ? 'flex-[2]' : 'flex-[0.5]'}`}
              onMouseEnter={() => setIsMiddleHovered(true)}
              onMouseLeave={() => setIsMiddleHovered(false)}
              onClick={() => setIsMiddleHovered(true)}
            >
              <div className="absolute top-4 right-4 z-10">
                {/* <Button variant="ghost" size="icon" onClick={() => openModal('section2')}>
                  <MaximizeIcon className="h-6 w-6" />
                </Button> */}
              </div>
              <div className="flex h-full items-center justify-center p-8">
                <div className="space-y-4 text-center">
                    {renderUtilitiesContext()} <br />
                  <TutorialText />
                </div>
              </div>
            </div>
            <div className="relative flex-1 overflow-hidden bg-muted-foreground transition-all duration-300">
              <div className="absolute top-4 right-4 z-10">
                {/* <Button variant="ghost" size="icon" onClick={() => openModal('section3')}>
                  <MaximizeIcon className="h-6 w-6" />
                </Button> */}
              </div>
              <div className="flex h-full items-center justify-center p-8">
                <div className="space-y-4 text-center">
                    {renderAutomatonContent()}
                    <NavigationMenu />
                </div>
              </div>
            </div>
          </div>
        )}
  
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
              className="bg-white w-[95%] h-[95%] rounded-lg p-6 transform transition-transform duration-300"
              style={{ transform: isModalOpen ? 'scale(1)' : 'scale(0.95)' }}
            >
              <div className="flex justify-end">
                <Button variant="ghost" size="icon" onClick={closeModal}>
                  <CloseIcon className="h-6 w-6" />
                </Button>
              </div>
              <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">
                  {maximizedSection === 'section1' ? 'Section 1' : maximizedSection === 'section2' ? 'Section 2' : 'Section 3'}
                </h2>
                <p>
                  {maximizedSection === 'section1'
                    ? 'Structures will go here.'
                    : maximizedSection === 'section2'
                    ? 'Tutorial info could go here?'
                    : 'Automatons will go here'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

function MaximizeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}


function CloseIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    );
  }