import { NextRequest, NextResponse } from "next/server";

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

const chapterOneMissions: Mission[] = [
    {
        id: 10000001,
        name: 'Initialise Chapter 1',
    },

    // Classifications
    {
        id: 10000002,
        name: 'Choose your first classification',
    },

    // Classification tutorials
    {
        // id: 100000021,
        id: 3000001,
        name: 'Complete Telescope > TESS tutorial', 
    },
    {
        // id: 100000022,
        id: 3000003,
        name: 'Complete Telescope > Sunspots tutorial',
    },
    {
        // id: 100000023,
        id: 3000009,
        name: 'Complete Telescpe > Disk Detector tutorial',
    },
    {
        id: 3000010,
        // id: 100000024,
        name: 'Complete LIDAR > Martian Clouds tutorial',
    },
    {
        // id: 100000025,
        id: 3000002,
        name: 'Complete Zoodex > Burrowing Owls tutorial',
    },
    {
        // id: 100000026,
        id: 3000004,
        name: 'Complete Zoodex > Iguanas from above tutorial',
    },
    {
        id: 100000027,
        name: 'Complete Zoodex > South Coast Fauna Recovery tutorial',
    },
    {
        id: 3000005,
        // id: 100000028,
        name: 'Complete Zoodex > Nest Quest Go tutorial',
    },

    // User classifications
    {
        id: 10000003,
        name: 'Complete first (chosen) classification',
    },
    {
        id: 100000031,
        name: 'Complete (first) Telescope > TESS classification',
    },
    {
        id: 100000032,
        name: 'Complete (first) Telescope > Sunspots',
    },
    {
        id: 100000033,
        name: 'Complete (first) Telescpe > Disk Detector',
    },
    {
        id: 100000034,
        name: 'Complete (first) LIDAR > Martian Clouds',
    },
    {
        id: 100000035,
        name: 'Complete (first) Zoodex > Burrowing Owls',
    },
    {
        id: 100000036,
        name: 'Complete (first) Zoodex > Iguanas from above',
    },
    {
        id: 100000037,
        name: 'Complete (first) Zoodex > South Coast Fauna Recovery',
    },
    {
        id: 100000038,
        name: 'Complete (first) Zoodex > Nest Quest Go',
    },

    // Next step (after (first) classification)
    {
        id: 10000004,
        name: "Choose next step (after (first) classification)",
    },

    // If/when user chooses to travel
    {
        id: 100000041,
        name: 'Research spaceship',
    },
    {
        id: 100000042,
        name: "Research launchpad",
    },
    {
        id: 100000043,
        name: 'Build spaceship',
    },
    {
        id: 100000044,
        name: 'Build launchpad',
    },
    {
        id: 100000045,
        name: "Complete launchpad tutorial",
    },
    {
        id: 100000046,
        name: "Complete spaceship tutorial",
    },
    {
        id: 100000047,
        name: 'Complete Planet Switcher tutorial',
    },
    
    // If user chooses to pursue a new module on the same structure
    {
        id: 100000048,
        name: 'Initialise same structure, new module',
    },
    {
        id: 100000049,
        name: 'Research a new module',
    }, // Then completing the tutorial and first classification for that module would go back to 10000002/3

    // If user chooses to pursue a new structure
    {
        id: 10000000410,
        name: "Initialise new structure research",
    },
    {
        id: 10000000411,
        name: 'Research new structure',
    },
    {
        id: 10000000412,
        name: "Place new structure",
    }, // Then 100000049, then 10000002/3

    // Finishing #Chapter-1 (travelling)
    {
        id: 100000005,
        name: "Pick new planet and travel",
    },

    // Any resource collection missions...
];

export async function GET(req: NextRequest) {
    return NextResponse.json(chapterOneMissions);
};