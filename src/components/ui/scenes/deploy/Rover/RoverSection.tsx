"use client"

import Section from "@/src/components/sections/Section";
import { Anomaly } from "@/types/Structures/telescope";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router"
import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { SciFiAnomalyComponent } from "@/src/components/classification/viewport/sci-fi-anomaly-component";

export default function RoverViewportSection() {
    // const router = useRouter();

    const supabase = useSupabaseClient();
    const session = useSession();

    const [hasRoverDeployed, setHasRoverDeployed] = useState<Boolean>(false);
    const [linkedAnomalies, setLinkedAnomalies] = useState<Anomaly[]>([]);

    const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    
    // Check for linked_anomalies of relevant type
    useEffect(() => {
        async function fetchLinkedAnomalies() {
            if (!session) {
                return;
            };

            const { data: linked, error: linkedError } = await supabase
                .from("linked_anomalies")
                .select("*, anomaly:anomalies(*)")
                .eq("author", session.user.id)
                .in("automaton", ["Rover"]);

            setHasRoverDeployed(( linked && linked.length > 0 ) || false);

            // Map user's linked_anomalies to their anomalies[id] counterpart
            const mapped = ( linked || [] ).map(( row: any ) => ({
                id: `db-${row.anomaly_id}`,
                ...row.anomaly,
                x: Math.random() * 80 + 10,
                y: Math.random() * 80 + 10,
                size: 1,
                brightness: 1,
                color: "#18dda1",
                shape: "circle",
                classified: !!row.classification_id,
                glowIntensity: 0.1,
                pulseSpeed: 1.2,
            }));

            setLinkedAnomalies(mapped);
        };

        fetchLinkedAnomalies();
    }, [session, supabase])

    // Deploy handler
    const handleDeployRover = async () => {
        window.location.href="/activity/deploy/roover/";
    };

    return (
        <Section
            sectionId="rover-viewport"
            variant="viewport"
            backgroundType="rover"
            infoText={
                "View and control your surface rovers to find and discover surface anomalies"
            }
        >
            <div className="relative w-full h-64 md:h-64 flex items-center justify-center py-8 md:py-12">
                {!hasRoverDeployed ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                        <div className="mb-4 w-full max-w-lg text-xs md:text-sm text-center text-zinc-300 leading-relaxed px-2">
                            Mars is one of the closest planets to us, and certainly one of the most interesting. You've been given a rover and have been asked to help 'train' it to avoid obstacles. Each week, you give it a series of commands and routes; and it will explore Mars, finding objects of interest and eventually getting stuck. It's your job to help the rover identify what it has found and why it got stuck. With enough training, you'll be able to explore the surface of the planets you and other scientists discover.
                        </div>
                        <Button
                            onClick={handleDeployRover}
                            variant='default'
                        >
                            Deploy your rover
                        </Button>
                    </div>
                ) : (
                    <div className="h-full w-full relative">
                        {linkedAnomalies.map(( anomaly ) => (
                            <SciFiAnomalyComponent
                                key={anomaly.id}
                                anomaly={anomaly}
                                onClick={(a) => {
                                    setSelectedAnomaly(a);
                                    setShowDetailDialog(true);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Section>
    );
};