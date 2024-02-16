import IndividualPlanet from "../../components/Content/Planets/IndividualPlanet";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import IndividualBasePlanet, { BasePlanetData, EditableBasePlanetData, IndividualBasePlanetDesktop, IndividualBasePlanetDesktopTwoPanel } from "../../components/Content/Planets/Base/IndividualBasePlanet";
import Layout, { LayoutNoNav } from "../../components/Section/Layout";
import { DesktopSidebar } from "../../components/Section/Sidebar";
import ClassificationFeed, { ClassificationFeedForIndividualPlanet } from "../../components/Content/ClassificationFeed";
import { ActivateButton } from "../../components/Content/Planets/PlanetData/ContentPlaceholder";
import PostFormCardAnomalyTag from "../../components/Content/Classify/AnomalyPostFormCard";
import Navbar from "../../components/Section/Navbar";
import IndividualBasePlanetGrid from "../../components/Content/Planets/PlanetData/ContentGrid";
import { CreateBar } from "../../components/Core/BottomBar";
import RoverImageGallery from "../../components/Content/Planets/PlanetData/RandomRoverImage";
import StructureComponent from "../../components/Content/Planets/Activities/StructureCreate";

export default function PlanetIdPage () {
    const router = useRouter();
    const { id } = router.query;
    const [activeView, setActiveView] = useState('home');

    const handleTabClick = (view) => {
        setActiveView(view);
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

    if (isMobile) {
        return (
            <LayoutNoNav>
                <IndividualBasePlanet id={id as string} />
            </LayoutNoNav>
        );
    };

    // For testing/archiving of old layout
    if (isMobile && !id && !router) {
        return (
            <div className="flex h-screen">
                <div className="w-1/6 bg-gray-50">
                    <DesktopSidebar />
                </div>
                <div className="w-3/6 overflow-y-auto mr-30 z-40">
                    {/* <br /><ActivateButton /> */}
                    <IndividualBasePlanetDesktop id={id as string} />
                </div>
                <div className="w-2/6 bg-gray-50 overflow-y-auto z-">
                    <BasePlanetData planetId={{ id: id as string }} />
                    {/* <EditableBasePlanetData planetId={{ id: id as string }} /> */}
                    <PostFormCardAnomalyTag planetId={id} onPost={null} />
                    <ClassificationFeedForIndividualPlanet planetId={{ id: id as string }} />
                </div>
            </div>
        );
    };

    // Two panel layout for desktop devices, with orbitals
    if (!isMobile && !id && router) {
        return (
            <>
                <Navbar />
                <div className="flex h-screen">
                    <div className="w-3/6 overflow-y-auto mr-30 z-40">
                        {/* <br /><ActivateButton /> */}
                        <IndividualBasePlanetDesktopTwoPanel id={id as string} />
                    </div>
                    <div className="w-3/6 bg-gray-50 overflow-y-auto">
                        <div className="py-3">
                            <BasePlanetData planetId={{ id: id as string }} />
                            <PostFormCardAnomalyTag planetId={id} onPost={null} />
                            <ClassificationFeedForIndividualPlanet planetId={{ id: id as string }} />
                        </div>
                    </div>
                </div>
            </>
        );
    };

    return (
        <>
          <Navbar />
          <div className="h-screen py-4">
            <IndividualBasePlanetDesktop id={id as string} />
          </div>
          <div className="bg-white py-5">
            {activeView === 'home' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <PostFormCardAnomalyTag planetId={id} onPost={null} />
                  <ClassificationFeedForIndividualPlanet
                    planetId={{ id: id as string }}
                    backgroundColorSet="bg-blue-200"
                  />
                </div>
                <div className="">
                  <BasePlanetData planetId={{ id: id as string }} />
                </div>
              </div>
            )}
            {activeView === 'wallet' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <ClassificationFeedForIndividualPlanet
                    planetId={{ id: id as string }}
                    backgroundColorSet="bg-blue-200"
                  />
                </div>
                <div className="">
                  <img
                    src={`https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planetsss/${id}/topography.jpeg`}
                    alt="Topography"
                  />
                  <RoverImageGallery />
                </div>
              </div>
            )}
          </div>
          <CreateBar onTabClick={handleTabClick} />
        </>
      );
    };