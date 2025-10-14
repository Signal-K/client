"use client"

import Section from "@/src/components/sections/Section";
import { Anomaly } from "@/types/Structures/telescope";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/src/components/ui/button";
import { SciFiAnomalyComponent } from "@/src/components/classification/viewport/sci-fi-anomaly-component";

export default function RoverViewportSection() {
    const router = useRouter();
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
    const [classifications, setClassifications] = useState<any[]>([]);
    const [classificationProgress, setClassificationProgress] = useState<string>('');
    const [roverStatus, setRoverStatus] = useState<string>('');
    const [roverPos, setRoverPos] = useState({x: 0, y: 0, angle: 0});
        const [activeWaypointIndex, setActiveWaypointIndex] = useState<number>(-1);
    const [roverAtWaypointIndex, setRoverAtWaypointIndex] = useState<number | null>(null);
    const [nextWaypointArrivalMs, setNextWaypointArrivalMs] = useState<number | null>(null);
    const [nextWaypointRemainingMs, setNextWaypointRemainingMs] = useState<number | null>(null);
    const [missionCompleteTime, setMissionCompleteTime] = useState<number | null>(null);
    const [isReturningHome, setIsReturningHome] = useState<boolean>(false);
    const [userClassificationCount, setUserClassificationCount] = useState<number>(0);
    const [isFastDeployEnabled, setIsFastDeployEnabled] = useState<boolean>(false);
    const [hasRoverUpgrade, setHasRoverUpgrade] = useState<boolean>(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    // Fetch user classification count for fast deploy
    useEffect(() => {
        async function fetchClassificationCount() {
            if (!session) return;
            const { count, error } = await supabase
                .from("classifications")
                .select("id", { count: "exact" })
                .eq("author", session.user.id);
            
            const classificationCount = count || 0;
            setUserClassificationCount(classificationCount);
            setIsFastDeployEnabled(classificationCount < 4);
        }
        
        async function checkRoverUpgrade() {
            if (!session) return;
            const { data: upgrade, error } = await supabase
                .from("researched")
                .select("*")
                .eq("user_id", session.user.id)
                .eq("tech_type", "roverwaypoints")
                .maybeSingle();
            
            setHasRoverUpgrade(!!upgrade);
        }
        
        fetchClassificationCount();
        checkRoverUpgrade();
    }, [session, supabase]);
    
    // Check for linked_anomalies of relevant type
    useEffect(() => {
        async function fetchLinkedAnomaliesAndWaypoints() {
            const now = new Date();
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
                ...row.anomaly,
                id: `db-${row.anomaly_id}`,
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

                if (routes && routes.length > 0) {
                    const latestRoute = routes[routes.length - 1];
                    const config = latestRoute.routeConfiguration;

                    if (!config || !config.anomalies || !config.waypoints) {
                        setWaypoints([]);
                        return;
                    }
                    setWaypoints(routes);

                    // Determine which anomalies from the route have been classified.
                    // Note: classification rows live in a separate table and linked_anomalies may not be cleared on classification,
                    // so fetch classifications for the route anomalies directly.
                    const routeAnomalies = new Set(config.anomalies);
                    const linkedAnomalyIds = new Set(linked.map((l: any) => l.anomaly_id));

                    let classData: any[] = [];
                    if (routeAnomalies.size > 0) {
                        const anomalyIdsToFetch = [...routeAnomalies];
                        console.log("Querying classifications for author:", session.user.id, "and anomaly IDs:", anomalyIdsToFetch);
                        const { data, error } = await supabase
                            .from("classifications")
                            .select("*")
                            .eq("author", session.user.id)
                            .in("anomaly", anomalyIdsToFetch);

                        if (error) {
                            console.error("Error fetching classifications:", error);
                        }
                        if (data) {
                            classData = data;
                        }
                    }

                    const classifications = classData;
                    setClassifications(classifications);

                    const classifiedAnomalyIds = new Set(classifications.map((c: any) => c.anomaly));

                    console.log("Route Anomalies:", [...routeAnomalies]);
                    console.log("Linked (unclassified) Anomaly IDs:", [...linkedAnomalyIds]);
                    console.log("Classified Anomaly IDs:", [...classifiedAnomalyIds]);
                    console.log("Fetched Classifications:", classifications);

                    // Compute classification progress
                    if (config && config.anomalies) {
                        const total = config.anomalies.length;
                        setClassificationProgress(`Anomalies classified: ${classifiedAnomalyIds.size}/${total}`);
                    } else {
                        setClassificationProgress('');
                    }

                    // Compute rover position and status
                    const routeTime = new Date(latestRoute.timestamp);
                    const base = { x: 1, y: 95 };
                    const refuel = { x: 99, y: 95 };
                    
                    // Calculate timing intervals based on fast deploy status
                    const travelTimeMs = isFastDeployEnabled ? 60 * 1000 : 60 * 60 * 1000; // 60 seconds vs 1 hour
                    
                    let roverX = base.x;
                    let roverY = base.y;
                    let angle = 0;
                    let status = '';
                    let activeIndexVar: number = -1;
                    // Local vars to compute whether the rover is exactly at a waypoint and the next arrival timestamp
                    let roverAtIndexLocal: number | null = null;
                    let nextArrivalMsLocal: number | null = null;

                    for (let i = 0; i <= config.anomalies.length; i++) {
                        if (i === 0) {
                            // from base to wp0
                            const arrival = new Date(routeTime.getTime() + travelTimeMs);
                            if (now < arrival) {
                                const progress = (now.getTime() - routeTime.getTime()) / travelTimeMs;
                                roverX = base.x + progress * (config.waypoints[0].x - base.x);
                                roverY = base.y + progress * (config.waypoints[0].y - base.y);
                                angle = Math.atan2(config.waypoints[0].y - base.y, config.waypoints[0].x - base.x) * 180 / Math.PI;
                                const timeUnit = isFastDeployEnabled ? 'sec' : 'min';
                                const timeLeft = isFastDeployEnabled 
                                    ? Math.ceil((arrival.getTime() - now.getTime()) / 1000)
                                    : Math.ceil((arrival.getTime() - now.getTime()) / 60000);
                                status = `${timeLeft} ${timeUnit} until Waypoint 1`;
                                activeIndexVar = 0;
                                // We are currently en-route to waypoint 0
                                roverAtIndexLocal = null;
                                nextArrivalMsLocal = arrival.getTime();
                                break;
                            } else {
                                // at wp0
                                roverX = config.waypoints[0].x;
                                roverY = config.waypoints[0].y;
                                const isWp0AnomalyClassified = classifiedAnomalyIds.has(config.anomalies[0]);
                                // We are exactly at waypoint 0
                                roverAtIndexLocal = 0;
                                if (!isWp0AnomalyClassified) {
                                    status = 'Waiting for classification of Waypoint 1';
                                    angle = Math.atan2(config.waypoints[0].y - base.y, config.waypoints[0].x - base.x) * 180 / Math.PI;
                                    activeIndexVar = 0;
                                    break;
                                }
                            }
                        } else {
                            // from wp i-1 to wp i or refuel
                            const prevWp = config.waypoints[i-1];
                            const nextWp = i < config.waypoints.length ? config.waypoints[i] : refuel;
                            
                            // Find the classification for the previous waypoint's anomaly
                            const prevAnomalyId = config.anomalies[i-1];
                            const classif = classifications.find(c => c.anomaly === prevAnomalyId);
                            
                            if (!classif) { // This means the anomaly is classified (not in linked_anomalies) but we don't have its classification data yet.
                                // This can happen if the classification fetch hasn't completed or returned the data yet.
                                // We should wait at the previous waypoint.
                                roverX = prevWp.x;
                                roverY = prevWp.y;
                                status = `Waiting for classification of Waypoint ${i}`;
                                angle = Math.atan2(prevWp.y - (i > 1 ? config.waypoints[i-2].y : base.y), prevWp.x - (i > 1 ? config.waypoints[i-2].x : base.x)) * 180 / Math.PI;
                                activeIndexVar = i - 1;
                                break;
                            }

                            const arrival = new Date(new Date(classif.created_at).getTime() + travelTimeMs);
                            if (now < arrival) {
                                const progress = (now.getTime() - new Date(classif.created_at).getTime()) / travelTimeMs;
                                roverX = prevWp.x + progress * (nextWp.x - prevWp.x);
                                roverY = prevWp.y + progress * (nextWp.y - prevWp.y);
                                angle = Math.atan2(nextWp.y - prevWp.y, nextWp.x - prevWp.x) * 180 / Math.PI;
                                const wpLabel = i < config.waypoints.length ? `Waypoint ${i+1}` : 'Refueling Station';
                                const timeUnit = isFastDeployEnabled ? 'sec' : 'min';
                                const timeLeft = isFastDeployEnabled 
                                    ? Math.ceil((arrival.getTime() - now.getTime()) / 1000)
                                    : Math.ceil((arrival.getTime() - now.getTime()) / 60000);
                                status = `${timeLeft} ${timeUnit} until ${wpLabel}`;
                                activeIndexVar = i;
                                // en-route from prevWp to nextWp
                                roverAtIndexLocal = null;
                                nextArrivalMsLocal = arrival.getTime();
                                break;
                            } else {
                                if (i < config.waypoints.length) {
                                    // at wp i
                                    roverX = config.waypoints[i].x;
                                    roverY = config.waypoints[i].y;
                                    const isNextAnomalyClassified = classifiedAnomalyIds.has(config.anomalies[i]);
                                    if (!isNextAnomalyClassified) {
                                        // We are at waypoint i
                                        roverAtIndexLocal = i;
                                        status = `Waiting for classification of Waypoint ${i+1}`;
                                        angle = Math.atan2(config.waypoints[i].y - config.waypoints[i-1].y, config.waypoints[i].x - config.waypoints[i-1].x) * 180 / Math.PI;
                                        activeIndexVar = i;
                                        break;
                                    }
                                } else {
                                        // at refuel
                                        roverX = refuel.x;
                                        roverY = refuel.y;
                                        // At refuel - consider rover at the final index
                                        roverAtIndexLocal = config.waypoints.length - 1;
                                        
                                        // Check if mission is complete (all anomalies classified)
                                        if (classifiedAnomalyIds.size === config.anomalies.length) {
                                            // Find the time of the last classification
                                            const lastClassificationTime = Math.max(
                                                ...classifications.map(c => new Date(c.created_at).getTime())
                                            );
                                            setMissionCompleteTime(lastClassificationTime);
                                            
                                            // Check if 1 hour has passed since mission completion
                                            const oneHourAfterCompletion = lastClassificationTime + (60 * 60 * 1000);
                                            if (now.getTime() >= oneHourAfterCompletion) {
                                                status = 'Mission complete - Ready to return home';
                                            } else {
                                                const remainingMinutes = Math.ceil((oneHourAfterCompletion - now.getTime()) / (60 * 1000));
                                                status = `At refueling station - Return home available in ${remainingMinutes} min`;
                                            }
                                        } else {
                                            status = 'At refueling station';
                                        }
                                        
                                        angle = Math.atan2(refuel.y - config.waypoints[i-1].y, refuel.x - config.waypoints[i-1].x) * 180 / Math.PI;
                                        activeIndexVar = config.waypoints.length - 1;
                                        break;
                                }
                            }
                        }
                    }
                    setRoverPos({x: roverX, y: roverY, angle});
                    setRoverStatus(status);
                    setActiveWaypointIndex(activeIndexVar);
                    // Update rover-at-waypoint and next arrival states
                    setRoverAtWaypointIndex(roverAtIndexLocal);
                    setNextWaypointArrivalMs(nextArrivalMsLocal);
                } else {
                    setWaypoints([]);
                }
            } else {
                setWaypoints([]);
            }
        }
        fetchLinkedAnomaliesAndWaypoints();
    }, [session, supabase, isFastDeployEnabled]);

    // Ticking effect to update remaining ms until next waypoint arrival
    useEffect(() => {
        if (!nextWaypointArrivalMs) {
            setNextWaypointRemainingMs(null);
            return;
        }

        const tick = () => {
            const now = Date.now();
            const remaining = nextWaypointArrivalMs - now;
            setNextWaypointRemainingMs(remaining > 0 ? remaining : 0);
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [nextWaypointArrivalMs]);

    // Deploy handler
    const handleDeployRover = async () => {
        window.location.href="/activity/deploy/roover/";
    };

    // Return home handler - removes routes and linked_anomalies for this user's rover
    const handleReturnHome = async () => {
        if (!session?.user?.id) return;
        
        setIsReturningHome(true);
        try {
            // Delete all linked_anomalies for this user's rover
            const { error: linkedError } = await supabase
                .from('linked_anomalies')
                .delete()
                .eq('author', session.user.id)
                .eq('automaton', 'Rover');

            if (linkedError) {
                console.error('Error deleting linked anomalies:', linkedError);
                alert('Failed to clear rover mission data. Please try again.');
                return;
            }

            // Delete all routes for this user for this week
            const now = new Date();
            const utcDay = now.getUTCDay(); // 0=Sun, 6=Sat
            const daysToLastSaturday = utcDay === 6 ? 0 : (utcDay + 1) % 7;
            const cutoff = new Date(now);
            cutoff.setUTCDate(now.getUTCDate() - daysToLastSaturday);
            cutoff.setUTCHours(14, 1, 0, 0);

            const { error: routeError } = await supabase
                .from('routes')
                .delete()
                .eq('author', session.user.id)
                .gte('timestamp', cutoff.toISOString());

            if (routeError) {
                console.error('Error deleting routes:', routeError);
                alert('Failed to clear route data. Please try again.');
                return;
            }

            // Redirect to home
            router.push('/');
        } catch (err) {
            console.error('Unexpected error returning home:', err);
            alert('An unexpected error occurred. Please try again.');
        } finally {
            setIsReturningHome(false);
        }
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
                        {/* Anomalies are rendered above their corresponding waypoint below */}
                        {/* Render tracks between waypoints */}
                        <svg
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            style={{ zIndex: 15 }}
                        >
                            {waypoints.map((route) => {
                                const config = route.routeConfiguration;
                                if (!config || !config.waypoints || config.waypoints.length < 2) return null;
                                const base = { x: 1, y: 95 };
                                const refuel = { x: 99, y: 95 };
                                const extendedWaypoints = [base, ...config.waypoints, refuel];
                                return extendedWaypoints.slice(1).map((wp: { x: number; y: number }, idx: number) => {
                                    const prev = extendedWaypoints[idx];
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
                        {/* Render rover just after base waypoint if available */}
                        {/* Render small rover on-path (restored original) */}
                        <div
                            className="absolute"
                            style={{
                                left: `${roverPos.x}%`,
                                top: `${roverPos.y}%`,
                                transform: `translate(-50%, -50%) rotate(${roverPos.angle}deg)`,
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
                        {/* Render waypoints if available */}
                        {waypoints.map((route) => {
                            const config = route.routeConfiguration;
                            if (!config || !config.waypoints) return null;
                            const base = { x: 1, y: 95, label: 'Base' };
                            const refuel = { x: 99, y: 95, label: 'Refueling Station' };
                            
                            const routeAnomalies = new Set(config.anomalies);
                            const linkedAnomalyIds = new Set(linkedAnomalies.map(l => parseInt(l.id.split('-')[1])));
                            const classifiedAnomalyIds = new Set(
                                [...routeAnomalies].filter(id => !linkedAnomalyIds.has(id as number))
                            );

                            const waypointsWithClassifications = config.waypoints.map((wp: { x: number; y: number }, idx: number) => {
                                const anomalyId = config.anomalies[idx];
                                if (classifiedAnomalyIds.has(anomalyId)) {
                                    const classification = classifications.find(c => c.anomaly === anomalyId);
                                    return { 
                                        ...wp, 
                                        label: `Waypoint ${idx + 1}`,
                                        classificationId: classification?.id,
                                        classificationTime: classification?.created_at
                                    };
                                }
                                return { ...wp, label: `Waypoint ${idx + 1}` };
                            });

                            const extendedWaypoints = [base, ...waypointsWithClassifications, refuel];
                            
                            return extendedWaypoints.map((wp: { x: number; y: number; label: string; classificationId?: number; classificationTime?: string }, idx: number) => {
                                const isSpecial = idx === 0 || idx === extendedWaypoints.length - 1;
                                return (
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
                                                className={`${isSpecial ? 'w-5 h-5 bg-blue-400' : 'w-3 h-3 bg-yellow-400'} rounded-full border-2 border-white shadow`}
                                                style={{
                                                    zIndex: 20,
                                                }}
                                                title={wp.label}
                                            />

                                            {/* If this waypoint has a linked anomaly, render the anomaly component just above it */}
                                                {(() => {
                                                    // For extendedWaypoints, anomaly index correlates to idx-1 (base at idx 0)
                                                    const anomalyIndex = (idx > 0 && idx < extendedWaypoints.length - 1) ? idx - 1 : null;
                                                    const anomalyId = anomalyIndex !== null ? config.anomalies[anomalyIndex] : null;
                                                    const linked = anomalyId !== null ? linkedAnomalies.find(l => l.id === `db-${anomalyId}`) : null;

                                                    // Determine whether this anomaly (linked or classified) should be visible.
                                                    const isClassified = anomalyId !== null && classifiedAnomalyIds.has(anomalyId as number);
                                                    // Only show anomalies up to the active waypoint + 1. activeWaypointIndex defaults to -1 (hide all until computed)
                                                    const shouldShow = anomalyIndex !== null && anomalyIndex <= (activeWaypointIndex + 1);

                                                    if (!anomalyIndex && anomalyIndex !== 0) return null;

                                                    const hasMineralDeposit = anomalyIndex !== null && config.waypoints[anomalyIndex]?.hasMineralDeposit === true;

                                                    if ((linked || isClassified) && shouldShow) {
                                                        // If we don't have a linked anomaly object (because it's classified), create a minimal placeholder
                                                        const anomalyObj = linked || {
                                                            id: `db-${anomalyId}`,
                                                            x: wp.x,
                                                            y: wp.y,
                                                            classified: true,
                                                        } as any;

                                                        // Decide visual status
                                                        let statusProp: 'classified' | 'active' | 'default' = 'default';
                                                        if (anomalyIndex !== null && anomalyIndex === activeWaypointIndex) statusProp = 'active';
                                                        else if (isClassified) statusProp = 'classified';

                                                        return (
                                                            // place anomaly below the waypoint (so it's visually under the marker)
                                                            <div style={{ position: 'absolute', top: '28px', left: '50%', transform: 'translateX(-50%)', zIndex: 21 }}>
                                                                <SciFiAnomalyComponent
                                                                        anomaly={anomalyObj}
                                                                        status={statusProp}
                                                                        inline={true}
                                                                        title={statusProp === 'active' ? 'Object of Interest' : undefined}
                                                                        onClick={(a) => { setSelectedAnomaly(a); setShowDetailDialog(true); }}
                                                                    />
                                                                {(hoveredAnomaly === anomalyObj.id || isMobile) && (
                                                                    <span className="absolute text-white text-xs bg-black/50 px-1 rounded" style={{ top: '48px', left: '50%', transform: 'translateX(-50%)' }}>
                                                                        {statusProp === 'active' ? 'Object of Interest' : 'Anomaly'}
                                                                    </span>
                                                                )}

                                                                {/* If rover is at this waypoint AND the anomaly is unclassified (linked), show Scan button */}
                                                                {anomalyIndex !== null && roverAtWaypointIndex === anomalyIndex && anomalyId !== null && linkedAnomalyIds.has(anomalyId as number) && (
                                                                    <a
                                                                        href={`/structures/seiscam/ai4mars/cl-${anomalyId}/one`}
                                                                        className="absolute left-1/2 transform -translate-x-1/2 mt-1 inline-block bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                                                                        style={{ top: '72px', zIndex: 22 }}
                                                                    >
                                                                        Scan Object of Interest
                                                                    </a>
                                                                )}
                                                            </div>
                                                        );
                                                    }
                                                    
                                                    // Mineral Deposit Icon and Label (render regardless of anomaly visibility)
                                                    if (hasMineralDeposit) {
                                                        return (
                                                            <div 
                                                                className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center"
                                                                style={{ top: '-30px', zIndex: 19 }}
                                                            >
                                                                {/* Mineral icon */}
                                                                <div 
                                                                    className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded border-2 border-amber-300 flex items-center justify-center shadow-lg"
                                                                    title="Mineral Deposit Location"
                                                                >
                                                                    <span className="text-white text-xs font-bold">🪨</span>
                                                                </div>
                                                                {/* Label */}
                                                                <span className="mt-1 text-xs text-amber-300 font-semibold bg-black/60 px-2 py-0.5 rounded whitespace-nowrap">
                                                                    Mineral Deposit
                                                                </span>
                                                            </div>
                                                        );
                                                    }
                                                    
                                                    return null;
                                                })()}

                                            {/* Always visible label for Base & Refueling (isSpecial). Larger text and wrapping. */}
                                            {(isSpecial || hoveredWaypoint === `${route.id}-${idx}` || isMobile) && (
                                                <span className="absolute text-white text-sm md:text-base bg-black/60 px-2 py-1 rounded max-w-[160px] text-center break-words" style={{ top: '-40px', left: '50%', transform: 'translateX(-50%)' }}>
                                                    {wp.label}
                                                    {wp.classificationId && (
                                                        <>
                                                            <br />
                                                            Classified: {new Date(wp.classificationTime!).toLocaleString()}
                                                            <br />
                                                            ID: {wp.classificationId}
                                                        </>
                                                    )}
                                                </span>
                                            )}

                                            {/* (removed per-waypoint rover; single global rover is rendered separately) */}
                                    </div>
                                );
                            });
                        })}
                        {roverStatus && (
                            <div className="fixed bottom-0 right-0 text-white text-xs bg-black/50 p-2 rounded m-2 z-50 max-w-xs">
                                {/* Rover Upgrade Notification */}
                                {hasRoverUpgrade && (
                                    <div className="mb-2 p-2 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded border border-blue-400/40">
                                        <div className="flex items-center gap-1 mb-1">
                                            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                                            <span className="text-blue-300 font-semibold text-xs">🛞 Navigation Upgrade Active!</span>
                                        </div>
                                        <div className="text-blue-200 text-xs">Rover supports up to 6 waypoints</div>
                                    </div>
                                )}
                                {/* Fast Deploy Welcome Message */}
                                {isFastDeployEnabled && (
                                    <div className="mb-2 p-2 bg-gradient-to-r from-green-500/30 to-blue-500/30 rounded border border-green-400/40">
                                        <div className="flex items-center gap-1 mb-1">
                                            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-green-300 font-semibold text-xs">🎁 Speed Boost Active!</span>
                                        </div>
                                        <div className="text-green-200 text-xs">Rover reaching waypoints in 60s instead of 1h</div>
                                    </div>
                                )}
                                <div>{roverStatus}</div>
                                {nextWaypointRemainingMs !== null && nextWaypointRemainingMs !== undefined && nextWaypointRemainingMs > 0 && (
                                    <div>Arriving in: {Math.ceil(nextWaypointRemainingMs / 1000)}s</div>
                                )}
                                {classificationProgress && <div>{classificationProgress}</div>}
                                
                                {/* Show return home button if mission is complete and 1 hour has passed */}
                                {missionCompleteTime && 
                                 waypoints.length > 0 && 
                                 waypoints[waypoints.length - 1].routeConfiguration?.anomalies && 
                                 classifications.length === waypoints[waypoints.length - 1].routeConfiguration.anomalies.length &&
                                 Date.now() >= (missionCompleteTime + (60 * 60 * 1000)) && (
                                    <div className="mt-2">
                                        <Button
                                            onClick={handleReturnHome}
                                            disabled={isReturningHome}
                                            variant="destructive"
                                            size="sm"
                                            className="w-full text-xs"
                                        >
                                            {isReturningHome ? 'Returning...' : 'Return home - rover has finished mission'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Section>
    );
};