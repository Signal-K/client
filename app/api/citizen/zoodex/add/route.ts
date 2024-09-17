import { NextRequest, NextResponse } from 'next/server';

interface Recipe {
  [key: string]: number;
};

/*

import { NextResponse } from "next/server";
import { DataAPIClient } from "@datastax/astra-db-ts";

const client = new DataAPIClient( process.env.ASTRA_TOKEN )
const db = client.db('https://4504da32-0d63-499c-bdd3-5f74c8aa2512-us-east-2.apps.astra.datastax.com');

export async function GET(req: any) {
    const colls = await db.listCollections();
    console.log('Connected to astradb: ', colls);

    return NextResponse.json({
        success: true,
    });
};*/