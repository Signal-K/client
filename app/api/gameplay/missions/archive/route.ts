import { NextRequest, NextResponse } from "next/server";

interface UserMissionInstance {
    id: number;
    user: string;
    time_of_completion: string; 
    mission: number;
};

export interface Mission {
    id: number;
    name: string;
    sequence?: number;
    description?: string;
    rewards?: number[];
    classificationModule?: string;
    structure?: number;
    chapter?: number;
    component?: React.ComponentType<any>;
};

const missions: Mission[] = [
    { id: 1, name: "Pick planet", description: "Select your starting planet", rewards: [29] }, // Possibly the user should get something, but really they're already getting a planet, so... | After further consideration for the order of missions, I think that giving the spaceship and then the rover will be a good option
    { id: 2, name: "Complete profile", description: "Fill in your profile data", rewards: [22] }, // Give them a rover/automaton without a location, we'll create a button that keeps track of the item that was created and show the user an option to "place" un-locationised items/structures
    { id: 3, name: "Go to planet", description: "Land on your home planet", rewards: [12] }, // Empty/stub mission, purely to determine if the user visits their planet. | Will give the user a base telescope.
    { id: 4, name: "Build vehicle structure", description: "Now you do this, you'll be able to create automatons", rewards: [] }, // Empty/stub mission, purely for the user to make the Vehicle Structure. Will give them an automaton, however, as we currently don't have a crafting recipe for it. Actually, we don't need to do this, as the first automaton is always fee (see Automaton.tsx)
    { id: 5, name: "First automaton", description: "Build your first automaton to explore your planet", rewards: [13, 13, 13, 16, 16] }, // Give them the resources required to build the Telescope Signal Receiver
    { id: 6, name: "Deploy automaton", description: "Deploy an automaton for the first time", rewards: [13, 13, 15]}, // User will receive the components required to build item id 14, as well as whatever the automaton finds
    { id: 7, name: "Build telescope", description: "Build a telescope & subsequent modules to learn more about your planet", rewards: [13]}, // Meaningless/stub reward
    { id: 8, name: "Make classification", description: "Classify the validity of your planet by looking at your TIC ID", rewards: [13, 13, 13, 16] ,}, // Gives the user the constituent parts to make a surveyor module for their telescope
    { id: 9, name: "Collect resources part 2", description: "Collect resources to build your mining station", rewards: [13]},
    { id: 10, name: "Build mining station", description: "By doing this you can now collect omega resources", rewards: []}, // Not included
    { id: 11, name: "Collect resources from station", description: "You can now build your cloud-spotting telescope!", rewards: []},
    { id: 12, name: "Build Meteorology tool", description: "You can now classify clouds on your planet!", rewards: []},
    { id: 13, name: "Create cloud classification", description: "You can now classify clouds on your planet!", rewards: []},
    { id: 14, name: "Collect resources for camera module", description: "You can now classify clouds on your planet!", rewards: []},
    { id: 15, name: "Craft camera module", description: "You can now classify clouds on your planet!", rewards: []}, // Not included
    { id: 16, name: "Craft camera receiver station", description: "You can now classify clouds on your planet!", rewards: []}, // Not included
    { id: 17, name: "Collect a photo", description: "You can now classify clouds on your planet!", rewards: []},
    { id: 18, name: "Make classification of photo", description: "You can now classify clouds on your planet!", rewards: []},
    { id: 19, name: "Go mining for surveyor parts", description: "You can now classify clouds on your planet!", rewards: []}, // Not included
    { id: 20, name: "Build surveyor structure", description: "You can now classify clouds on your planet!", rewards: []}, // Not included
    { id: 21, name: "Make surveyor classification", description: "You can now classify clouds on your planet!", rewards: []},
    { id: 100, name: "Populate your planet", description: "", rewards: []},

    // { id: 1370101, name: "Create your account", description: "Create an account to start playing Star Sailors", rewards: []}, // ID: "Mission Group 01, Item 01" - 13 = M, 7 = G
    { id: 1370102, name: "Create your profile", description: "Fill in your profile so that your discoveries can be credited", rewards: [], }, //chapter: 'Onboarding'},
    { id: 1370103, name: "Discover your first planet", description: "Use the first graphs provided to you to confirm the validity of an exoplanet candidate", rewards: [], }, //chapter: 'Onboarding'}, // Update description so the user understands they'll be visiting/based on this planet after the onboarding
    { id: 1370104, name: 'Initial roover photos classification', description: 'Send out a rover to explore your planet', rewards: [], }, //chapter: 'Onboarding'},
    // { id: 1370105, name: 'Initial animal classification', description: 'Update this row', rewards: [], chapter: 'Onboarding',},
    { id: 1370106, name: 'Generated planet', description: "Here's what we know about your planet. Why not visit it?", rewards: [], }, //chapter: 'Onboarding'},
    {
        id: 1370107, name: "Activate retro mode", description: "Going back to the first V2.0 beta after finishing onboarding", rewards: [], }, //chapter: 'Onboarding'},

    // Chapter 1 mission group (MG-02-##) - mission group 2
    {
        id: 1370201,
        name: "Initialise chapter 1", 
        description: '',
        chapter: 1,
        sequence: 1,
        classificationModule: 'Mining' // Update this
    },
    {
        id: 1370203,
        name: 'Choose your first classification',
        description: 'Fill me', // up
        classificationModule: 'General',
        sequence: 2,
        chapter: 1
    },
    {
        id: 1370204,
        name: 'Complete your first (chosen) classification',
        description: 'As part of Chapter 1',
        classificationModule: 'General',
        sequence: 3,
        chapter: 1
    },
    {
        id: 1370205,
        name: 'Go mining - first iron',
        classificationModule: 'Mining',
        sequence: 4,
        chapter: 1,
    },
    {
        id: 1370206,
        name: 'Repair the Research Station',
        description: 'As part of Chapter 1', // Also creates it
        classificationModule: 'General',
        sequence: 5,
        chapter: 1,
    },
    {
        id: 1370207,
        name: 'Research a new technology',
        classificationModule: 'General',
        sequence: 6,
        chapter: 1,
    },
    {
        id: 1370208,
        name: 'Second classification (different structure)',
        classificationModule: 'General',
        sequence: 7,
        chapter: 1,
    },
    {
        id: 1370209,
        name: 'Transition to chapter 2',
        sequence: 8, // Still need to determine scope
        chapter: 1,
    },
    {
        id: 1370299,  // -> Edit the id so that it's the last value for mission group 2
        name: "Find new planet", 
        chapter: 1, 
        description: "Now you're ready to travel to other planets", 
        sequence: 3,
        classificationModule: "Telescope"
    },


    // Animal/Zoodex mission group (a.z.) (MG-AZ-##)
    {
        id: 1370202, 
        name: "First animal classification", 
        description: '', 
        chapter: 1, 
        classificationModule: "Zoodex",
        sequence: 3,
        // component: MineralDepositsNoAction,
        structure: 3104
    },
    // Telescope mission group (t.m.) (MG-T-##)
    {
        id: 1372001, name: "Initial planet classification", classificationModule: "Telescope", chapter: 1,
        sequence: 3,
        structure: 3103
        // update this/order
    },

    // LIDAR/meteorology mission group (l.m.) (MG-LM-##)
    { // This is your first
        id: 137121301, name: "Discover some clouds", classificationModule: 'LIDAR', chapter: 1, sequence: 3, structure: 3105,
    },

    // NASA/APPEEARS Roover data | NASA API (MG-NA-##)
    { // This is your first
        id: 13714101, name: "Find some rover pics", classificationModule: 'AutomatonCamera', chapter: 1, sequence: 3, structure: 3102,
    },



    // First classifications list - the prod list
    {
        id: 3000001, // Also interchanges with 1370103
        name: "First planet classification",
        description: "Telescope > Lightkurve",
    },
    {
        id: 3000002,
        name: "First burrowing owl classification",
        description: "Zoodex > zoodexBurrowingOwl",
    },
    {
        id: 3000003,
        name: "First sunspot classification",
        description: "Telescope > telescopeSunspot",
    },
    {
        id: 3000004,
        name: "First iguana classification",
        description: "Zoodex > zoodexIguanasFromAbove",
    },
    {
        id: 3000005,
        name: "First nest classification",
        description: "Zoodex > zoodexNestQuestGo",
    },
    {
        id: 3000006,
        name: "First south coast fauan recovery classification",
        description: "Zoodex > zoodexSouthCoastFaunaRecovery",
    },
    {
        id: 3000007,
        name: "First fish classification",
        description: "Zoodex > zoodexFishResearch",
    },
    {
        id: 3000008,
        name: "First plant classification",
        description: "Zoodex > zoodexTestTubePlant",
    },
    {
        id: 3000009,
        name: "First Disk Detective classification",
        description: "Zoodex > zoodexDiskDetective",
    },
    {
        id: 3000010,
        name: "First martian cloud classification",
        description: "Zoodex > zoodexMartianClouds",
    },
    {
        id: 3000011,
        name: "First mars rover classification",
        description: "AutomatonStation > roverPhotos",
    },

    // { id: 1370101, name: "Create your account", description: "Create an account to start playing Star Sailors", rewards: []}, // ID: "Mission Group 01, Item 01" - 13 = M, 7 = G
    { id: 1370102, name: "Create your profile", description: "Fill in your profile so that your discoveries can be credited", rewards: [], }, //chapter: 'Onboarding'},
    { id: 1370103, name: "Discover your first planet", description: "Use the first graphs provided to you to confirm the validity of an exoplanet candidate", rewards: [], }, //chapter: 'Onboarding'}, // Update description so the user understands they'll be visiting/based on this planet after the onboarding
    { id: 1370104, name: 'Initial roover photos classification', description: 'Send out a rover to explore your planet', rewards: [], }, //chapter: 'Onboarding'},
    // { id: 1370105, name: 'Initial animal classification', description: 'Update this row', rewards: [], chapter: 'Onboarding',},
    { id: 1370106, name: 'Generated planet', description: "Here's what we know about your planet. Why not visit it?", rewards: [], }, //chapter: 'Onboarding'},
    {
        id: 1370107, name: "Activate retro mode", description: "Going back to the first V2.0 beta after finishing onboarding", rewards: [], }, //chapter: 'Onboarding'},

    // Chapter 1 mission group (MG-02-##) - mission group 2
    {
        id: 1370201,
        name: "Initialise chapter 1", 
        description: '',
        chapter: 1,
        sequence: 1,
        classificationModule: 'Mining' // Update this
    },
    {
        id: 1370203,
        name: 'Choose your first classification',
        description: 'Fill me',
        classificationModule: 'General',
        sequence: 2,
        chapter: 1
    },
    {
        id: 1370204,
        name: 'Complete your first (chosen) classification',
        description: 'As part of Chapter 1',
        classificationModule: 'General',
        sequence: 3,
        chapter: 1
    },
    {
        id: 1370205,
        name: 'Go mining - first iron',
        classificationModule: 'Mining',
        sequence: 4,
        chapter: 1,
    },
    {
        id: 1370206,
        name: 'Repair the Research Station',
        description: 'As part of Chapter 1', // Also creates it
        classificationModule: 'General',
        sequence: 5,
        chapter: 1,
    },
    {
        id: 1370207,
        name: 'Research a new technology',
        classificationModule: 'General',
        sequence: 6,
        chapter: 1,
    },
    {
        id: 1370208,
        name: 'Second classification (different structure)',
        classificationModule: 'General',
        sequence: 7,
        chapter: 1,
    },
    {
        id: 1370209,
        name: 'Transition to chapter 2',
        sequence: 8, // Still need to determine scope
        chapter: 1,
    },
    {
        id: 1370299,  // -> Edit the id so that it's the last value for mission group 2
        name: "Find new planet", 
        chapter: 1, 
        description: "Now you're ready to travel to other planets", 
        sequence: 3,
        classificationModule: "Telescope"
    },


    // Animal/Zoodex mission group (a.z.) (MG-AZ-##)
    {
        id: 1370202, 
        name: "First animal classification", 
        description: '', 
        chapter: 1, 
        classificationModule: "Zoodex",
        sequence: 3,
        // component: MineralDepositsNoAction,
    },
    // Telescope mission group (t.m.) (MG-T-##)
    {
        id: 1372001, name: "Initial planet classification", classificationModule: "Telescope", chapter: 1,
        sequence: 3,
        // update this/order
    },

    // LIDAR/meteorology mission group (l.m.) (MG-LM-##)
    { // This is your first
        id: 137121301, name: "Discover some clouds", classificationModule: 'LIDAR', chapter: 1, sequence: 3,
    },

    // NASA/APPEEARS Roover data | NASA API (MG-NA-##)
    { // This is your first
        id: 13714101, name: "Find some rover pics", classificationModule: 'AutomatonCamera', chapter: 1, sequence: 3,
    },



    // Repairing
    {
        id: 1372002, name: "Repair your telescope", classificationModule: "Telescope", chapter: 1,
        // sequence: 5+,
        // component: MineralDepositsNoAction,
    },
    {
        id: 13712602, name: "Repair your Zoodex module", classificationModule: "Zoodex", chapter: 1, 
    },



    // Research topics
    // Chapter 1
    {
        id: 1800001,
        name: "Research telescope",
        classificationModule: 'Telescope',
        chapter: 1,
    },
    {
        id: 1800002,
        name: "Research LIDAR",
        classificationModule: 'LIDAR',
        chapter: 1,
    },
    {
        id: 1800003,
        name: "Research Zoodex",
        classificationModule: 'Zoodex',
        chapter: 1,
    },
    {
        id: 1800004,
        name: "Research rover photo module",
        classificationModule: 'AutomatonCamera',
        chapter: 1,
    },

    // Chapter 2
    {
        id: 1800005,
        name: "Ability to upload photos to Zoodex",
        classificationModule: 'Zoodex',
        chapter: 2,
    },
    {
        id: 1800006,
        name: "Phase folded graphs",
        classificationModule: 'Telescope',
        chapter: 2,
    }
];

export async function GET(req: NextRequest) {
    return NextResponse.json(missions);
};