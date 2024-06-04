import { NextRequest, NextResponse } from "next/server";

interface UserMissionInstance {
    id: number;
    user: string;
    time_of_completion: string;
    mission: number;
};

interface Mission {
    id: number;
    name: string;
    description: string;
    reward: number; // i.e. what item in inventory route.ts is rewarded upon completion
};

const missions: Mission[] = [
    { id: 1, name: "Pick planet", description: "Select your starting planet", reward: 0 }, // Possibly the user should get something, but really they're already getting a planet, so...
    { id: 2, name: "Complete profile", description: "Fill in your profile data", reward: 29 }, // Or whatever the item id of the starting spaceship would be.
];