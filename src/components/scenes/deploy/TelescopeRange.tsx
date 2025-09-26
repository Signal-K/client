'use client';

import type React from "react";
import { useState, useEffect } from "react";
import { Slider } from "@/src/components/ui/slider";
import { Button } from "@/src/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card";
import {
    Telescope,
    AsteriskIcon as Asteroids,
    Sun,
    Star,
    SpaceIcon as Planet,
} from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export default function TelescopeRangeSlider() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [range, setRange] = useState([50]);
    const [dropRates, setDropRates] = useState<Record<string, number>>({});
    const [fetchedAnomalies, setFetchedAnomalies] = useState<any[]>([]);
    const [alreadyDeployed, setAlreadyDeployed] = useState<boolean>(false);
    const [deploymentMessage, setDeploymentMessage] = useState<string | null>(null);

    // Calculate weighted anomaly drop rates whenever the slider changes
    useEffect(() => {
        const position = range[0];
        const nearWeight = 100 - position;
        const farWeight = position;

        const nearItems = [
            {
                key: 'asteroids',
                label: 'Asteroids',
                icon: <Asteroids className="h-5 w-5 text-destructive" />,
                colorClass: 'bg-destructive',
            },
            {
                key: 'sunspots',
                label: 'Sunspots',
                icon: <Sun className="h-5 w-5 text-secondary" />,
                colorClass: 'bg-secondary',
            },
        ];

        const farItems = [
            {
                key: 'exoplanets',
                label: 'Exoplanet Candidates',
                icon: <Planet className="h-5 w-5 text-primary" />,
                colorClass: 'bg-primary',
            },
            // Uncomment if enabled
            // {
            //     key: 'newStars',
            //     label: 'New Stars',
            //     icon: <Star className="h-5 w-5 text-accent" />,
            //     colorClass: 'bg-accent',
            // },
        ];

        const newDropRates: Record<string, number> = {};

        const nearSplit = nearWeight / nearItems.length;
        nearItems.forEach((item) => {
            newDropRates[item.key] = Math.round(nearSplit);
        });

        const farSplit = farWeight / farItems.length;
        farItems.forEach((item) => {
            newDropRates[item.key] = Math.round(farSplit);
        });

        setDropRates(newDropRates);
    }, [range]);

    // Check on mount if telescope was already deployed this week
    useEffect(() => {
        const checkDeployment = async () => {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const { data: recentDeployments, error } = await supabase
                .from("linked_anomalies")
                .select("*")
                .eq("automaton", "Telescope")
                .eq("author", session?.user.id)
                .gte("date", oneWeekAgo.toISOString());

            if (error) {
                console.error("Error checking telescope deployment:", error);
                return;
            }

            if (recentDeployments && recentDeployments.length > 0) {
                setAlreadyDeployed(true);
            }
        };

        checkDeployment();
    }, [supabase, session?.user?.id]);

    const activeDropTypes = [
        {
            key: 'asteroids',
            label: 'Asteroids',
            icon: <Asteroids className="h-5 w-5 text-destructive" />,
            colorClass: 'bg-destructive',
        },
        {
            key: 'sunspots',
            label: 'Sunspots',
            icon: <Sun className="h-5 w-5 text-secondary" />,
            colorClass: 'bg-secondary',
        },
        // {
        //     key: 'newStars',
        //     label: 'New Stars',
        //     icon: <Star className="h-5 w-5 text-accent" />,
        //     colorClass: 'bg-accent',
        // },
        {
            key: 'exoplanets',
            label: 'Exoplanet Candidates',
            icon: <Planet className="h-5 w-5 text-primary" />,
            colorClass: 'bg-primary',
        },
    ];

    const anomalyTypeMap: Record<string, string> = {
        asteroids: "telescope-minorPlanet",
        sunspots: "sunspot",
        exoplanets: "telescope-tess",
    };

    const handleDeploy = async () => {
        // Check if user has fast deploy enabled (no classifications made)
        const { count: userClassificationCount } = await supabase
            .from('classifications')
            .select('id', { count: 'exact', head: true })
            .eq('author', session?.user?.id);

        const isFastDeployEnabled = (userClassificationCount || 0) === 0;
        console.log("Fast deploy enabled:", isFastDeployEnabled);
        
        // Set deployment date - one day prior for fast deploy, current time otherwise
        const now = new Date();
        const deploymentDate = isFastDeployEnabled 
            ? new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
            : now;
        const deploymentDateISO = deploymentDate.toISOString();
        
        console.log("Deployment date:", deploymentDateISO, isFastDeployEnabled ? "(fast deploy)" : "(normal)");
        
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data: userDeployments, error: userFetchError } = await supabase
            .from("linked_anomalies")
            .select("*")
            .eq("author", session?.user?.id)
            .eq("automaton", "Telescope")
            .gte("date", oneWeekAgo.toISOString());

        if (userFetchError) {
            console.error("Error fetching linked anomalies:", userFetchError);
            return;
        }

        if (userDeployments && userDeployments.length >= 4) {
            return;
        }

        const totalAnomalies = 4;
        const weightedAnomalies: string[] = [];

        for (const [key, rate] of Object.entries(dropRates)) {
            const count = Math.round((rate / 100) * totalAnomalies);
            for (let i = 0; i < count; i++) {
                weightedAnomalies.push(key);
            }
        }

        while (weightedAnomalies.length < totalAnomalies) {
            const sorted = Object.entries(dropRates).sort((a, b) => b[1] - a[1]);
            for (const [key] of sorted) {
                if (weightedAnomalies.length < totalAnomalies) {
                    weightedAnomalies.push(key);
                }
            }
        }

        const selectedAnomalies = weightedAnomalies.slice(0, totalAnomalies);
        console.log("Deployed anomalies:", selectedAnomalies);

        const anomalies: any[] = [];

        for (const anomalyKey of selectedAnomalies) {
            const anomalySet = anomalyTypeMap[anomalyKey];
            const { data, error } = await supabase
                .from("anomalies")
                .select("*")
                .eq("anomalySet", anomalySet);

            if (error) {
                console.error(`Error fetching anomaly of type ${anomalyKey}:`, error);
                continue;
            }

            if (data && data.length > 0) {
                // 🔧 FIX: Pick a random anomaly from the list instead of always using data[0]
                const randomIndex = Math.floor(Math.random() * data.length);
                const anomaly = data[randomIndex];

                anomalies.push(anomaly);

                const { error: insertError } = await supabase
                    .from("linked_anomalies")
                    .insert([
                        {
                            author: session?.user?.id,
                            anomaly_id: anomaly.id,
                            classification_id: null,
                            automaton: "Telescope",
                            date: deploymentDateISO,
                        },
                    ]);

                if (insertError) {
                    console.error("Error inserting into linked_anomalies:", insertError);
                } else {
                    console.log("Inserted linked anomaly:", anomaly.id);
                }
            }
        }

        console.log("Fetched anomalies:", anomalies);
        setFetchedAnomalies(anomalies);
        if (anomalies.length > 0) {
            const anomalyNames = anomalies.map((a) => a.anomalySet).join(", ");
            setDeploymentMessage(`Telescope successfully deployed. New anomalies detected: ${anomalyNames}. Open the telescope interface to begin your observations.`);
        };
    };

    if (alreadyDeployed) {
        return (
            <div className="container mx-auto py-8 px-4 max-w-2xl text-center text-sm text-muted-foreground">
                {deploymentMessage && (
                    <div className="bg-green-100 text-green-800 border border-green-300 p-4 rounded-md mb-4 text-sm">
                        {deploymentMessage}
                    </div>
                )}
                <p className="bg-muted border border-border p-6 rounded-lg shadow-sm">
                    The Telescope has already been deployed this week. You’ll be able to recalibrate and search again next week.
                </p>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-2 pb-8 px-4 max-w-2xl">
            {deploymentMessage && (
                <div className="bg-green-100 text-green-800 border border-green-300 p-4 rounded-md mb-4 text-sm">
                    {deploymentMessage}
                </div>
            )}
            <Card className="text-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Telescope className="h-5 w-5 text-primary" />
                        Telescope Range Calibration
                    </CardTitle>
                    <CardDescription>
                        Adjust the slider to determine how far your telescope will look into space (for this week). This will determine the anomalies that are visible to your structures
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <div className="flex justify-between text-sm text-muted-foreground mb-2">
                                <span className="flex items-center gap-1">
                                    <Asteroids className="h-4 w-4 text-destructive" />
                                    Solar System
                                </span>
                                <span className="flex items-center gap-1">
                                    Deep Space
                                    <Planet className="h-4 w-4 text-primary" />
                                </span>
                            </div>

                            <Slider
                                defaultValue={[50]}
                                max={100}
                                step={1}
                                value={range}
                                onValueChange={setRange}
                                className="py-2"
                            />

                            <div className="bg-muted p-2 rounded-md">
                                <div className="text-center mb-4">
                                    <span className="text-foreground font-medium text-sm">
                                        Current Focus: {range[0] < 33
                                            ? "Near Space"
                                            : range[0] < 66
                                                ? "Mid-Range Objects"
                                                : "Deep Space"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button className="w-full" onClick={handleDeploy}>
                                Deploy Telescope
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

interface DropRateItemProps {
    icon: React.ReactNode;
    label: string;
    rate: number;
    colorClass: string;
};

function DropRateItem({
    icon,
    label,
    rate,
    colorClass,
}: DropRateItemProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div>{icon}</div>
                    <span className="font-medium text-foreground">
                        {label}
                    </span>
                </div>
                <span className="text-muted-foreground font-medium">
                    {rate}%
                </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                    className={`h-full transition-all ${colorClass}`}
                    style={{ width: `${rate}%` }}
                />
            </div>
        </div>
    );
};