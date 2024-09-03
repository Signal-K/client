import React, { useEffect, useState } from "react";
import AutomatonUpgrade from "@/app/components/(structures)/Config/AutomatonUpgradeBox";
import { MiningScene } from "@/app/components/(structures)/Mining/MiningPanels";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { BeanIcon, CaravanIcon, CloudCogIcon, CogIcon, ConstructionIcon, GemIcon, HeartIcon, LockIcon, MehIcon, PickaxeIcon, PowerIcon, RssIcon, SaladIcon, TelescopeIcon, WebcamIcon } from "lucide-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { AutomatonUpgrader } from "@/app/components/(vehicles)/(automatons)/ActiveAutomaton";
import MineralDeposits, { MineralDepositsNoAction } from "@/app/components/(structures)/Mining/AvailableDeposits";
import AllAutomatonsOnActivePlanet from "@/app/components/(vehicles)/(automatons)/AllAutomatons";

interface IndividualStructureProps {
    name?: string;
    title?: string;
    labels: { text: string; variant: "default" | "secondary" | "destructive"; }[];
    imageSrc: string;
    actions?: {
      icon: React.ReactNode;
      text: string;
    }[];
    buttons: {
      icon: React.ReactNode;
      text: string;
      dynamicComponent?: React.ReactNode;
      sizePercentage?: number;
    }[];
    onActionClick?: (action: string) => void;
    onClose?: () => void;
};

type StructureConfig = {
    [key: string]: Omit<IndividualStructureProps, 'onActionClick' | 'onClose'>;
};

export const StructuresConfig: StructureConfig = {
    3101: {
      name: "Mining",
      title: "Station",
      labels: [
        { text: "Resources", variant: "default" },
        { text: "Automation", variant: "secondary" },
        { text: "Station", variant: "destructive" },
      ],
      imageSrc: "/placeholder.svg",
      actions: [
        { icon: <HeartIcon className="w-6 h-6 text-[#a3be8c]" />, text: "Cuddle" },
        { icon: <RssIcon className="w-6 h-6 text-[#a3be8c]" />, text: "Feed" },
        { icon: <SaladIcon className="w-6 h-6 text-[#a3be8c]" />, text: "Dress" },
        { icon: <MehIcon className="w-6 h-6 text-[#a3be8c]" />, text: "Meme" },
      ],
      buttons: [
        { 
          icon: <ConstructionIcon className="w-6 h-6 text-[#a3be8c]" />, 
          text: "Mining", 
          dynamicComponent: <MiningScene />
        },
        { 
          icon: <PowerIcon className="w-6 h-6 text-[#a3be8c]" />, 
          text: "Upgrade automaton",
          dynamicComponent: <AutomatonUpgrader />,
          sizePercentage: 50
        },
        { 
          icon: <GemIcon className="w-6 h-6 text-[#a3be8c]" />, 
          text: "View available deposits",
          dynamicComponent: <MineralDepositsNoAction />,
          sizePercentage: 50
        },
      ],
    },
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
        { icon: <RssIcon className="w-6 h-6 text-[#5e81ac]" />, text: "Harvest" },
        { icon: <SaladIcon className="w-6 h-6 text-[#5e81ac]" />, text: "Meditate" },
        { icon: <MehIcon className="w-6 h-6 text-[#5e81ac]" />, text: "Observe" },
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
          icon: <LockIcon className="w-6 h-6 text-[#FFE3BA]" />, 
          text: "Further interactions - locked" 
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
          icon: <TelescopeIcon className="w-6 h-6 text-[#5e81ac]" />, text: 'Transit events'
        },
        // Copy action/labels
      ],
      buttons: [
        {
          icon: <TelescopeIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Transit events",
          dynamicComponent: '',
          sizePercentage: 60,
        },
        {
          icon: <CloudCogIcon className="w-6 h-6 text-[#5e81ac]" />,
          text: "Cloud/Weather Data (LOCKED)",
        },
      ],
    },
};