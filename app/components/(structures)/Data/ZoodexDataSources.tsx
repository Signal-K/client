"use client";

import { TestTube } from "lucide-react";
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
                icon: BurrowingOwlIcon,
                unlocked: false,
            },
            {
                name: "Fish Research",
                description: 'Hello there',
                identifier: "zoodex-fishResearch",
                researchId: 'ghigrh',
                researcher: 'zooniverse',
                icon: FishIcon,
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
                icon: TestTube,
                unlocked: false,
            },
        ],
    },
];