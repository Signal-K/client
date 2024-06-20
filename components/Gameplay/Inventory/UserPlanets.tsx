"use client"

import { useEffect, useState, useRef, Fragment, createContext } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { CompassIcon, ArrowLeftIcon, ArrowRightIcon, BookOpenIcon } from "@/ui/Sections/PlanetLayout";
import { useActivePlanet } from "@/context/ActivePlanet";

import { Button } from "@/ui/button";
import { AllAutomatons, SingleAutomaton } from "./Automatons/Automaton";
import { AllStructures } from "./Structures/Structure";
import Link from "next/link";
import PickYourPlanet from "@/components/Onboarding";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { ProfileCard } from "@/auth/UserProfileFields";
import GoToYourPlanet from "../Travel/InitTravel";

interface ActivePlanetContextValue {
    activePlanet: UserPlanetData | null;
    setActivePlanet: (planet: UserPlanetData | null) => void;
};

export interface UserStructure {
    id: string;
    item: number;
    name: string;
    icon_url: string;
    description: string;
    // Function (what is executed upon click)
};

export interface UserPlanetData {
    id: string;
    content: string;
    ticId: string;
    type: string;
    radius: number;
    mass: number;
    density: number;
    gravity: number;
    temperatureEq: number;
    temperature: number;
    smaxis: number;
    orbital_period: number;
    classification_status: string;
    avatar_url: string;
    created_at: string;
    deepnote: string;
    starSystems: number;
    Faction: number;
    lightkurve: string;
};

const ActivePlanetContext = createContext<ActivePlanetContextValue>({
    activePlanet: null,
    setActivePlanet: () => {} // Provide a default empty function
});

