"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { Card } from "@/components/ui/card";

interface Classification {
    id: number;
    anomaly: number;
    classificationtype: string;
};

const GeneratedStarterPlanet: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [classifications, setClassifications] = useState<Classification[]>([]);
    const [oneLightcurve, setOneLightcurve] = useState<Classification | null>(null);
    const [oneRoverImg, setOneRoverImg] = useState<Classification | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchClassifications = async () => {
            if (!session || !activePlanet) return;

            try {
                // Fetch all classifications related to the activePlanet
                const { data: allClassifications, error: allError } = await supabase
                    .from("classifications")
                    .select("id, anomaly, classificationtype")
                    .eq("author", session.user.id)
                    .eq("anomaly", activePlanet.id);

                if (allError) throw allError;

                setClassifications(allClassifications || []);

                // Fetch one classification of each type
                const lightcurve = allClassifications?.find(c => c.classificationtype === "lightcurve") || null;
                const roverImg = allClassifications?.find(c => c.classificationtype === "roverImg") || null;

                setOneLightcurve(lightcurve);
                setOneRoverImg(roverImg);
                
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClassifications();
    }, [supabase, session, activePlanet]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const totalClassifications = classifications.length;
    const anomalyTypes = new Set(classifications.map(c => c.classificationtype)).size;
    const uniqueAnomalies = new Set(classifications.map(c => c.anomaly)).size;

    const getImageUrl = (anomalyId: number, level: number) => {
        return `https://hlufptwhzkpkkjztimzo.supabase.co/storage/v1/object/public/anomalies/${anomalyId}/${level}.png`;
    };

    const getImage = () => {
        const anomalyId = activePlanet.id; // Adjust this if needed
        if (totalClassifications > 6 && anomalyTypes > 4) {
            return getImageUrl(anomalyId, 4);
        }
        if (anomalyTypes > 2 || (anomalyTypes > 1 && totalClassifications > 4)) {
            return getImageUrl(anomalyId, 3);
        }
        if (anomalyTypes > 1) {
            return getImageUrl(anomalyId, 2);
        }
        return getImageUrl(anomalyId, 1);
    };

    return (
        <Card className="w-full max-w-md mx-auto p-6 grid gap-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Postcards from {activePlanet.content}</h2>
                <p className="text-muted-foreground">Discoveries from your latest expedition</p>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-lg">
                <img
                    src={getImage()}
                    alt={activePlanet.name}
                    className="object-cover"
                    width="400"
                    height="400"
                    style={{ aspectRatio: "400/400", objectFit: "cover" }}
                />
            </div>
            <div className="grid gap-4">
                <div className="bg-muted rounded-lg p-4 grid gap-2">
                    <h3 className="text-lg font-medium">Discoveries</h3>
                    <ul className="space-y-2 text-sm">
                        {oneLightcurve && (
                            <li>
                                <div className="flex items-center gap-2">
                                    <TelescopeIcon className="w-5 h-5 text-primary" />
                                    <span>Discovered light curve patterns in the data</span>
                                </div>
                            </li>
                        )}
                        {oneRoverImg && (
                            <li>
                                <div className="flex items-center gap-2">
                                    <LeafIcon className="w-5 h-5 text-primary" />
                                    <span>Captured rover images of the surface</span>
                                </div>
                            </li>
                        )}
                        {!oneLightcurve && !oneRoverImg && (
                            <li>
                                <div className="flex items-center gap-2">
                                    <DropletIcon className="w-5 h-5 text-primary" />
                                    <span>No significant discoveries to report</span>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </Card>
    );
};

function DropletIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
        </svg>
    );
}

function LeafIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
    );
}

function TelescopeIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44" />
            <path d="m13.56 11.747 4.332-.924" />
            <path d="m16 21-3.105-6.21" />
            <path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z" />
            <path d="m6.158 8.633 1.114 4.456" />
            <path d="m8 21 3.105-6.21" />
            <circle cx="12" cy="13" r="2" />
        </svg>
    );
}

export default GeneratedStarterPlanet;