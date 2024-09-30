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
                researcher: 'zooniverse/sandiego-zoo-global',
                // icon: BurrowingOwlIcon,
                unlocked: false,
                compatiblePlanetTypes: ['Lush'],
                bestPlanetType: ['Lush'],
                tutorialMission: 3000002,
                activeStructure: 3104,
                techId: 5,
                
            },
            {
                name: "Iguanas from Above",
                description: "Help us count Galapagos Marine Iguanas from aerial photographs",
                identifier: "zoodex-iguanasFromAbove",
                researchId: 'iguanas-from-above',
                researcher: 'zooniverse/andreavarela89',
                unlocked: false,
                compatiblePlanetTypes: ['Lush'],
                bestPlanetType: ['Lush'],
                tutorialMission: 3000004,
                activeStructure: 3104,
                techId: 5,
            },
            // {
            //     name: "South Coast Fauna Recovery",
            //     description: "Help us protect Western Australia's rarest mammal and bird: Gilbert's Potoroo and the Western Ground Parrot",
            //     identifier: "zoodex-southCoastFaunaRecovery",
            //     researchId: 'south-coast-threatened-fauna-recovery-project',
            //     researcher: 'zooniverse/abbsta',
            //     unlocked: false,
            //     compatiblePlanetTypes: ['Lush'],
            //     bestPlanetType: ['Lush'],
            //     tutorialMission: 3000006,
            //   activeStructure: 3104,
            // },
            {
                name: "Nest Quest Go",
                description: "From avocet to vireos, help transcribe historical nest record cards for an exciting variety of species",
                identifier: "zoodex-nestQuestGo",
                researchId: 'nest-quest-go-bird-medley',
                researcher: 'zooniverse/brbcornell',
                unlocked: false,
                compatiblePlanetTypes: ['Lush'],
                bestPlanetType: ['Lush'],
                tutorialMission: 3000005,
                activeStructure: 3104,
                techId: 5,
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
                compatiblePlanetTypes: ['Lush', 'Frozen', 'Hellhole', 'Arid'],
                bestPlanetType: ['Lush', 'Frozen', 'Hellhole', 'Arid'],
                tutorialMission: 3000001,
                activeStructure: 3103,
                researched: "telescope-tess",
                techId: 1,
            },
            // Other (non-transiting) planet candidates here e.g. microlensing, radial velocity
        ],
    },
    {
        category: "Solar observations",
        items: [
            {
                name: "Sun-spot observations",
                description: "Observe and classify sunspots",
                identifier: 'telescope-sunspots',
                researchId: 'sunspot-detectives',
                researcher: 'zooniverse/teolixx',
                // icon: SunDimIcon,
                unlocked: false,
                compatiblePlanetTypes: ['Lush', 'Frozen', 'Hellhole', 'Arid'],
                bestPlanetType: ['Lush', 'Frozen', 'Hellhole', 'Arid'],
                tutorialMission: 3000003,
                activeStructure: 3103,
                researched: "telescope-sunspots",
                techId: 5,
            },
        ],
    },
    {
        category: "exo-Solar System Observations",
        items: [
            {
                name: "Disk Detective",
                description: "Find the birthplace of solar systems",
                identifier: 'telescope-diskDetective',
                researchId: 'disk-detective',
                researcher: 'zooniverse/ssilverberg',
                unlocked: false,
                compatiblePlanetTypes: ['Lush', 'Frozen', 'Hellhole', 'Arid'],
                bestPlanetType: ['Lush', 'Frozen', 'Hellhole', 'Arid'],
                tutorialMission: 3000009,
                activeStructure: 3103,
                researched: "telescope-diskDetective",
                techId: 5,
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
                compatiblePlanetTypes: ['Frozen, Arid'],
                bestPlanetType: ['Frozen'],
                tutorialMission: 3000010,
                activeStructure: 3105,
                techId: 5,
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
                compatiblePlanetTypes: ['Frozen', 'Hellhole', 'Arid', 'Lush'],
                bestPlanetType: ['Frozen'],
                tutorialMission: 3000011,
                activeStructure: 3102,
                techId: 5,
            },
        ],
    },
];

// Extra (#zoodex):
            // {
            //     name: "Fish Research",
            //     description: 'Hello there',
            //     identifier: "zoodex-fishResearch",
            //     researchId: 'ghigrh',
            //     researcher: 'zooniverse',
            //     // icon: FishIcon,
            //     unlocked: false,
            //     compatiblePlanetTypes: ['Lush'],
            //     bestPlanetType: ['Lush'],
            // },
        // ],
    // },
    // {
    //     category: "Plants",
    //     items: [
    //         {
    //             name: "Test Tube Plant",
    //             description: 'Description for test tube plant',
    //             identifier: "zoodex-testTubePlant",
    //             researchId: 'testtube-plant',
    //             researcher: 'botanical-society',
    //             // icon: TestTube,
    //             unlocked: false,
    //             compatiblePlanetTypes: ['Arid', 'Frozen'],
    //             // bestPlanetType: ['Lush'],
    //         },
    //     ],
    // },