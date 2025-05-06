"use client";

import React, { useState, CSSProperties } from "react";
// import { Header } from "@/app/components/sections/header";
import {
  Essendonitis,
  background2,
  background3,
  callme,
  mining,
} from "@/constants/backgrounds";
import backgroundImage from "@/public/assets/Backdrops/Negotiations.jpg";
import Header from "@/components/ui/Header";
import VerticalToolbar from "@/components/Layout/Toolbar";

interface PlanetViewLayoutProps {
  children: React.ReactNode[];
};

interface PlanetActionSceneProps {
  children: React.ReactNode;
};

const PlanetViewLayout: React.FC<PlanetViewLayoutProps> = ({ children }) => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [clickCounts, setClickCounts] = useState<number[]>([0, 0, 0]);

  const handleExpand = (index: number) => {
    const updatedClicks = [...clickCounts];
    updatedClicks[index] += 1;
    setClickCounts(updatedClicks);

    if (updatedClicks[index] >= 200000) {
      setExpandedSection(index);
    }
  };

  const handleClose = () => {
    setExpandedSection(null);
    setClickCounts([0, 0, 0]);
  };

  const sectionStyles: CSSProperties[] = [
    {
      flex: 8,
    },
    {
      flex: 6,
    },
    {
      display: "flex",
      flexDirection: "column" as const,
      flex: 20,
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/Backdrops/View.mp4"
        autoPlay
        loop
        muted
      />
      <div className="relative flex flex-1">
        <div className="relative flex flex-col flex-1">
          {children.slice(0, 2).map((child, index) => (
            <div
              key={index}
              className={`relative flex-1 cursor-pointer ${
                expandedSection !== null && expandedSection !== index
                  ? "hidden"
                  : "flex"
              }`}
              style={
                expandedSection === null
                  ? sectionStyles[index]
                  : expandedSection === index
                  ? { ...sectionStyles[index], flex: 1 }
                  : {}
              }
              onClick={() => expandedSection === null && handleExpand(index)}
            >
              {expandedSection === null || expandedSection === index ? (
                <>
                  {child}
                  {expandedSection === index && (
                    <button
                      className="absolute top-4 right-4 text-white bg-red-600 p-4 rounded-full shadow-lg text-lg font-bold z-50"
                      onClick={handleClose}
                      style={{
                        border: "3px solid white",
                        boxShadow: "0px 0px 15px rgba(0, 0, 0, 0.5)",
                      }}
                    >
                      Close
                    </button>
                  )}
                </>
              ) : null}
            </div>
          ))}
          <div
            className={`relative flex flex-1 border-b border-dotted border-gray-5 cursor-pointer ${
              expandedSection !== null && expandedSection !== 2
                ? "hidden"
                : "flex"
            }`}
            style={
              expandedSection === null
                ? sectionStyles[2]
                : expandedSection === 2
                ? { ...sectionStyles[2], flex: 1 }
                : {}
            }
            onClick={() => expandedSection === null && handleExpand(2)}
          >
            {expandedSection === null || expandedSection === 2 ? (
              <div className="flex flex-1 flex-col">
                <div className="flex-1">{children[2]}</div>
                <div
                  className="flex-1 border-t border-dotted border-gray-100"
                  style={{ flex: 1 }}
                >
                  {children[3]}
                </div>
                {expandedSection === 2 && (
                  <button
                    className="absolute top-4 right-4 text-white bg-red-600 p-4 rounded-full shadow-lg text-lg font-bold z-50"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                )} 
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  ); 
};

export default PlanetViewLayout;

interface EarthViewLayoutProps {
  children: React.ReactNode;
};

export const EarthViewLayout: React.FC<PlanetViewLayoutProps> = ({ children }) => {
  const childrenArray = React.Children.toArray(children);

  const sectionStyles: CSSProperties[] = [
    {
      flex: 8,
    },
    {
      flex: 6,
    },
    {
      display: "flex",
      flexDirection: "column" as const,
      flex: 20,
    },
  ];

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        src="/assets/Backdrops/Earth.png"
        alt="Earth Background"
      />

      <div className="relative flex flex-1 z-10">
        <div className="relative flex flex-col flex-1">
          {/* <VerticalToolbar /> goes somewhere here */}
          {childrenArray.slice(0, 2).map((child, index) => (
            <div
              key={index}
              className="relative flex-1"
              style={sectionStyles[index]}
            >
              {child}
            </div>
          ))}
          <div
            className="relative flex flex-1 border-b border-dotted border-gray-5"
            style={sectionStyles[2]}
          >
            <div className="flex flex-1 flex-col">
              <div className="flex-1">{childrenArray[2]}</div>
              {childrenArray[3] && (
                <div className="flex-1 border-t border-dotted border-gray-100">
                  {childrenArray[3]}
                </div>
              )}
            </div>
            <div className="flex-shrink-0 mx-7">{childrenArray[4]}</div>
          </div>
        </div>
      </div>
    </div>
  );
};