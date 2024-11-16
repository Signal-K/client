'use client';

import { CameraIcon, CloudDrizzleIcon, DogIcon, MicroscopeIcon, SunDimIcon, TelescopeIcon, TestTube } from 'lucide-react';
import { BurrowingOwlIcon } from '../../content/Icons/BurrowingOwl';
import { FishIcon } from '../../content/Icons/FishIcon';
import { StarterTelescope } from '../Projects/Telescopes/Transiting';
import { DailyMinorPlanet } from '../Projects/Telescopes/DailyMinorPlanet';
import { PlanetFourProject } from '../Projects/Satellite/PlanetFour';
import { TelescopeSunspotDetector } from '../Projects/Telescopes/Sunspots';
import { TelescopeDiskDetector } from '../Projects/Telescopes/DiskDetector';
import CameraComponent from '../Projects/Zoodex/Upload/Camera';
import { DataSourcesModal } from './unlockNewDataSources';
import { BurrowingOwl } from '../Projects/Zoodex/burrowingOwls';
import { PenguinWatch } from '../Projects/Zoodex/penguinWatch';
import { ZoodexIguanas } from '../Projects/Zoodex/iguanasFromAbove';

export const zoodexDataSources = [ 
    {
        category: 'Animals',
        items: [
            {
                name: 'Burrowing Owls',
                description: 'Wildwatch Burrowing Owl seeks to document the behaviors and developmental milestones of burrowing owl families “holed up” in Otay Mesa, CA. Motion-activated cameras are strategically positioned at burrow entrances to collect candid data.',
                identifier: 'zoodex-burrowingOwl',
                researchId: 'wildwatch-burrowing-owl',
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
                name: "Penguin Watch",
                description: "Count penguin adults, chicks and eggs in far away lands to help us understand their lives and environment",
                identifier: 'zoodex-penguinWatch',
                researchId: 'penguin-watch',
                researcher: 'zooniverse/penguintom79',
                unlocked: false,
                compatiblePlanetTypes: ['Frozen', 'Lush'],
                bestPlanetType: ['Lush'],
                tutorialMission: 200000010,
                activeStructure: 3104,
                techId: 5,
            },
            {
                name: 'Iguanas from Above',
                description: 'Help us count Galapagos Marine Iguanas from aerial photographs',
                identifier: 'zoodex-iguanasFromAbove',
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
            //     name: 'South Coast Fauna Recovery',
            //     description: 'Help us protect Western Australia's rarest mammal and bird: Gilbert's Potoroo and the Western Ground Parrot',
            //     identifier: 'zoodex-southCoastFaunaRecovery',
            //     researchId: 'south-coast-threatened-fauna-recovery-project',
            //     researcher: 'zooniverse/abbsta',
            //     unlocked: false,
            //     compatiblePlanetTypes: ['Lush'],
            //     bestPlanetType: ['Lush'],
            //     tutorialMission: 3000006,
            //   activeStructure: 3104,
            // },
            {
                name: 'Nest Quest Go',
                description: 'From avocet to vireos, help transcribe historical nest record cards for an exciting variety of species',
                identifier: 'zoodex-nestQuestGo',
                researchId: 'nest-quest-go-bird-medley',
                researcher: 'zooniverse/brbcornell',
                unlocked: false,
                compatiblePlanetTypes: ['Lush'],
                bestPlanetType: ['Lush'],
                tutorialMission: 3000005,
                activeStructure: 3104,
                techId: 5,
            },
            {
                name: "Plankton Portal",
                description: "No plankton = No life in the ocean. Help us better understand the health of our oceans through plankton.",
                identifier: 'zoodex-planktonPortal',
                researchId: 'plankton-portal',
                researcher: 'zooniverse/kelseyswieca',
                unlocked: false,
                compatiblePlanetTypes: ['Lush'],
                bestPlanetType: ['Lush'],
                tutorialMission: 200000012,
                activeStructure: 3104,
                techId: 5,
            },
        ],
    },
];

export const telescopeDataSources = [
    {
        category: 'Planets',
        items: [ 
            {
                name: 'Transiting Exoplanet Survey Satellite Search',
                description: 'Hunt for exoplanet candidates using lightcurve data',
                identifier: 'telescope-tess',
                researchId: 'planet-hunters-tess',
                researcher: 'zooniverse',
                unlocked: false,
                compatiblePlanetTypes: ['Lush', 'Frozen', 'Hellhole', 'Arid'],
                bestPlanetType: ['Lush', 'Frozen', 'Hellhole', 'Arid'],
                tutorialMission: 3000001,
                activeStructure: 3103,
                researched: 'telescope-tess',
                techId: 1,
                dynamicComponent: <StarterTelescope />
            }
        ]
    },
    {
        category: 'Solar System Objects',
        items: [
            {
                name: 'The Daily Minor Planet',
                description: 'Discover new asteroids every day by searching through your telescope data',
                identifier: 'telescope-minorPlanet',
                researchId: 'the-daily-minor-planet',
                researcher: 'zooniverse/fulsdavid',
                unlocked: false,
                compatiblePlanetTypes: ['Arid', 'Hellhole', 'Asteroid', 'Frozen'],
                bestPlanetType: ['Asteroid'],
                tutorialMission: 20000004,
                activeStructure: 3103,
                researched: 'telescope-minorPlanets',
                techId: 1,
                dynamicComponent: <DailyMinorPlanet />
            },
            {
                name: 'Planet Four',
                description: "Help explore the surface and weather of Mars' south polar region",
                identifier: 'satellite-planetFour',
                researchId: 'planet-four',
                researcher: 'zooniverse/mschwamb',
                unlocked: false,
                compatiblePlanetTypes: ['Frozen', 'Lush', 'Asteroid'],
                bestPlanetType: ['Frozen'],
                tutorialMission: 20000005,
                activeStructure: 3103,
                researched: 'satellite-planetFour',
                techId: 1,
                dynamicComponent: <PlanetFourProject />
            }
        ]
    },
    {
        category: 'Solar observations',
        items: [
            {
                name: 'Sun-spot observations',
                description: 'Observe and classify sunspots',
                identifier: 'telescope-sunspots',
                researchId: 'sunspot-detectives',
                researcher: 'zooniverse/teolixx',
                unlocked: false,
                compatiblePlanetTypes: ['Lush', 'Frozen', 'Hellhole', 'Arid'],
                bestPlanetType: ['Lush', 'Frozen', 'Hellhole', 'Arid'],
                tutorialMission: 3000003,
                activeStructure: 3103,
                researched: 'telescope-sunspots',
                techId: 5,
                dynamicComponent: <TelescopeSunspotDetector />
            }
        ] 
    },
    {
        category: 'exo-Solar System Observations',
        items: [
            {
                name: 'Disk Detective',
                description: 'Find the birthplace of solar systems',
                identifier: 'telescope-diskDetective',
                researchId: 'disk-detective',
                researcher: 'zooniverse/ssilverberg',
                unlocked: false,
                compatiblePlanetTypes: ['Lush', 'Frozen', 'Hellhole', 'Arid'],
                bestPlanetType: ['Lush', 'Frozen', 'Hellhole', 'Arid'],
                tutorialMission: 3000009,
                activeStructure: 3103,
                researched: 'telescope-diskDetective',
                techId: 5,
                dynamicComponent: <TelescopeDiskDetector />
            }
        ]
    }
];


export const lidarDataSources = [
    {
        category: 'Clouds',
        items: [
            {
                name: 'Martian Cloud Survey',
                description: 'Survey and classify clouds on Mars and similar planets',
                identifier: 'lidar-martianClouds',
                researchId: 'cloudspotting-on-mars',
                researcher: 'zooniverse',
                // icon: CloudDrizzleIcon,
                unlocked: false,
                compatiblePlanetTypes: ['Frozen', 'Arid'],
                bestPlanetType: ['Frozen'],
                tutorialMission: 3000010,
                activeStructure: 3105,
                techId: 5,
            },
            {
                name: 'Jovian Vortex Hunter',
                description: "Help find interesting features & discover fluid dynamics in Jupiter's atmosphere",
                identifier: 'lidar-jovianVortexHunter',
                researchId: 'jovian-vortex-hunter',
                researcher: 'zooniverse/ramanakumars',
                unlocked: false,
                compatiblePlanetTypes: ['GasGiant', 'IceGiant', 'Asteroid', 'Frozen'],
                bestPlanetType: ['GasGiant'],
                tutorialMission: 20000007,
                activeStructure: 3105,
                techId: 5,
            },
        ],
    },
];

export const physicsLabDataSources = [
    {
        category: 'Particle Accelerator',
        items: [
            {
                name: 'Cosmic Muon Images',
                description: 'Using Muon Tomography we can probe the internal structure of massive objects, like volcanoes, with particles from stars and galaxies far far away... help us identify these particles inside our detectors',
                identifier: 'physicslab-cosmicMuons',
                researchId: 'muon-cosmic-muon-images',
                researcher: 'zooniverse/reinforce',
                unlocked: false,
                compatiblePlanetTypes: ['Frozen', 'Hellhole', 'Arid', 'Lush', 'IceGiant', 'GasGiant'],
                bestPlanetType: ['Hellhole'],
                tutorialMission: 20000002,
                activeStructure: 31010,
                techId: 6,
            },
            {
                name: 'Name that Neutrino',
                description: 'When a neutrino interacts in ice, a signal or light pattern is produced. Classify the shape of the signals to help us understand the pattern and movement of these particles',
                identifier: 'physicslab-neutrinoName',
                researchId: 'name-that-neutrino',
                researcher: 'zooniverse/icecubeobservatory',
                unlocked: false,
                compatiblePlanetTypes: ['Frozen', 'Hellhole', 'Arid', 'Lush', 'IceGiant', 'GasGiant'],
                bestPlanetType: ['Frozen'],
                tutorialMission: 20000001,
                activeStructure: 31010,
                techId: 6,
            },
        ],
    },
];

export const roverDataSources = [
    {
        category: 'Terrain',
        items: [
            {
                name: 'Rover photo analysis',
                description: 'Classify photos from your rover to interpret the terrain formation',
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
            {
                name: 'AI For Mars',
                description: 'Help improve the rovers’ ability to identify different, sometimes dangerous terrain - an essential skill for autonomous exploration',
                identifier: 'automaton-aiForMars',
                researchId: 'ai4mars',
                researcher: 'zooniverse/hiro-ono',
                unlocked: false,
                compatiblePlanetTypes: ['Frozen', 'Hellhole', 'Arid', 'Lush', 'Asteroid',],
                bestPlanetType: ['Frozen'],
                tutorialMission: 20000006,
                activeStructure: 3102,
                techId: 2, // Add satellite
            },
        ],
    },
    {
        category: 'Clouds',
        items: [
            {
                name: 'Martian Cloud Survey',
                description: 'Survey and classify clouds on Mars and similar planets',
                identifier: 'lidar-martianClouds',
                researchId: 'cloudspotting-on-mars',
                researcher: 'zooniverse',
                // icon: CloudDrizzleIcon,
                unlocked: false,
                compatiblePlanetTypes: ['Frozen', 'Arid'],
                bestPlanetType: ['Frozen'],
                tutorialMission: 3000010,
                activeStructure: 3105,
                techId: 5,
            },
            {
                name: 'Jovian Vortex Hunter',
                description: "Help find interesting features & discover fluid dynamics in Jupiter's atmosphere",
                identifier: 'lidar-jovianVortexHunter',
                researchId: 'jovian-vortex-hunter',
                researcher: 'zooniverse/ramanakumars',
                unlocked: false,
                compatiblePlanetTypes: ['GasGiant', 'IceGiant', 'Asteroid', 'Frozen'],
                bestPlanetType: ['GasGiant'],
                tutorialMission: 20000007,
                activeStructure: 3105,
                techId: 5,
            },
        ],
    },
];

// Extra (#zoodex):
            // {
            //     name: 'Fish Research',
            //     description: 'Hello there',
            //     identifier: 'zoodex-fishResearch',
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
    //     category: 'Plants',
    //     items: [
    //         {
    //             name: 'Test Tube Plant',
    //             description: 'Description for test tube plant',
    //             identifier: 'zoodex-testTubePlant',
    //             researchId: 'testtube-plant',
    //             researcher: 'botanical-society',
    //             // icon: TestTube,
    //             unlocked: false,
    //             compatiblePlanetTypes: ['Arid', 'Frozen'],
    //             // bestPlanetType: ['Lush'],
    //         },
    //     ],
    // },