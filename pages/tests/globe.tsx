import React from "react";
import { GlobeDemo } from "../../components/Content/Planets/PlanetGlobeTest";

export default function GlobePageTest() {
    return (
        <div className="flex-col justify-center">
{/* <style jsx global>
                {`
                  body {
                    background: url('/void.png') center/cover;
                  }
                `}
              </style> */}
              <div className="relative text-white h-screen w-full overflow-hidden">
                <GlobeDemo /></div>
        </div>
    );
};