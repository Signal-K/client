import React from "react";
import { AutomatonUpgrader } from "@/app/components/(vehicles)/(automatons)/ActiveAutomaton";
import { MineralDepositsNoAction } from "@/app/components/(structures)/Mining/AvailableDeposits";
import AllAutomatonsOnActivePlanet from "@/app/components/(vehicles)/(automatons)/AllAutomatons";
import { StarterTelescope } from "@/app/components/(structures)/Telescopes/Transiting";
import { StarterLidar } from "@/app/components/(structures)/Lidar/Clouds";
import ClassificationViewer from "@/app/components/(create)/(classifications)/YourClassifications";
import { StarterZoodex, StarterZoodexGallery } from "@/app/components/(structures)/Zoodex/ClassifyOthersAnimals";
import { BeanIcon, BookAIcon, BookAudioIcon, BookCopy, BookDashedIcon, CaravanIcon, CloudCogIcon, CogIcon, ConstructionIcon, DogIcon, DotSquare, GemIcon, HeartIcon, LockIcon, MehIcon, MicroscopeIcon, PenBox, PhoneIcon, PickaxeIcon, PowerIcon, RssIcon, SaladIcon, StarIcon, SunIcon, SwitchCamera, TelescopeIcon, TestTubeDiagonal, TestTubeDiagonalIcon, TreePalmIcon, WebcamIcon } from "lucide-react";
import StructureRepair from "@/app/components/(structures)/Config/RepairStructure";
import { RoverPhoto } from "@/app/components/(anomalies)/(data)/Mars-Photos";
import { AnomalyRoverPhoto } from "@/app/components/(structures)/Auto/AutomatonClassificationShell";
import { AdvancedTechTreeComponent } from "@/app/components/(structures)/Research/TechTree";
import MiningScene from "@/app/scenes/mining/page";
import { DataSourcesModal } from "@/app/components/(structures)/Data/unlockNewDataSources";
import MissionsForStructure from "@/app/components/(structures)/Missions/AvailableMissions";
import { TelescopeSunspotDetector } from "@/app/components/(structures)/Telescopes/Sunspots";
import { TelescopeDiskDetector } from "@/app/components/(structures)/Telescopes/DiskDetector";
import LaunchpadStructure from "@/app/components/(structures)/Launchpad/Dashboard";
import { PlanetSwitcher } from "@/app/components/(scenes)/planetScene/SwitchPlanet";

interface IndividualStructureProps {
    name?: string;
    title?: string;
    labels: { text: string; variant: "default" | "secondary" | "destructive"; }[];
    imageSrc: string;
    actions?: {
      icon: React.ReactNode;
      text: string;
      dynamicComponent?: React.ReactNode;
      sizePercentage?: number;
    }[];
    buttons: {
      icon: React.ReactNode;
      text: string;
      dynamicComponent?: React.ReactNode;
      sizePercentage?: number;
      showInNoModal?: boolean;
    }[];
    onActionClick?: (action: string) => void;
    onClose?: () => void;
    structureId?: number;
};

type StructureConfig = {
    [key: string]: Omit<IndividualStructureProps, 'onActionClick' | 'onClose'>;
};

