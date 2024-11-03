'use client';

import { ReactNode } from "react";

export const EarthScene: React.FC<{
    toolbar?: ReactNode;
    topSection?: ReactNode;
    middleSection?: ReactNode;
    bottomSection?: ReactNode;
  }> = ({ toolbar, topSection, middleSection, bottomSection }) => {
    return (
      <div className="relative min-h-screen w-full flex flex-col justify-start">
        <img
          className="absolute inset-0 w-full h-full object-cover"
          src="/assets/Backdrops/Earth.png"
          alt="Earth Background"
        />
  
        <div className="relative flex flex-col h-full">
          {topSection && <div className="w-full h-[22.5vh]">{topSection}</div>}
  
          <div className="flex w-full h-[55vh] relative">
            <div className="w-2/3 h-full mx-auto p-4 overflow-hidden">
              {middleSection}
            </div>
  
            {toolbar && (
              <div className="absolute top-0 right-0 h-full flex flex-col justify-center p-7">
                {toolbar}
              </div>
            )}
          </div>
  
          {bottomSection && (
            <div className="flex w-full h-[22.5vh]">
              <div className="w-2/3 h-full mx-auto p-4 overflow-hidden">
                {bottomSection}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };