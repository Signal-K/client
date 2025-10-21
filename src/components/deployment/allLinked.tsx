"use client"

import React, { useEffect, useState } from "react"
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"
import { Zap, Telescope, Satellite, Compass } from "lucide-react"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card"
import { Classification, LinkedAnomaly, usePageData } from "@/hooks/usePageData"
import { ClassificationIcon, getAnomalyColor } from "@/src/components/ui/helpers/classification-icons"

export default function AwaitingObjects() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [linkedAnomalies, setLinkedAnomalies] = useState<LinkedAnomaly[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session?.user?.id) return;
        
        const fetchLinkedAnomalies = async () => {
            try {
                const { data, error } = await supabase
                    .from("linked_anomalies")
                    .select(`
                        id,
                        anomaly_id,
                        date,
                        automaton,
                        unlocked,
                        anomaly:anomaly_id(
                            id,
                            content,
                            anomalytype,
                            anomalySet
                        )
                    `)
                    .eq("author", session.user.id)
                    .eq("unlocked", false)
                    .order("date", { ascending: false });

                if (error) {
                    console.error("Error fetching linked anomalies:", error);
                } else {
                    const transformedData = (data ?? []).map(item => ({
                        ...item,
                        anomaly: Array.isArray(item.anomaly) ? item.anomaly[0] : item.anomaly,
                    })) as unknown as LinkedAnomaly[];
                    setLinkedAnomalies(transformedData);
                }
            } catch (err) {
                console.error("Error in fetchLinkedAnomalies:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLinkedAnomalies();
    }, [session, supabase]);

    // Separate anomalies by automaton type
    const satelliteAnomalies = linkedAnomalies.filter(
        (a) => a.automaton === "WeatherSatellite"
    );
    const telescopeAnomalies = linkedAnomalies.filter(
        (a) => a.automaton === "Telescope"
    );
    const roverAnomalies = linkedAnomalies.filter(
        (a) => a.automaton === "Rover"
    );

    const renderAnomalySection = (
        title: string,
        icon: React.ReactNode,
        anomalies: LinkedAnomaly[],
        emptyMessage: string
    ) => {
        if (anomalies.length === 0) {
            return (
                <div className="bg-card/30 border border-dashed border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        {icon}
                        <h4 className="text-sm font-semibold text-primary">{title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">{emptyMessage}</p>
                </div>
            );
        }

        return (
            <div className="bg-card/30 border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                    {icon}
                    <h4 className="text-sm font-semibold text-primary">{title}</h4>
                    <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {anomalies.length}
                    </span>
                </div>
                <div className="space-y-2">
                    {anomalies.map((a) => {
                        const anomaly = a.anomaly;
                        let type = anomaly?.anomalytype?.toLowerCase() || null;
                        if (type?.includes("minorplanet") || type?.includes("asteroid")) {
                            type = "telescope-minorplanet";
                        }
                        const color = getAnomalyColor(type || "");

                        let link = "#";
                        if (type === "planet") {
                            link = `/structures/telescope/planet-hunters/db-${a.anomaly_id}/classify`;
                        } else if (type === "cloud") {
                            link = `/structures/balloon/cloudspotting/db-${a.anomaly_id}/classify`;
                        } else if (anomaly?.anomalytype === 'telescopeMinor') {
                            if (anomaly?.anomalySet === 'active-asteroids') {
                                link = `/structures/telescope/active-asteroids/db-${a.anomaly_id}/classify`;
                            } else {
                                link = `/structures/telescope/daily-minor-planet/db-${a.anomaly_id}/classify`;
                            }
                        }

                        return (
                            <div
                                key={a.id}
                                className="flex items-center gap-3 p-2 rounded-md border border-border/50 bg-background/50 shadow-sm transition hover:bg-muted/20"
                            >
                                <div className="flex-shrink-0">
                                    <ClassificationIcon type={type || null} />
                                </div>
                                <div className="flex flex-col flex-grow min-w-0">
                                    <span
                                        className="inline-block px-2 py-0.5 mb-1 text-[10px] font-semibold rounded-full w-fit"
                                        style={{ backgroundColor: color, color: "white" }}
                                    >
                                        {anomaly?.anomalytype === 'telescopeMinor' 
                                            ? 'Asteroid Candidate' 
                                            : (anomaly?.anomalytype || "Unknown Type")}
                                    </span>
                                    <p className="text-xs text-foreground truncate" title={anomaly?.content || ""}>
                                        {anomaly?.content || "No content"}
                                    </p>
                                    <Link
                                        href={link}
                                        className="mt-1 text-[10px] text-primary hover:underline font-medium"
                                    >
                                        Unlock & Classify →
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <Card className="bg-background/20 backdrop-blur-sm border border-[#78cce2]/30">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-semibold flex items-center gap-2 text-primary">
                            <Zap className="w-5 h-5" />
                            Objects awaiting discovery
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </CardContent>
            </Card>
        );
    }

    const totalAnomalies = linkedAnomalies.length;

    return (
        <Card className="bg-background/20 backdrop-blur-sm border border-[#78cce2]/30">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2 text-primary">
                        <Zap className="w-5 h-5" />
                        Objects awaiting discovery
                    </CardTitle>
                    {totalAnomalies > 0 && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full font-semibold">
                            {totalAnomalies} total
                        </span>
                    )}
                </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
                {totalAnomalies === 0 ? (
                    <div className="flex flex-col items-center bg-card/50 border border-dashed border-border rounded-xl p-6 text-center space-y-3">
                        <Telescope className="h-6 w-6 text-primary" />
                        <h4 className="text-sm font-semibold text-primary">
                            No locked objects found
                        </h4>
                        <p className="text-xs text-muted-foreground max-w-md">
                            All your discovered objects have been unlocked and classified. Deploy your automatons to discover more!
                        </p>
                        <Link
                            href="/activity/deploy"
                            className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-3 py-1.5 rounded-md font-medium transition"
                        >
                            Deploy Automatons →
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                        {renderAnomalySection(
                            "Satellite Discoveries",
                            <Satellite className="w-4 h-4 text-primary" />,
                            satelliteAnomalies,
                            "No satellite discoveries pending unlock"
                        )}
                        {renderAnomalySection(
                            "Telescope Observations",
                            <Telescope className="w-4 h-4 text-primary" />,
                            telescopeAnomalies,
                            "No telescope observations pending unlock"
                        )}
                        {renderAnomalySection(
                            "Rover Findings",
                            <Compass className="w-4 h-4 text-primary" />,
                            roverAnomalies,
                            "No rover findings pending unlock"
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};