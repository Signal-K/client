import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { IndividualBasePlanetDesktop } from "../../components/Content/Planets/Base/IndividualBasePlanet";
import { ClassificationFeedForIndividualPlanet } from "../../components/Content/ClassificationFeed";
import PostFormCardAnomalyTag from "../../components/Content/Classify/AnomalyPostFormCard";
import Navbar from "../../components/Section/Navbar";
import { CreateBar, CreateMenuBar } from "../../components/Core/BottomBar";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import ContentPlaceholder from "../../components/Content/Planets/PlanetData/ContentPlaceholder";

export default function PlanetIdPage () {
    const router = useRouter();
    const { id } = router.query;
    const [activeView, setActiveView] = useState('home');

    const supabase = useSupabaseClient();

    const [showUpdates, setShowUpdates] = useState(false);
    const [showSecondItem, setShowSecondItem] = useState(false);

    const handleUpdatesClick = () => {
      setShowUpdates(true);
    };

    const handleSecondButtonClick = () => {
      setShowSecondItem(true);
    }
  
    const handleCloseUpdates = () => {
      setShowUpdates(false);
    };

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkIsMobile();
        window.addEventListener("resize", checkIsMobile);
        return () => {
            window.removeEventListener("resize", checkIsMobile);
        };
        }
    }, []);

    if (!id) {
        return null; 
    };

    return (
        <>
          <Navbar />
          <div className="h-screen py-4">
            <IndividualBasePlanetDesktop id={id as string} />
          </div>
          <CreateMenuBar onUpdatesClick={handleUpdatesClick} onSecondButtonClick={handleSecondButtonClick} />
          {showUpdates && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white rounded-lg md:w-4/6 lg:w-3/6 xl:w-2/6 p-4">
          <button onClick={handleCloseUpdates} className="absolute top-0 right-0 m-2 text-gray-600 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
            <PostFormCardAnomalyTag planetId={id} onPost={null} />
                  <ClassificationFeedForIndividualPlanet
                    planetId={{ id: id as string }}
                    backgroundColorSet="bg-blue-200"
                  />
                  <center><button onClick={handleCloseUpdates} className="flex items-center justify-center p-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="bg-yellow-500 text-white text-xs px-1 ml-1 rounded">Back</span>
        </button></center>
          </div>
        </div>
      )}
      {showSecondItem && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"><ContentPlaceholder /></div>
      )}
        </>
      );
    };