import { NextRequest, NextResponse } from "next/server";

interface AutomatonUpgradeModule {
    id: number;
    name: string;
    topic: string;
    level: number;
};

// or do we create a big route for all upgrades/tech trees?