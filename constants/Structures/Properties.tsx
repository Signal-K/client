import React from "react";
import { MiningScene } from "@/app/components/(structures)/Mining/MiningPanels";
import { AutomatonUpgrader } from "@/app/components/(vehicles)/(automatons)/ActiveAutomaton";
import { MineralDepositsNoAction } from "@/app/components/(structures)/Mining/AvailableDeposits";
import AllAutomatonsOnActivePlanet from "@/app/components/(vehicles)/(automatons)/AllAutomatons";
import { StarterTelescope } from "@/app/components/(structures)/Telescopes/Transiting";
import { StarterLidar } from "@/app/components/(structures)/Lidar/Clouds";
import ClassificationViewer from "@/app/components/(create)/(classifications)/YourClassifications";
import { StarterZoodex } from "@/app/components/(structures)/Zoodex/ClassifyOthersAnimals";
import { BeanIcon, BookAIcon, BookCopy, BookDashedIcon, CaravanIcon, CloudCogIcon, CogIcon, ConstructionIcon, DogIcon, DotSquare, GemIcon, HeartIcon, LockIcon, MehIcon, PenBox, PickaxeIcon, PowerIcon, RssIcon, SaladIcon, SwitchCamera, TelescopeIcon, TestTubeDiagonalIcon, WebcamIcon } from "lucide-react";
import StructureRepair from "@/app/components/(structures)/Config/RepairStructure";
import { RoverPhoto } from "@/app/components/(anomalies)/(data)/Mars-Photos";
import { AnomalyRoverPhoto } from "@/app/components/(structures)/Auto/AutomatonClassificationShell";

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
        {
          icon: <PenBox className="w-6 h-6 text-[#5e81ac]" />,
          text: "My discoveries",
          dynamicComponent: <ClassificationViewer classificationType="roverImg" />,
          sizePercentage: 75,
        },
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
        // Copy action/labels
      ],
      buttons: [
        {
          icon: <TelescopeIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Transit events (Starter)",
          dynamicComponent: <StarterTelescope />,
          sizePercentage: 90,
          showInNoModal: true,
        },
        {
          icon: <CloudCogIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Cloud/Weather Data (LOCKED)",
        },
        {
          icon: <PenBox className="w-6 h-6 text-[#5e81ac]" />,
          text: "My discoveries",
          dynamicComponent: <ClassificationViewer classificationType="planet" />,
          sizePercentage: 75,
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
      ],
      buttons: [
        {
          icon: <DogIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Search your animals",
          dynamicComponent: <StarterZoodex />,
          sizePercentage: 60,
        },
        {
          icon: <PenBox className="w-6 h-6 text-[#5e81ac]" />,
          text: "My discoveries",
          dynamicComponent: <ClassificationViewer classificationType="zoodex-burrowingOwl" />,
          sizePercentage: 75,
        },
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
      imageSrc: '/assets/Items/Lidar.png',
      buttons: [
        {
          icon: <CloudCogIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Search your clouds",
          dynamicComponent: <StarterLidar />,
          sizePercentage: 60,
        },
        {
          icon: <PenBox className="w-6 h-6 text-[#5e81ac]" />,
          text: "My discoveries",
          dynamicComponent: <ClassificationViewer classificationType="cloud" />,
          sizePercentage: 75,
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
        },
        {
          icon: <BookAIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Decrypt manuscripts",
        },
      ],
    },
};