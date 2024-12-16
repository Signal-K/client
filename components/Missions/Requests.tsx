"use client";

import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Rocket, MapPin, Building, Star, Clock } from "lucide-react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

type CommunityMission = {
  id: number;
  title: string;
  steps: string[];
  Output: string[];
  poster: string;
  isLocked: boolean;
  structure: string;
  location: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimatedTime: string;
};

const missions: CommunityMission[] = [
  {
    id: 1,
    title: "Build Greenhouses",
    steps: [ 
      "Classify some animals on Earth",
      "Fly to a planet of your choice and create a community mission",
      "Share your structure - now everyone can use your greenhouse on that planet",
    ],
    Output: [
        "Can study plants & animals on other planets",
        "Creator of the planet's greenhouse gets 5% of all stardust created from classifications performed using the greenhouse",
        "Click on the plus button to see if somebody else has placed a greenhouse on your planet. If not, you're able to build your own and open up the ecosystem for others!",
    ],
    poster: "Capt'n Cosmos",
    isLocked: false,
    structure: "Greenhouse",
    location: "Mercury, Venus, Moon, Mars",
    difficulty: 2,
    estimatedTime: "4 minutes",
  },
  {
    id: 2,
    title: "Add your own data!",
    steps: [
      "Star Sailors is always on the lookout for new projects and content to add, integrate and create with. If you see something cool or want to add something, you can use Starnet to upload anything you'd like",
      "Click on the 'Create' button in the corner of the display to upload a file or make a post",
      "You can point your discovery towards a current project, and we'll add it to the project's dataset if it passes community consensus",
    ],
    Output: [
      "More real-world data added to the creations in the Star Sailors world, allowing for more discoveries and missions to be created",
      "Earn stardust for your contributions",
    ],
    poster: "The community",
    isLocked: false,
    structure: "Datasets",
    location: "Anywhere",
    difficulty: 1,
    estimatedTime: "2 minutes",
  },
];

export default function CommunityMissionList() {
  const supabase = useSupabaseClient();

  const renderDifficulty = (difficulty: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < difficulty ? "text-[#FFD580] fill-[#FFD580]" : "text-gray-300"
          }`}
        />
      ));
  };

  return (
    <div className="min-h-screen bg-[#2C3A4A] text-[#CFD1D1] p-6">
      <style jsx global>{`
                :root {
                --color-primary: #2C4F64;
                --color-secondary: #5FCBC3;
                --color-accent: #85DDA2;
                --color-highlight: #FFD580;
                }
        `}</style>
      <div className="max-w-4xl mx-auto grid gap-6">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className="bg-[#2C4F64] rounded-lg shadow-lg overflow-hidden border-2 border-[#5FCBC3]"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-semibold text-[#FFD580]">
                  {mission.title}
                </h2>
                {mission.isLocked && (
                  <Badge
                    variant="secondary"
                    className="bg-[#FFD580] text-[#2C3A4A]"
                  >
                    <Lock className="w-4 h-4 mr-1" /> Coming Soon
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-[#5FCBC3]" />
                  <span>{mission.location}</span>
                </div>
                <div className="flex items-center">
                  <Building className="w-5 h-5 mr-2 text-[#5FCBC3]" />
                  <span>{mission.structure}</span>
                </div>
                <div className="grid grid cols-5">
                  <Star className="w-5 h-5 mr-2 text-[#5FCBC3]" />
                  <span>
                    Difficulty: {renderDifficulty(mission.difficulty)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-[#5FCBC3]" />
                  <span>{mission.estimatedTime}</span>
                </div>
              </div>
              <p className="text-sm mb-4">Posted by: {mission.poster}</p>
              <h3 className="text-lg font-semibold mb-2 text-[#5FCBC3]">
                Objectives:{" "}
              </h3>
              <ScrollArea className="h-32 mb-4 border border-[#5FCBC3] rounded p-2">
                <ol className="list-decimal list-inside">
                  {mission.steps.map((step, index) => (
                    <li key={index} className="mb-2">
                      {step}
                    </li>
                  ))}
                </ol>
              </ScrollArea>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-[#5FCBC3]">
                    Output:{" "}
                  </h3>
                  <ol className="list-decimal list-inside">
                    {mission.Output.map((Output, index) => (
                      <li key={index} className="mb-2">
                        {Output}
                      </li>
                    ))}
                  </ol>
                </div>
                <Button
                  className="bg-[#5FCBC3] text-[#2C3A4A] hover:bg-[#85DDA2] hover:text-[#2C3A4A]"
                  disabled={mission.isLocked}
                >
                  {mission.isLocked ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Coming Soon
                    </>
                  ) : (
                    <>
                      <div className="mb-5">
                        <Rocket className="w-4 h-4 mr-2" />
                      </div>
                      {/* <div className="mt-5">
                        <CreateCommunityStation />
                      </div> */}
                      Mission in progress
                      {/* Accept Mission */}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};