"use client";

import { CloudDrizzleIcon, SunDimIcon, TelescopeIcon, TestTube } from "lucide-react";
import { BurrowingOwlIcon } from "../../Icons/BurrowingOwl";
import { FishIcon } from "../../Icons/FishIcon";

export const zoodexDataSources = [
    {
        category: "Animals",
        items: [
            {
                name: "Burrowing Owls",
                description: "Wildwatch Burrowing Owl seeks to document the behaviors and developmental milestones of burrowing owl families “holed up” in Otay Mesa, CA. Motion-activated cameras are strategically positioned at burrow entrances to collect candid data.",
                identifier: "zoodex-burrowingOwl",
                researchId: "wildwatch-burrowing-owl",
                researcher: 'sandiego-zoo-global',
                // icon: BurrowingOwlIcon,
                unlocked: false,
            },
            {
                name: "Fish Research",
                description: 'Hello there',
                identifier: "zoodex-fishResearch",
                researchId: 'ghigrh',
                researcher: 'zooniverse',
                // icon: FishIcon,
                unlocked: false,
            },
        ],
    },
    {
        category: "Plants",
        items: [
            {
                name: "Test Tube Plant",
                description: 'Description for test tube plant',
                identifier: "zoodex-testTubePlant",
                researchId: 'testtube-plant',
                researcher: 'botanical-society',
                // icon: TestTube,
                unlocked: false,
            },
        ],
    },
];

export const telescopeDataSources = [
    {
        category: "Planets",
        items: [
            {
                name: "Transiting Exoplanet Survey Satellite Search",
                description: "Hunt for exoplanet candidates using lightcurve data",
                identifier: 'telescope-tess',
                researchId: 'planet-hunters-tess',
                researcher: 'zooniverse',
                // icon: TelescopeIcon,
                unlocked: false,
            },
            // Other (non-transiting) planet candidates here
        ],
    },
    {
        category: "Solar observations",
        items: [
            {
                name: "Sun-spot observations",
                description: "Observe and classify sunspots",
                identifier: 'telescope-sunspots',
                researchId: 'sunspot-classifier',
                researcher: 'zooniverse',
                // icon: SunDimIcon,
                unlocked: false,
            },
        ],
    },
];

export const lidarDataSources = [
    {
        category: "Clouds",
        items: [
            {
                name: "Martian Cloud Survey",
                description: "Survey and classify clouds on Mars and similar planets",
                identifier: 'lidar-martianClouds',
                researchId: 'cloudspotting-on-mars',
                researcher: 'zooniverse',
                // icon: CloudDrizzleIcon,
                unlocked: false,
            },
        ],
    },
];

export const roverDataSources = [
    {
        category: "Terrain",
        items: [
            {
                name: "Rover photo analysis",
                description: "Classify photos from your rover to interpret the terrain formation",
                identifier: 'automaton-roverPhotos',
                researchId: 'null',
                researcher: 'star-sailors',
                unlocked: false,
            },
        ],
    },
];