"use client";

import React, { useState, CSSProperties } from "react";
// import { Header } from "@/app/components/sections/header";
import {
  Essendonitis,
  background2,
  background3,
  callme,
  mining,
} from "@/src/shared/constants/backgrounds";
import backgroundImage from "@/public/assets/Backdrops/Negotiations.jpg";
import Header from "@/components/ui/Header";

interface PlanetViewLayoutProps {
  children: React.ReactNode[];
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