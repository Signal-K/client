'use client';

import type React from "react";
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Telescope, AsteriskIcon as Asteroids, Sun, Star, SpaceIcon as Planet } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";


export default function TelescopeRangeSlider() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [range, setRange] = useState([50]);
    const [dropRates, setDropRates] = useState({
        asteroids: 0,
        sunspots: 0,
        newStars: 0,
        exoplanets: 0
    });

    useEffect(() => {
        const position = range[0];
        setDropRates({
            asteroids: Math.round(100 - position * 0.9),
            sunspots: Math.round(90 - position * 0.8),
            newStars: Math.round(100 - position * 0.8),
            exoplanets: Math.round(100 - position * 0.9),
        });
    }, [range]);

    return (
        <div className="container mx-auto py-2 pb-8 px-4 max-w-2xl">
            <Card className="text-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Telescope className="h-5 w-5 text-primary" />
                        Telescope Range Calibration
                    </CardTitle>
                    <CardDescription>
                        Adjust the slider to determine how far your telescope will look into space (for this week)
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

                            <Slider defaultValue={[50]} max={100} step={1} value={range} onValueChange={setRange} className="py-2" />

                            <div className="bg-muted p-2 rounded-md">
                                <div className="text-center mb-4">
                                    <span className="text-foreground font-medium text-sm">
                                        Current Focus: {range[0] < 33 ? "Near Space" : range[0] < 66 ? "Mid-Range Objects" : "Deep Space"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* <h3 className="text-md font-medium">
                                Projected Discovery Rates
                            </h3> */}

                            <div className="space-y-2 grid grid-cols-1">
                                <DropRateItem
                                    icon={<Asteroids className="h-5 w-5 text-destructive" />}
                                    label="Asteroids"
                                    rate={dropRates.asteroids}
                                    colorClass="bg-destructive"
                                />
                                <DropRateItem
                                    icon={<Sun className="h-5 w-5 text-secondary" />}
                                    label="Sunspots"
                                    rate={dropRates.sunspots}
                                    colorClass="bg-secondary"
                                />
                                {/* <DropRateItem
                                    icon={<Star className="h-5 w-5 text-accent" />}
                                    label="New Stars"
                                    rate={dropRates.newStars}
                                    colorClass="bg-accent"
                                /> */}
                                <DropRateItem
                                    icon={<Planet className="h-5 w-5 text-primary" />}
                                    label="Exoplanet Candidates"
                                    rate={dropRates.exoplanets}
                                    colorClass="bg-primary"
                                />
                            </div>
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
    colorClass
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
                <span className="text-muted-foreground font-medium">{rate}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className={`h-full transition-all ${colorClass}`} style={{ width: `${rate}%` }} />
            </div>
        </div>
    );
};