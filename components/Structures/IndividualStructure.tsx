import React, { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GreenhouseResearchStations } from "./Missions/Biologists/ResearchStations";
import MilestoneCard from "./Missions/Milestones/MilestoneCard";
import MySettlementsLocations from "@/content/Classifications/UserLocations";
import { ClassificationsLastWeek } from "./Missions/Milestones/ClassificationNumber";

export interface IndividualStructureProps {
  name: string;
  title: string;
  labels: { text: string; variant: "default" | "secondary" | "destructive" }[];
  imageSrc: string;
  actions: {
    icon: React.ReactNode;
    text: string;
    dynamicComponent?: React.ReactNode;
    sizePercentage?: number;
  }[];
  buttons: {
    showInNoModal: boolean;
    icon: React.ReactNode;
    text: string;
    dynamicComponent?: React.ReactNode;
    sizePercentage?: number;
    classificationtype?: string;
  }[];
  modals?: {
    component: React.ReactNode;
    text: string;
    icon: React.ReactNode;
  }[];
  alerts?: { icon: React.ReactNode; message: string }[];
  structureId?: number;
  onActionClick?: (action: string) => void;
  onClose?: () => void;
};

const IndividualStructure: React.FC<IndividualStructureProps> = ({
  name,
  title,
  labels,
  imageSrc, 
  actions,
  buttons,
  modals,
  alerts,
  onActionClick,
  onClose,
  structureId,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [activeComponent, setActiveComponent] = useState<React.ReactNode | null>(null);
  const [modalSizePercentage, setModalSizePercentage] = useState(100); 
  const [tooltip, setTooltip] = useState<{ visible: boolean; text: string } | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleActionClick = (actionText: string, component: React.ReactNode, sizePercentage: number = 100) => {
    setActiveComponent(component);
    setModalSizePercentage(sizePercentage);
    if (onActionClick) {
      onActionClick(actionText);
    };
  };

  const handleButtonClick = (buttonText: string, component: React.ReactNode, sizePercentage: number = 100) => {
    setActiveComponent(component);
    setModalSizePercentage(sizePercentage);
    setExpanded(true); 
  };

  const handleModalClick = (component: React.ReactNode, text: string) => {
    setActiveComponent(component);
    setExpanded(true);
  };  

  const handleClose = () => {
    setExpanded(false);
    setActiveComponent(null);
    if (onClose) {
      onClose();
    };
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
        setActiveComponent(null)
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [handleClose]);

  return (
    <Dialog defaultOpen>
      <div className="relative transition-all duration-500 ease-in-out">
        {!activeComponent && (
          <DialogContent
            className="p-6 rounded-3xl text-white max-w-3xl mx-auto"
            style={{ background: 'linear-gradient(135deg, rgba(44, 79, 100, 0.7), rgba(95, 203, 195, 0.7))' }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <BuildingIcon className="w-8 h-8 text-[#a3be8c]" />
                <div>
                  <h1 className="text-2xl font-bold text-[#eceff4]">{name}</h1> {/* , {structureId} */}
                </div>
              </div>
              <StarIcon className="w-6 h-6 text-[#ebcb8b]" />
            </div>
            <div className="relative flex justify-center my-4">
              <img
                src={imageSrc}
                alt={title}
                className="w-20 h-20"
                width="80"
                height="80"
                style={{ aspectRatio: "80/80", objectFit: "cover" }}
                onMouseEnter={() => setTooltip({ visible: true, text: name })}
                onMouseLeave={() => setTooltip(null)}
              />
              {tooltip?.visible && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-[#2C3A4A] text-white text-xs p-1 rounded-md shadow-lg">
                  {tooltip.text}
                </div>
              )}
              { name === "Biodome" && (
                <div 
                  className="absolute top-0 right-0 w-6 h-6 bg-[#85DDA2] rounded-full flex items-center justify-center cursor-pointer"
                  onMouseEnter={() => setTooltip({ visible: true, text: "Sustainable, self-contained ecosystem!" })}
                  onMouseLeave={() => setTooltip(null)}
                >
                  <span className="text-[#1D2833] text-lg font-bold">...</span>
                </div>
              )}

              {tooltip?.visible && (
                <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-[#2C3A4A] text-white text-xs p-1 rounded-md shadow-lg">
                  {tooltip.text}
                </div>
              )}
            </div>
            {alerts?.map((alert, index) => (
                <div key={index} className="absolute top-0 left-1/2 transform -translate-x-1/2 cursor-pointer">
                  <div 
                    className="relative flex items-center justify-center"
                    onClick={() => alert.message}
                  >
                    <div className="bg-[#FF7B7B] text-white p-2 rounded-full">
                      {alert.icon}
                    </div>
                    <div className="absolute top-0 left-0 bg-[#2C3A4A] text-white text-xs p-1 rounded-md shadow-lg">
                      {alert.message}
                    </div>
                  </div>
                </div>
              ))}
            <div className="flex justify-center space-x-4">
              {labels.map((label, index) => {
                let bgColor = "";
                switch (label.variant) {
                  case "default":
                    bgColor = "#5FCBC3";
                    break;
                  case "secondary":
                    bgColor = "#85DDA2";
                    break;
                  case "destructive":
                    bgColor = "#D689E3";
                    break;
                }
                return (
                  <Badge
                    key={index}
                    variant={label.variant}
                    className={`text-white/83`}
                    style={{ backgroundColor: bgColor }}
                  >
                    {label.text}
                  </Badge>
                );
              })}
            </div>
            <div className="flex items-center justify-center my-4 space-x-4">
              {actions.map((action, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center cursor-pointer"
                  onClick={() => handleActionClick(action.text, action.dynamicComponent, action.sizePercentage)}
                >
                  {action.icon}
                  <p className="text-xs text-[#d8dee9]">{action.text}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex flex-col items-center my-4 space-y-4">
                {buttons.map((button, index) => (
                  button.showInNoModal !== false && (
                    <div
                      key={index}
                      className="flex items-center justify-center bg-[#85DDA2]/40 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-[#85DDA2]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                      onClick={() => handleButtonClick(button.text, button.dynamicComponent, button.sizePercentage)}
                      style={{ width: "100%", maxWidth: "200px" }}
                    >
                      <div className="flex items-center justify-center w-full">
                        <div className="flex-shrink-0">
                          {button.icon}
                        </div>
                        <p className="ml-2 text-xs text-[#d8dee9]">{button.text}</p>
                        {button.classificationtype && (
                          <p className="ml-2 text-xs text-[#d8eee9]">
                            <ClassificationsLastWeek classificationType={button.classificationtype} />
                          </p>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </div>
              {/* <p>{name}</p> */}
              {name !== 'Telescope' ? (
                <MilestoneCard />
              ) : (
                <MySettlementsLocations />
              )}
            </div>
            <div className="flex flex-col items-center my-4 space-y-4">
              {modals && modals.length > 0 && modals.map((modal, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center bg-[#85DDA2]/40 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-[#85DDA2]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                  onClick={() => handleModalClick(modal.component, modal.text || '')}
                  style={{ width: "100%", maxWidth: "200px" }}
                >
                  <div className="flex items-center justify-center w-full">
                    <div className="flex-shrink-0">
                      {modal.icon}
                    </div>
                    <p className="ml-2 text-xs text-[#d8dee9]">{modal.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              className="rounded-full p-2 text-[#d8dee9] hover:bg-[#3b4a5a] mt-8"
              onClick={handleClose}
            >
              Back
            </Button>
          </DialogContent>
        )}
        {activeComponent && (
          <DialogContent
            className={`p-4 rounded-3xl text-white mx-auto 
              w-[95%] h-[95%] max-w-full max-h-[95%] fixed top-1/2 left-1/2 
              transform -translate-x-1/2 -translate-y-1/2 
              overflow-y-auto bg-[#1D2833]/90`}
          >
            <div className="relative flex flex-col items-center justify-center h-full">
              <button
                className="absolute top-4 right-4 text-white hover:text-red-500"
                onClick={() => setActiveComponent(null)}
              >
                Close
              </button>
              <div className="flex-grow flex justify-center items-center overflow-y-auto w-full">
                {activeComponent}
              </div>
            </div>
          </DialogContent>
        )}

        {structureId === 3104 && (
          <GreenhouseResearchStations />
        )}
      </div>
    </Dialog>
  );
};

export default IndividualStructure;

function BuildingIcon(props: any) {
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
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
};

function StarIcon(props: any) {
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
};