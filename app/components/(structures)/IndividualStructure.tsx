import React, { useState } from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface IndividualStructureProps {
  name: string;
  title: string;
  labels: { text: string; variant: "default" | "secondary" | "destructive"; }[];
  imageSrc: string;
  actions: {
    icon: React.ReactNode;
    text: string;
  }[];
  buttons: {
    showInNoModal: boolean;
    icon: React.ReactNode;
    text: string;
    dynamicComponent?: React.ReactNode;
    sizePercentage?: number;
  }[];
  structureId?: number; // Optional structureId prop
  onActionClick?: (action: string) => void;
  onClose?: () => void;
};

interface ButtonConfig {
  icon: JSX.Element;
  text: string;
  dynamicComponent: JSX.Element;
  sizePercentage?: number;
  showInNoModal?: boolean;
}

const IndividualStructure: React.FC<IndividualStructureProps> = ({
  name,
  title,
  labels,
  imageSrc,
  actions,
  buttons,
  onActionClick,
  onClose,
  structureId,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleButtonClick = (buttonText: string) => {
    setExpanded(true);
    setActiveButton(buttonText);
    if (onActionClick) {
      onActionClick(buttonText);
    }
  };

  const handleClose = () => {
    setExpanded(false);
    setActiveButton(null);
    if (onClose) {
      onClose();
    }
  };

  const handleCollapse = () => {
    setExpanded(false);
    setActiveButton(null);
  };

  const activeButtonConfig = buttons.find(button => button.text === activeButton);
  const activeComponent = activeButtonConfig?.dynamicComponent;
  const sizePercentage = activeButtonConfig?.sizePercentage || 100;

  return (
    <Dialog defaultOpen>
      <div className={`relative transition-all duration-500 ease-in-out ${expanded ? 'h-screen' : ''}`}>
        {!expanded && (
          <DialogContent className="p-4 rounded-3xl bg-[#2C3A4A]/70 text-white max-w-md mx-auto">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <BuildingIcon className="w-8 h-8 text-[#a3be8c]" />
                <div>
                  <h1 className="text-2xl font-bold text-[#eceff4]">{name}, {structureId}</h1>
                </div>
              </div>
              <StarIcon className="w-6 h-6 text-[#ebcb8b]" />
            </div>
            <div className="flex justify-center my-4">
              <img
                src={imageSrc}
                alt={title}
                className="w-20 h-20 bg-[#74859A]"
                width="80"
                height="80"
                style={{ aspectRatio: "80/80", objectFit: "cover" }}
              />
            </div>
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
            <div className="flex flex-col my-4 space-y-4">
            {buttons.map((button, index) => (
              button.showInNoModal !== false && (
                <div
                  key={index}
                  className="flex items-center bg-[#85DDA2]/40 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-[#85DDA2]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                  onClick={() => handleButtonClick(button.text)}
                >
                  <div className="flex-shrink-0">
                    {button.icon}
                  </div>
                  <p className="ml-2 text-xs text-[#d8dee9]">{button.text}</p>
                </div>
              )
            ))}
            </div>
            <Button
              variant="outline"
              className="rounded-full p-2 text-[#d8dee9] hover:bg-[#3b4a5a] mt-8"
              onClick={handleClose}
            >
              Close Modal
            </Button>
          </DialogContent>
        )}

        {expanded && (
          <DialogContent
            className="p-4 rounded-3xl bg-[#2C3A4A]/90 text-white max-w-screen mx-auto h-full"
            style={{
              width: `${sizePercentage}%`,
              height: `${sizePercentage}%`,
              maxWidth: `${sizePercentage}%`,
            }}
          >
            <div className="relative flex flex-col items-center justify-center h-full">
              <button
                className="absolute top-4 right-4 text-white hover:text-red-500"
                onClick={handleCollapse}
              >
                Collapse
              </button>
              <h1 className="text-3xl font-bold text-[#eceff4] mb-4">{`${activeButton}`}</h1>
              <div className="flex-grow flex justify-center items-center">
                {activeComponent ? activeComponent : <p className="text-lg">No component available.</p>}
              </div>
            </div>
          </DialogContent>
        )}
      </div>
    </Dialog>
  );
};

export default IndividualStructure;

export const IndividualStructureNoModal: React.FC<IndividualStructureProps> = ({
  name,
  title,
  labels,
  imageSrc,
  actions,
  buttons,
  onActionClick,
  onClose,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleButtonClick = (buttonText: string) => {
    setExpanded(true);
    setActiveButton(buttonText);
    if (onActionClick) {
      onActionClick(buttonText);
    }
  };

  const handleClose = () => {
    setExpanded(false);
    setActiveButton(null);
    if (onClose) {
      onClose();
    }
  };

  const handleCollapse = () => {
    setExpanded(false);
    setActiveButton(null);
  };

  const activeButtonConfig = buttons.find(button => button.text === activeButton);
  const activeComponent = activeButtonConfig?.dynamicComponent;
  const sizePercentage = activeButtonConfig?.sizePercentage || 100;

  return (
    <div className={`relative transition-all duration-500 ease-in-out ${expanded ? 'absolute top-0 left-0 right-0 bottom-0' : ''}`}>
      {!expanded && (
        <div className="p-4 rounded-3xl bg-[#2C3A4A]/70 text-white max-w-md mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <BuildingIcon className="w-8 h-8 text-[#a3be8c]" />
              <div>
                <h1 className="text-2xl font-bold text-[#eceff4]">{name}</h1>
              </div>
            </div>
            <StarIcon className="w-6 h-6 text-[#ebcb8b]" />
          </div>
          <div className="flex justify-center my-4">
            <img
              src={imageSrc}
              alt={title}
              className="w-20 h-20 bg-[#74859A]"
              width="80"
              height="80"
              style={{ aspectRatio: "80/80", objectFit: "cover" }}
            />
          </div>
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
          <div className="flex flex-col my-4 space-y-4">
            {buttons.map((button, index) => (
                <div
                  key={index}
                  className="flex items-center bg-[#85DDA2]/40 text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-[#85DDA2]/70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
                  onClick={() => handleButtonClick(button.text)}
                >
                  <div className="flex-shrink-0">
                    {button.icon}
                  </div>
                  <p className="ml-2 text-xs text-[#d8dee9]">{button.text}</p>
                </div>
            ))}
          </div>
          <button
            className="rounded-full p-2 text-[#d8dee9] hover:bg-[#3b4a5a] mt-8"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      )}

      {expanded && (
        <div
          className="p-4 rounded-3xl bg-[#2C3A4A]/90 text-white max-w-screen mx-auto h-full"
          style={{
            width: `${sizePercentage}%`,
            height: `${sizePercentage}%`,
            maxWidth: `${sizePercentage}%`,
          }}
        >
          <div className="relative flex flex-col items-center justify-center h-full">
            <button
              className="absolute top-4 right-4 text-white hover:text-red-500"
              onClick={handleCollapse}
            >
              Collapse
            </button>
            <h1 className="text-3xl font-bold text-[#eceff4] mb-4">{`${activeButton}`}</h1>
            <div className="flex-grow flex justify-center items-center">
              {activeComponent ? activeComponent : <p className="text-lg">No component available.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function BeanIcon(props: any) {
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
      <path d="M10.165 6.598C9.954 7.478 9.64 8.36 9 9c-.64.64-1.521.954-2.402 1.165A6 6 0 0 0 8 22c7.732 0 14-6.268 14-14a6 6 0 0 0-11.835-1.402Z" />
      <path d="M5.341 10.62a4 4 0 1 0 5.279-5.28" />
    </svg>
  );
};


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


function DoorClosedIcon(props: any) {
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
      <path d="M18 20V6a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14" />
      <path d="M2 20h20" />
      <path d="M14 12v.01" />
    </svg>
  );
};


function HeartIcon(props: any) {
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
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
};


function LockIcon(props: any) {
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
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
};


function MehIcon(props: any) {
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
      <circle cx="12" cy="12" r="10" />
      <line x1="8" x2="16" y1="15" y2="15" />
      <line x1="9" x2="9.01" y1="9" y2="9" />
      <line x1="15" x2="15.01" y1="9" y2="9" />
    </svg>
  );
};


function RssIcon(props: any) {
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
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" />
    </svg>
  );
};


function SaladIcon(props: any) {
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
      <path d="M7 21h10" />
      <path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" />
      <path d="M11.38 12a2.4 2.4 0 0 1-.4-4.77 2.4 2.4 0 0 1 3.2-2.77 2.4 2.4 0 0 1 3.47-.63 2.4 2.4 0 0 1 3.37 3.37 2.4 2.4 0 0 1-1.1 3.7 2.51 2.51 0 0 1 .03 1.1" />
      <path d="m13 12 4-4" />
      <path d="M10.9 7.25A3.99 3.99 0 0 0 4 10c0 .73.2 1.41.54 2" />
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


function WebcamIcon(props: any) {
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
      <circle cx="12" cy="10" r="8" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 22h10" />
      <path d="M12 22v-4" />
    </svg>
  );
};