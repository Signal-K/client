"use client";

import { usePageData } from "@/hooks/usePageData";
import Section from "@/src/components/sections/Section";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ViewportSkillTree() {
  const { classifications } = usePageData();

  // Mission definitions by viewport
  const missions = [
    {
      viewport: "Telescope",
      groups: [
        {
          name: "Planet Hunters",
          types: ["planet"],
        },
        {
          name: "Daily Minor Planet",
          types: ["telescope-minorPlanet", "active-asteroid"],
        },
      ],
    },
    {
      viewport: "Satellite",
      groups: [
        {
          name: "Cloudspotting on Mars",
          types: ["cloud"],
        },
        {
          name: "Jovian Vortex Hunter",
          types: ["lidar-jovianVortexHunter"],
        },
      ],
    },
    {
      viewport: "Rover",
      groups: [
        {
          name: "AI4Mars",
          types: ["automaton-aiForMars"],
        },
      ],
    },
    {
      viewport: "Solar Health",
      groups: [
        {
          name: "Sunspots",
          types: ["sunspot"],
        },
      ],
    },
  ];

  // Group user's classifications by mission
  const missionProgress = missions.map((mission) => ({
    viewport: mission.viewport,
    groups: mission.groups.map((group) => {
      const count = classifications.filter((c) =>
        group.types.includes((c.classificationtype || "").toLowerCase())
      ).length;
      return {
        name: group.name,
        count,
      };
    }),
  }));

  return (
    <Section
      sectionId="research-skilltree-viewportSkills"
      variant="minimal"
      backgroundType="none"
    >
      <div className="w-full flex flex-col gap-6 py-8 md:py-12">
        {missionProgress.map((mission) => (
          <div key={mission.viewport} className="">
            <h3 className="text-lg font-bold mb-2 text-primary">{mission.viewport} Viewport</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mission.groups.map((group) => (
                <div key={group.name} className="bg-muted/10 border border-border rounded-lg p-4 flex items-center justify-between">
                  <span className="font-semibold text-chart-2">{group.name}</span>
                  <span className="text-xs text-muted-foreground">{group.count} discovered</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}