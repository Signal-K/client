import { Telescope } from "lucide-react";
import { NextRequest, NextResponse } from "next/server";

const milestones = [
    {
        weekStart: '2025-04-07',
        data: [
            {
                name: 'Make 3 Temperature Classifications',
                structure: 'Telescope',
                icon: "Telescope",
                extendedDescription: "",
                xp: null,
                completionInfo: '',
                rewardInfo: '',
                table: "comments",
                field: "category",
                value: "Temperature",
                requiredCount: 3,
            },
            {
                name: 'Discover 2 planets',
                structure: "Telescope",
                icon: "PawPrintIcon",
                extendedDescription: '',
                xp: null,
                completionInfo: '',
                rewardInfo: '',
                table: "classifications",
                field: "classificationtype",
                value: "planet",
                requiredCount: 2,
            },
            {
                name: "Create a storm on a gas giant",
                structure: "WeatherBalloon",
                icon: "SnowflakeIcon",
                extendedDescription: "",
                completionInfo: "",
                rewardInfo: "",
                table: 'events',
                field: 'eventtype',
                value: 'vortex-storm',
                requiredCount: 1,
            },
        ],
    },
    // {
    //     weekStart: "2025-02-18",
    //     data: [
    //         { 
    //             name: "Find 3 desert creatures", 
    //             structure: "Greenhouse", 
    //             icon: "PawPrintIcon",
    //             extendedDescription: "",
    //             xp: null,
    //             completionInfo: "",
    //             rewardInfo: ""
    //         },
    //         { 
    //             name: "Find ice on a planet", 
    //             structure: "WeatherBalloon", 
    //             icon: "SnowflakeIcon",
    //             extendedDescription: "",
    //             xp: null,
    //             completionInfo: "",
    //             rewardInfo: ""
    //         },
    //         { 
    //             name: "Find a planet in the habitable zone", 
    //             structure: "Telescope", 
    //             icon: "GlassWaterIcon",
    //             extendedDescription: "",
    //             xp: null,
    //             completionInfo: "",
    //             rewardInfo: ""
    //         },
    //     ],
    // },
    // {
    //     weekStart: "2025-02-11",
    //     data: [
    //         { 
    //             name: "Discover a new microbial species", 
    //             structure: "Greenhouse", 
    //             icon: "PawPrintIcon",
    //             extendedDescription: "",
    //             xp: null,
    //             completionInfo: "",
    //             rewardInfo: ""
    //         },
    //         { 
    //             name: "Detect a storm with a weather balloon", 
    //             structure: "WeatherBalloon", 
    //             icon: "SnowflakeIcon",
    //             extendedDescription: "",
    //             xp: null,
    //             completionInfo: "",
    //             rewardInfo: ""
    //         },
    //         { 
    //             name: "Observe a distant exoplanet", 
    //             structure: "Telescope", 
    //             icon: "GlassWaterIcon",
    //             extendedDescription: "",
    //             xp: null,
    //             completionInfo: "",
    //             rewardInfo: ""
    //         },
    //     ],
    // },
];

const communityMilestones = [
    {
        weekStart: "2025-02-18",
        data: [
            { 
                name: "Discover 100 desert creatures", 
                structure: "Greenhouse", 
                icon: "PawPrintIcon",
                extendedDescription: "As the community explores, they find 100 desert creatures across planets.",
                xp: null,
                completionInfo: "The community achieves a combined total of 100 desert creatures discovered.",
                rewardInfo: "Unlocks the 'Desert Explorer' badge for all players."
            },
            { 
                name: "Discover 50 ice formations on planets", 
                structure: "WeatherBalloon", 
                icon: "SnowflakeIcon",
                extendedDescription: "The community explores icy terrains, discovering 50 ice formations.",
                xp: null,
                completionInfo: "A total of 50 ice formations discovered by the community.",
                rewardInfo: "Unlocks the 'Arctic Adventurer' badge for all players."
            },
            { 
                name: "Observe 75 planets in the habitable zone", 
                structure: "Telescope", 
                icon: "GlassWaterIcon",
                extendedDescription: "Through collective efforts, the community identifies 75 planets within habitable zones.",
                xp: null,
                completionInfo: "The community successfully identifies 75 habitable planets.",
                rewardInfo: "Unlocks the 'Habitable Zone Pioneer' badge for all players."
            },
        ],
    },
    // {
    //     weekStart: "2025-02-11",
    //     data: [
    //         { 
    //             name: "Community discovers 50 new microbial species", 
    //             structure: "Greenhouse", 
    //             icon: "PawPrintIcon",
    //             extendedDescription: "The community works together to discover a total of 50 new microbial species.",
    //             xp: null,
    //             completionInfo: "The community has collectively discovered 50 microbial species.",
    //             rewardInfo: "Unlocks the 'Microbial Pioneer' badge for all players."
    //         },
    //         { 
    //             name: "Community detects 30 storms with weather balloons", 
    //             structure: "WeatherBalloon", 
    //             icon: "SnowflakeIcon",
    //             extendedDescription: "The community makes groundbreaking discoveries, detecting 30 storms across planets.",
    //             xp: null,
    //             completionInfo: "30 storms detected by the collective community.",
    //             rewardInfo: "Unlocks the 'Storm Tracker' badge for all players."
    //         },
    //         { 
    //             name: "Community observes 100 distant exoplanets", 
    //             structure: "Telescope", 
    //             icon: "GlassWaterIcon",
    //             extendedDescription: "The community works to observe and catalog 100 distant exoplanets.",
    //             xp: null,
    //             completionInfo: "A total of 100 exoplanets observed by the community.",
    //             rewardInfo: "Unlocks the 'Exoplanet Explorer' badge for all players."
    //         },
    //     ],
    // },
];

export async function GET(req: NextRequest) {
    return NextResponse.json({
        playerMilestones: milestones,
        communityMilestones: communityMilestones,
    });
};