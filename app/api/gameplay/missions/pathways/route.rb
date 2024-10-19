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