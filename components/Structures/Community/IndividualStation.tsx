import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

export interface IndividualStationProps {
    name: string;
    projects: Project[];
    onClose?: () => void;
    // Will add more from `StationModal.tsx` script later
    // For now, the focus is on integrating projects
};

type Project = {
    id: string;
    name: string;
    identifier: string;
    isUnlocked: boolean;
    level: number;
};

const IndividualCommunityStation: React.FC<IndividualStationProps> = ({
    name,
    projects,
    onClose,
}) => {
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<Project | null>(null);
    const [isExpanded, setExpanded] = useState(false);

    const [isDarkMode, setIsDarkMode] = useState(false);
    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
    const baseColors = isDarkMode
      ? { bg: "#303F51", text: "#F7F5E9", accent1: "#85DDA2", accent2: "#5FCBC3" }
      : {
          bg: "#F7F5E9",
          text: "#303F51",
          accent1: "#FFD580",
          accent2: "#5FCBC3",
        };
  
    const handleItemClick = (item: any) => {
      setSelectedItem(item);
    };
  
    const handleBack = () => {
      setSelectedItem(null);
      setActiveSection(null);
    };

    const handleClose = () => {
        setExpanded(false);
        if (onClose) {
          onClose();
        };
    };

    return (
        <Dialog defaultOpen>
            <div
                className={`flex flex-col items-center p-6 rounded-lg shadow-lg w-full max-w-md mx-auto transition-colors duration-300 ease-in-out overflow-hidden`}
                style={{ backgroundColor: baseColors.bg, color: baseColors.text }}
            >
                <div className="flex justify-between items-center w-full mb-6">
                    <Building2
                        className="w-10 h-10"
                        style={{ color: baseColors.accent2}}
                    />
                    <h2 className="text-2xl font-bold">
                        {name}
                    </h2>
                </div>
            </div>
        </Dialog>
    );
};

export default IndividualCommunityStation;