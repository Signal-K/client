import { MiningScene } from "@/app/components/(structures)/Mining/MiningPanels";
import { BeanIcon, HeartIcon, LockIcon, MehIcon, PickaxeIcon, RssIcon, SaladIcon, WebcamIcon } from "lucide-react";

interface IndividualStructureProps {
    name: string;
    title: string;
    labels: { text: string; variant: "default" | "secondary" | "destructive"; }[];
    imageSrc: string;
    actions: {
      icon: React.ReactNode;
      text: string;
    }[];
    buttons: {
      icon: React.ReactNode;
      text: string;
      dynamicComponent?: React.ReactNode;
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
          icon: <WebcamIcon className="w-6 h-6 text-[#a3be8c]" />, 
          text: "Mining", 
          dynamicComponent: <MiningScene />
        },
        { 
          icon: <LockIcon className="w-6 h-6 text-[#a3be8c]" />, 
          text: "Locked until level 15" 
        },
        { 
          icon: <BeanIcon className="w-6 h-6 text-[#a3be8c]" />, 
          text: "Dismiss for the day" 
        },
      ],
    },
    3102: {
      name: "Mysterious Forest Grove",
      title: "Forest",
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
          icon: <WebcamIcon className="w-6 h-6 text-[#5e81ac]" />, 
          text: "Record", 
          dynamicComponent: null
        },
        { 
          icon: <LockIcon className="w-6 h-6 text-[#5e81ac]" />, 
          text: "Locked until level 10" 
        },
        { 
          icon: <BeanIcon className="w-6 h-6 text-[#5e81ac]" />, 
          text: "Leave for the day" 
        },
      ],
    },
}
