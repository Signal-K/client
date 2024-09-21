import { NextRequest, NextResponse } from "next/server";
import { MineralDepositsNoAction } from "@/app/components/(structures)/Mining/AvailableDeposits";
import { Mission } from "@/app/components/(structures)/StructuresForMission";

interface UserMissionInstance {
    id: number;
    user: string;
    time_of_completion: string;
    mission: number;
    structure?: number;
};

const missions: Mission[] = [
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
        component: MineralDepositsNoAction,
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
];

export async function GET(req: NextRequest) {
    return NextResponse.json(missions);
};