// View structures, planet info & automatons
const UserPlanetPage = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [hasCompletedMission2, setHasCompletedMission2] = useState(false);
    const [hasCompletedMission3, setHasCompletedMission3] = useState(false);
    const [hasCompletedMission4, setHasCompletedMission4] = useState(false);
    const [hasCompletedMission5, setHasCompletedMission5] = useState(false);
    const [hasCompletedMission6, setHasCompletedMission6] = useState(false);
    const [hasCompletedMission7, setHasCompletedMission7] = useState(false);
    const [hasCompletedMission8, setHasCompletedMission8] = useState(false);
    const [hasCompletedMission9, setHasCompletedMission9] = useState(false);
    const [hasCompletedMission10, setHasCompletedMission10] = useState(false);
    const [hasCompletedMission11, setHasCompletedMission11] = useState(false);
    const [hasCompletedMission12, setHasCompletedMission12] = useState(false);
    const [hasCompletedMission13, setHasCompletedMission13] = useState(false);
    const [hasCompletedMission14, setHasCompletedMission14] = useState(false);
    const [hasCompletedMission15, setHasCompletedMission15] = useState(false);
    const [hasCompletedMission16, setHasCompletedMission16] = useState(false);
    const [hasCompletedMission17, setHasCompletedMission17] = useState(false);
    const [hasCompletedMission18, setHasCompletedMission18] = useState(false);
    
      
      useEffect(() => {
        const checkMissionCompletion = async () => {
          if (session) {
            const { data, error } = await supabase
              .from('missions')
              .select('mission')
              .eq('user', session.user.id)
              .eq('mission', 2);
    
            if (error) {
              console.error('Error checking mission completion:', error);
            } else {
              setHasCompletedMission2(data.length > 0);
            }
          }
        };
    
        checkMissionCompletion();
      }, [session, supabase]);

      useEffect(() => {
        const checkMissionCompletion = async () => {
          if (session) {
            const { data, error } = await supabase
              .from('missions')
              .select('mission')
              .eq('user', session.user.id)
              .eq('mission', 3);
    
            if (error) {
              console.error('Error checking mission completion:', error);
            } else {
              setHasCompletedMission3(data.length > 0);
            }
          }
        };
    
        checkMissionCompletion();
      }, [session, supabase]);

      useEffect(() => {
        const checkMissionCompletion = async () => {
          if (session) {
            const { data, error } = await supabase
              .from('missions')
              .select('mission')
              .eq('user', session.user.id)
              .eq('mission', 4);
    
            if (error) {
              console.error('Error checking mission completion:', error);
            } else {
              setHasCompletedMission4(data.length > 0);
            }
          }
        };
    
        checkMissionCompletion();
      }, [session, supabase]);

      useEffect(() => {
        const checkMissionCompletion = async () => {
          if (session) {
            const { data, error } = await supabase
              .from('missions')
              .select('mission')
              .eq('user', session.user.id)
              .eq('mission', 5);
    
            if (error) {
              console.error('Error checking mission completion:', error);
            } else {
              setHasCompletedMission5(data.length > 0);
            }
          }
        };
    
        checkMissionCompletion();
      }, [session, supabase]);

      useEffect(() => {
        const checkMissionCompletion = async () => {
          if (session) {
            const { data, error } = await supabase
              .from('missions')
              .select('mission')
              .eq('user', session.user.id)
              .eq('mission', 6);
    
            if (error) {
              console.error('Error checking mission completion:', error);
            } else {
              setHasCompletedMission6(data.length > 0);
            }
          }
        };
    
        checkMissionCompletion();
      }, [session, supabase]);

      useEffect(() => {
        const checkMissionCompletion = async () => {
          if (session) {
            const { data, error } = await supabase
              .from('missions')
              .select('mission')
              .eq('user', session.user.id)
              .eq('mission', 7);
    
            if (error) {
              console.error('Error checking mission completion:', error);
            } else {
              setHasCompletedMission7(data.length > 0);
            }
          }
        };
    
        checkMissionCompletion();
      }, [session, supabase]);

    useEffect(() => {
        const checkMissionCompletion = async () => {
          if (session) {
            const { data, error } = await supabase
              .from('missions')
              .select('mission')
              .eq('user', session.user.id)
              .eq('mission', 8);
    
            if (error) {
              console.error('Error checking mission completion:', error);
            } else {
              setHasCompletedMission8(data.length > 0);
            }
          }
        };
    
        checkMissionCompletion();
      }, [session, supabase]);

    if (!activePlanet) {
        return (
            <div className="mx-12">
                {/* Desktop Layout */}
                <div className="hidden md:grid md:grid-cols-3 md:gap-4 md:relative md:min-h-screen">
                    <div className="hidden md:flex justify-center items-center"></div>
                    <div className="hidden md:flex justify-center items-center">
                        <PickYourPlanet onPlanetSelect={() => {}}/>
                    </div>
                    <div className="hidden md:flex justify-center items-center"></div>
                    <div className="hidden md:flex justify-center items-center"></div>
                    <div className="hidden md:flex justify-center items-center"></div>
                    <div className="hidden md:flex justify-center items-center"></div>
                    <div className="hidden md:flex justify-center items-center"></div>
                    <div className="hidden md:flex justify-center items-center">
                    </div>
                    <div className="hidden md:flex justify-center items-center"></div>
                    <div className="hidden md:flex justify-center items-center"></div>
                </div>

                {/* Mobile Layout */}
                <div className="grid grid-cols-3 gap-4 md:hidden relative min-h-screen">
                    <div>01</div>
                    <div>02</div>
                    <div className="col-span-3 flex justify-center items-end pb-5">
                        <PickYourPlanet onPlanetSelect={() => {}}/>
                    </div>
                    <div>04</div>
                    <div>05</div>
                    <div>06</div>
                    <div>07</div>
                    <div>08</div>
                    <div className="col-span-3 flex justify-center items-end pb-5">
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="mx-12">
            {/* Desktop Layout */}
            <div className="hidden md:grid md:grid-cols-5 md:grid-rows-4 md:gap-4 md:relative md:min-h-screen">
                <div className="hidden md:flex justify-center items-center">
                    
                </div>
                <div className="hidden md:flex justify-center items-center col-span-3">
                    {!hasCompletedMission2 && (
                        <ProfileCard />
                    )}
                    {!hasCompletedMission3 && hasCompletedMission2 && (
                        <GoToYourPlanet planetId={parseInt(activePlanet.id)} />
                    )}
                </div>
                <div className="hidden md:flex justify-center items-center">
                    4
                </div>
                <div className="hidden md:flex justify-center items-center">5</div>
                <div className="hidden md:flex justify-center items-center">6</div>
                <div className="hidden md:flex justify-center items-center">7</div>
                <div className="hidden md:flex justify-center items-center">
                    <SingleAutomaton />
                </div>
                <div className="hidden md:flex justify-center items-center">8</div>
                <div className="hidden md:flex justify-center items-center">9</div>
                <div className="hidden md:flex justify-center items-center">10</div>
                <div className="hidden md:flex justify-center items-center">11</div>
                <div className="hidden md:flex justify-center items-center">12</div>
                <div className="hidden md:flex justify-center items-center">13</div>
                <div className="hidden md:flex justify-center items-center">14</div>
                <div className="hidden md:flex justify-center items-center">15</div>
                <div className="hidden md:flex justify-center items-center">16</div>
                <div className="hidden md:flex justify-center items-center">17</div>
                <div className="hidden md:flex justify-center items-center">18</div>
                <div className="hidden md:flex justify-center items-center">19</div>
                <div className="hidden md:flex justify-center items-center">20</div>
                <div className="hidden md:flex justify-center items-center">21</div>
                <div className="hidden md:flex justify-center items-center">22</div>
                <div className="hidden md:flex justify-center items-center">23</div>
                <div className="hidden md:flex justify-center items-center">24</div>
            </div>

            {/* Mobile Layout */}
            <div className="grid grid-cols-3 grid-rows-3 gap-4 md:hidden relative min-h-screen">
                <div>01</div>
                <div>02</div>
                <div>03</div>
                <div>04</div>
                <div className="col-span-3 flex justify-center items-end pb-5">
                    <AllStructures />
                </div>
                <div>05</div>
                <div>06</div>
                <div>07</div>
                <div>08</div>
                <div className="col-span-3 flex justify-center items-end pb-5">
                    <AllAutomatons />
                </div>
                <div>09</div>
                <div>10</div>
                <div>11</div>
            </div>
        </div>
    );
};

export default UserPlanetPage;