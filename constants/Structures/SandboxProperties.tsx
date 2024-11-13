import React from "react";
import AutomatonUpgrade from "@/components/Structures/Config/AutomatonUpgradeBox";
import { MineralDepositsNoAction } from "@/components/Structures/Mining/Archive/AvailableDeposits";
import AllAutomatonsOnActivePlanet from "@/components/Structures/Auto/AllAutomatons";
import { StarterTelescope } from "@/components/Projects/Telescopes/Transiting";
import { StarterLidar } from "@/components/Projects/Lidar/Clouds";
// import ClassificationViewer from "@/components/(classifications)/YourClassifications";
import { BeanIcon, BirdIcon, BookAIcon, BookAudioIcon, BookCopy, BookDashedIcon, BriefcaseMedical, CameraIcon, CaravanIcon, CloudCogIcon, CloudDrizzleIcon, CogIcon, ConstructionIcon, DogIcon, DotSquare, FishIcon, GemIcon, HeartIcon, LockIcon, MehIcon, MicroscopeIcon, PenBox, PhoneIcon, PickaxeIcon, PowerIcon, RssIcon, SaladIcon, StarIcon, SunIcon, SwitchCamera, TelescopeIcon, TestTubeDiagonal, TestTubeDiagonalIcon, TreePalmIcon, WebcamIcon } from "lucide-react";
import StructureRepair from "@/components/Structures/Config/RepairStructure";
import { RoverPhoto } from "@/components/Projects/Auto/Mars-Photos";
import { AnomalyRoverPhoto } from "@/components/Structures/Auto/AutomatonClassificationShell";
import ModernTechTree from "@/components/Structures/Research/TechTree";
import MiningScene from "@/app/scenes/mining/page";
import { DataSourcesModal } from "@/components/Data/unlockNewDataSources";
import { TelescopeSunspotDetector } from "@/components/Projects/Telescopes/Sunspots";
import { TelescopeDiskDetector } from "@/components/Projects/Telescopes/DiskDetector";
import LaunchpadStructure from "@/components/Structures/Launchpad/Dashboard";
import CameraComponent from "@/components/Projects/Zoodex/Upload/Camera";
import { PenguinWatch } from "@/components/Projects/Zoodex/penguinWatch";
import { PlanktonPortal, PlanktonPortalTutorial } from "@/components/Projects/Zoodex/planktonPortal";
import { BurrowingOwl } from "@/components/Projects/Zoodex/burrowingOwls";
import CloudUploadEarthCameraComponent from "@/components/Projects/Lidar/Upload/CloudCamera";

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

export const StructuresConfigForSandbox: StructureConfig = {
    3103: {
      name: "Transiting Telescope",
      labels: [
        {
          text: "Transit events", variant: "default",
        },
        {
          text: 'Meteorology data', variant: 'default',
        },
        {
          text: 'Orbital & Surface', variant: 'secondary',
        },
      ],
      imageSrc: '/assets/Items/TransitingTelescope.png',
    //   actions: [
    //     {
    //       icon: <BookAudioIcon className="w-6 h-6 text-[#5e81ac]" />,
    //       text: "My discoveries",
    //       dynamicComponent: <ClassificationViewer classificationType="planet" />,
    //     },
    //   ],
      buttons: [
        {
          icon: <TelescopeIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Discover planets",
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
      buttons: [
        {
            icon: <CameraIcon className="w-6 h-6 text-[#5e81ac]" />,
            text: "Capture animals",
            dynamicComponent: <CameraComponent />,
            sizePercentage: 60,
          },
        {
            icon: <BirdIcon className="w-6 h-6 text-[#5e81ac]" />,
            text: "Penguin Watch",
            dynamicComponent: <PenguinWatch />,
            sizePercentage: 60,
        },
        {
            icon: <FishIcon className="w-6 h-6 text-[#5e81ac]" />,
            text: "Plankton Portal",
            // dynamicComponent: <PlanktonPortal />,
            dynamicComponent: <PlanktonPortalTutorial anomalyId={"59875273"} />,
            sizePercentage: 60,
        },
        {
            icon: <BriefcaseMedical className="w-6 h-6 text-[#5e81ac]" />,
            text: "Burrowing Owls",
            dynamicComponent: <BurrowingOwl />,
            sizePercentage: 60,
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
          text: "Classify Martian clouds",
          dynamicComponent: <StarterLidar />,
          sizePercentage: 60,
        },
        {
            icon: <CloudDrizzleIcon className="w-6 h-6 text-[#5e81ac]" />,
            text: "Upload clouds you see",
            dynamicComponent: <CloudUploadEarthCameraComponent />,
            sizePercentage: 70,
        },
      ],
    },
};