export const StructuresConfig: StructureConfig = {
    3102: {
      name: "Automaton station",
      title: "Roovers",
      labels: [
        { text: "Ethereal", variant: "default" },
        { text: "Magical", variant: "secondary" },
        { text: "Dense", variant: "destructive" },
      ],
      imageSrc: "/forest.svg",
      actions: [
        { icon: <PickaxeIcon className="w-6 h-6 text-[#5e81ac]" />, text: "Explore" },
        { icon: <CogIcon className="w-6 h-6 text-[#5e81ac]" />, text: "Repair", dynamicComponent: <StructureRepair inventoryId={3102} /> },
        {
          icon: <MicroscopeIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Research",
          dynamicComponent: <DataSourcesModal structureId="3102" structure="Rover" />,
        },
        // {
        //   icon: <MehIcon className="w-6 h-6 text-[#5e81ac]" />,
        //   text: "Available missions",
        //   dynamicComponent: <MissionsForStructure structureItemId={3102} />,
        // },
        {
          icon: <BookAudioIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "My discoveries",
          dynamicComponent: <ClassificationViewer classificationType="roverImg" />,
        },
      ],
      buttons: [
        { 
          icon: <CaravanIcon className="w-6 h-6 text-[#5e81ac]" />, 
          text: "My Automatons", 
          dynamicComponent: <AllAutomatonsOnActivePlanet />,
          sizePercentage: 30,
        },
        { 
          icon: <CogIcon className="w-6 h-6 text-[#5e81ac]" />, 
          text: "Upgrade your (base) automaton",
          dynamicComponent: <AutomatonUpgrader />,
          sizePercentage: 55,
        },
        {
          icon: <PickaxeIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: `Go mining`,
          dynamicComponent: <MiningScene />,
          sizePercentage: 73,
        },
        {
          icon: <SwitchCamera className="w-6 h-6 text-[#5e81ac]" />,
          text: 'View rover photos',
          dynamicComponent: <AnomalyRoverPhoto />,
          sizePercentage: 73,
        },
        // {
        //   icon: <BookCopy className="w-6 h-6 text-[#5e81ac]" />, text: `Tutorial`,
        //   dynamicComponent: <p></p>,
        //   sizePercentage: 60,
        //   showInNoModal: false,
        // },
      ],
    },
    3103: {
      name: "Transiting Telescope",
      labels: [
        {
          text: "Transit events", variant: "default",
        },
        {
          text: 'Meteorology data', variant: 'default', // Combine styling/content with actions
        },
        {
          text: 'Orbital & Surface', variant: 'secondary', // structure types
        },
      ],
      imageSrc: '/assets/Items/TransitingTelescope.png',
      actions: [
        {
          icon: <DotSquare className="w-6 h-6 text-[#5e81ac]" />
          , text: 'Durability/Repair'
          , dynamicComponent: <StructureRepair inventoryId={3103} />,
          sizePercentage: 40,
        },
        {
          icon: <MicroscopeIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Research",
          dynamicComponent: <DataSourcesModal structureId="3103" structure="Telescope" />,
        },
        // {
        //   icon: <MehIcon className="w-6 h-6 text-[#5e81ac]" />,
        //   text: "Available missions",
        //   dynamicComponent: <MissionsForStructure structureItemId={3103} />,
        // },
        {
          icon: <BookAudioIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "My discoveries",
          dynamicComponent: <ClassificationViewer classificationType="planet" />,
        },
        // Copy action/labels
      ],
      buttons: [
        {
          icon: <TelescopeIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Discover planets", // Transit events, microlensing, etc
          dynamicComponent: <StarterTelescope />,
          sizePercentage: 90,
          showInNoModal: true,
        },
        {
          icon: <SunIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Sunspot data",
          dynamicComponent: <TelescopeSunspotDetector />,
          sizePercentage: 80,
        },
        {
          icon: <TestTubeDiagonalIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Find early solar systems",
          dynamicComponent: <TelescopeDiskDetector />,
          sizePercentage: 80,
        },
        {
          icon: <StarIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Comets & Asteroids",
        },
      ],
    },
    3104: {
      name: "Zoodex",
      title: "Animal Observations",
      labels: [
        {
          text: "Earth-based animals", variant: "default",
        },
      ],
      imageSrc: '/assets/Items/Zoodex.png',
      actions: [
        {
          icon: <DotSquare className="w-6 h-6 text-[#5e81ac]" />
          , text: 'Durability/Repair'
          , dynamicComponent: <StructureRepair inventoryId={3104} />,
          sizePercentage: 40,
        },
        {
          icon: <MicroscopeIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Research",
          dynamicComponent: <DataSourcesModal structureId="3104" structure="Zoodex" />,
        },
        // {
        //   icon: <MehIcon className="w-6 h-6 text-[#5e81ac]" />,
        //   text: "Available missions",
        //   dynamicComponent: <MissionsForStructure structureItemId={3104} />,
        // },
        {
          icon: <BookAudioIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "My discoveries",
          dynamicComponent: <ClassificationViewer classificationType="zoodex-burrowingOwl" />,
        },
      ],
      buttons: [
        {
          icon: <DogIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Classify animals",
          // dynamicComponent: <StarterZoodex />,
          dynamicComponent: <StarterZoodexGallery />,
          sizePercentage: 60,
        },
        // {
        //   icon: <TreePalmIcon className="w-6 h-6 text-[#5e81ac]" />,
        //   text: "Greenhouse",
        // },
        // {
        //   icon: <PhoneIcon className="w-6 h-6 text-[#5e81ac]" />,
        //   text: "Upload media"
        // }
      ],
    },
    3105: {
      name: "LIDAR Detector",
      labels: [
        {
          text: "Clouds", variant: "default",
        },
        {
          text: "Sunspots", variant: "default",
        },
      ],
      actions: [
        {
          icon: <DotSquare className="w-6 h-6 text-[#5e81ac]" />
          , text: 'Durability/Repair'
          , dynamicComponent: <StructureRepair inventoryId={3104} />,
          sizePercentage: 40,
        },
        {
          icon: <MicroscopeIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Research",
          dynamicComponent: <DataSourcesModal structureId="3105" structure="LIDAR" />,
        },
        // {
        //   icon: <MehIcon className="w-6 h-6 text-[#5e81ac]" />,
        //   text: "Available missions",
        //   dynamicComponent: <MissionsForStructure structureItemId={3105} />,
        // },
        {
          icon: <BookAudioIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "My discoveries",
          dynamicComponent: <ClassificationViewer classificationType="lidar" />,
        },
      ],
      imageSrc: '/assets/Items/Lidar.png',
      buttons: [
        {
          icon: <CloudCogIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Search your clouds",
          dynamicComponent: <StarterLidar />,
          sizePercentage: 60,
        },
      ],
    },
    3106: {
      name: "Research station",
      labels: [
        {
          text: "Technology", variant: "destructive",
        },
        {
          text: "Alien artifacts", variant: "secondary",
        },
      ],
      imageSrc: '/assets/Items/Research.png',
      buttons: [
        {
          icon: <TestTubeDiagonalIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Research technology",
          dynamicComponent: <AdvancedTechTreeComponent />,
          sizePercentage: 85,
        },
        {
          icon: <BookAIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Decrypt manuscripts",
        },
      ],
    },
    3107: {
      name: "Launchpad",
      title: "Rocket Launchpad",
      labels: [
        {
          text: "Manned Vehicles",
          variant: "default",
        },
      ],
      imageSrc: '/assets/Items/Launchpad.jpg',
      actions: [
        {
          icon: <CogIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Repair",
          dynamicComponent: <StructureRepair inventoryId={3107} />,
        },
      ],
      buttons: [
        {
          icon: <CaravanIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Build a rocket",
        },
        {
          icon: <PowerIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Launch a rocket (travel)",
          // dynamicComponent: <LaunchpadStructure />,
          dynamicComponent: <PlanetSwitcher />,
          sizePercentage: 40,

        },
      ]
    },
    10600: {
      name: "Helicopter (test)",
      labels: [],
      imageSrc: '/assets/Items/Helicopter.png',
      buttons: [
        {
          icon: <TestTubeDiagonal className="w-6 h-6 text-[#5e81ac]" />,
          text: "Test",
        },
      ],
    },
};