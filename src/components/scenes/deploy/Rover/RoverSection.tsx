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
    const [waypoints, setWaypoints] = useState<any[]>([]);
    const [hoveredWaypoint, setHoveredWaypoint] = useState<string | null>(null);
    const [hoveredAnomaly, setHoveredAnomaly] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [routeProgress, setRouteProgress] = useState<string>('');

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Check for linked_anomalies of relevant type
    useEffect(() => {
        async function fetchLinkedAnomaliesAndWaypoints() {
            if (!session) {
                return;
            }

            // Fetch linked anomalies
            const { data: linked, error: linkedError } = await supabase
                .from("linked_anomalies")
                .select("*, anomaly:anomalies(*)")
                .eq("author", session.user.id)
                .in("automaton", ["Rover"]);

            setHasRoverDeployed((linked && linked.length > 0) || false);

            // Map user's linked_anomalies to their anomalies[id] counterpart
            const mapped = (linked || []).map((row: any) => ({
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

            // Get set of anomaly_ids still linked
            const linkedIds = new Set((linked || []).map(l => l.anomaly_id));

            // Fetch waypoints/routes if rover deployed
            if (linked && linked.length > 0) {
                // Calculate cutoff: last Sunday 00:01 AEST, which is last Saturday 14:01 UTC
                const now = new Date();
                const utcDay = now.getUTCDay(); // 0=Sun, 6=Sat
                const daysToLastSaturday = utcDay === 6 ? 0 : (utcDay + 1) % 7;
                const cutoff = new Date(now);
                cutoff.setUTCDate(now.getUTCDate() - daysToLastSaturday);
                cutoff.setUTCHours(14, 1, 0, 0);

                const { data: routes, error: routesError } = await supabase
                    .from("routes")
                    .select("*")
                    .eq("author", session.user.id)
                    .gte("timestamp", cutoff.toISOString())
                    .order("timestamp", { ascending: true });
                setWaypoints(routes || []);

                // Compute progress for latest route
                if (routes && routes.length > 0) {
                    const latestRoute = routes[routes.length - 1];
                    const config = latestRoute.routeConfiguration;
                    if (config && config.anomalies) {
                        const total = config.anomalies.length;
                        const classified = config.anomalies.filter((id: number) => !linkedIds.has(id)).length;
                        setRouteProgress(`Anomalies classified: ${classified}/${total}`);
                    } else {
                        setRouteProgress('');
                    }
                } else {
                    setRouteProgress('');
                }
            } else {
                setWaypoints([]);
            }
        }
        fetchLinkedAnomaliesAndWaypoints();
    }, [session, supabase]);

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
            expandLink={"/viewports/roover"}
        >
            <div className="relative w-full h-64 md:h-64 flex items-center justify-center py-8 md:py-12">
                {!hasRoverDeployed ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                        <div className="mb-4 w-full max-w-lg text-xs md:text-sm text-center text-white leading-relaxed px-4 py-3 rounded-lg bg-black/40 drop-shadow">
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
                        {/* Render anomalies */}
                        {linkedAnomalies.map((anomaly) => (
                            <div
                                key={anomaly.id}
                                className="absolute"
                                style={{ zIndex: 19 }}
                                onMouseEnter={() => setHoveredAnomaly(anomaly.id)}
                                onMouseLeave={() => setHoveredAnomaly(null)}
                            >
                                <SciFiAnomalyComponent
                                    anomaly={anomaly}
                                    onClick={(a) => {
                                        setSelectedAnomaly(a);
                                        setShowDetailDialog(true);
                                    }}
                                />
                                {(hoveredAnomaly === anomaly.id || isMobile) && (
                                    <span className="absolute text-white text-xs bg-black/50 px-1 rounded" style={{ top: '-20px', left: '50%', transform: 'translateX(-50%)' }}>
                                        Anomaly
                                    </span>
                                )}
                            </div>
                        ))}
                        {/* Render tracks between waypoints */}
                        <svg
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            style={{ zIndex: 15 }}
                        >
                            {waypoints.map((route) => {
                                const config = route.routeConfiguration;
                                if (!config || !config.waypoints || config.waypoints.length < 2) return null;
                                return config.waypoints.slice(1).map((wp: { x: number; y: number }, idx: number) => {
                                    const prev = config.waypoints[idx];
                                    return (
                                        <line
                                            key={`track-${route.id}-${idx}`}
                                            x1={`${prev.x}%`}
                                            y1={`${prev.y}%`}
                                            x2={`${wp.x}%`}
                                            y2={`${wp.y}%`}
                                            stroke="#18dda1"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            opacity={0.8}
                                        />
                                    );
                                });
                            })}
                        </svg>
                        {/* Render rover just after first waypoint if available */}
                        {waypoints.map((route) => {
                            const config = route.routeConfiguration;
                            if (!config || !config.waypoints || config.waypoints.length < 2) return null;
                            const wp0 = config.waypoints[0];
                            const wp1 = config.waypoints[1];
                            const angle = Math.atan2(wp1.y - wp0.y, wp1.x - wp0.x) * 180 / Math.PI;
                            // Position rover 10% along the line from wp0 to wp1
                            const roverX = wp0.x + 0.1 * (wp1.x - wp0.x);
                            const roverY = wp0.y + 0.1 * (wp1.y - wp0.y);
                            return (
                                <div
                                    key={`rover-${route.id}`}
                                    className="absolute"
                                    style={{
                                        left: `${roverX}%`,
                                        top: `${roverY}%`,
                                        transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                                        zIndex: 25,
                                    }}
                                >
                                    <svg width="50" height="25" viewBox="0 0 50 25">
                                        {/* Body */}
                                        <rect x="8" y="8" width="34" height="12" fill="#ff3c1a" rx="3" />
                                        {/* Solar panels */}
                                        <rect x="2" y="5" width="10" height="18" fill="#18dda1" rx="1" />
                                        <rect x="38" y="5" width="10" height="18" fill="#18dda1" rx="1" />
                                        {/* Wheels */}
                                        <circle cx="12" cy="22" r="4" fill="#333" stroke="#666" strokeWidth="1" />
                                        <circle cx="25" cy="22" r="4" fill="#333" stroke="#666" strokeWidth="1" />
                                        <circle cx="38" cy="22" r="4" fill="#333" stroke="#666" strokeWidth="1" />
                                        {/* Wheel details */}
                                        <circle cx="12" cy="22" r="1" fill="#666" />
                                        <circle cx="25" cy="22" r="1" fill="#666" />
                                        <circle cx="38" cy="22" r="1" fill="#666" />
                                        {/* Antenna */}
                                        <line x1="40" y1="8" x2="45" y2="3" stroke="#fff" strokeWidth="2" />
                                        <circle cx="45" cy="3" r="1" fill="#ff3c1a" />
                                        {/* Headlights */}
                                        <circle cx="8" cy="10" r="1.5" fill="#ffff00" />
                                        <circle cx="8" cy="15" r="1.5" fill="#ffff00" />
                                        {/* Details on body */}
                                        <rect x="10" y="10" width="6" height="2" fill="#fff" />
                                        <rect x="18" y="10" width="6" height="2" fill="#fff" />
                                        <rect x="26" y="10" width="6" height="2" fill="#fff" />
                                        {/* Simple animation: pulse */}
                                        <animateTransform
                                            attributeName="transform"
                                            type="scale"
                                            values="1;1.05;1"
                                            dur="2s"
                                            repeatCount="indefinite"
                                        />
                                    </svg>
                                </div>
                            );
                        })}
                        {/* Render waypoints if available */}
                        {waypoints.map((route) => {
                            const config = route.routeConfiguration;
                            if (!config || !config.waypoints) return null;
                            return config.waypoints.map((wp: { x: number; y: number }, idx: number) => (
                                <div
                                    key={`${route.id}-${idx}`}
                                    className="absolute"
                                    style={{
                                        left: `${wp.x}%`,
                                        top: `${wp.y}%`,
                                    }}
                                    onMouseEnter={() => setHoveredWaypoint(`${route.id}-${idx}`)}
                                    onMouseLeave={() => setHoveredWaypoint(null)}
                                >
                                    <div
                                        className="w-3 h-3 bg-yellow-400 rounded-full border-2 border-white shadow"
                                        style={{
                                            zIndex: 20,
                                        }}
                                        title={`Waypoint ${idx + 1}`}
                                    />
                                    {(hoveredWaypoint === `${route.id}-${idx}` || isMobile) && (
                                        <span className="absolute text-white text-xs bg-black/50 px-1 rounded" style={{ top: '-20px', left: '50%', transform: 'translateX(-50%)' }}>
                                            Waypoint {idx + 1}
                                        </span>
                                    )}
                                </div>
                            ));
                        })}
                        {routeProgress && (
                            <div className="absolute bottom-0 right-0 text-white text-xs bg-black/50 p-2 rounded m-2">
                                {routeProgress}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Section>
    );
};