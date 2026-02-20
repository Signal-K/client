'use client';

import React, { useEffect, useState } from "react";
import { useSession } from "@/src/lib/auth/session-context";
import ClassificationForm from "../(classifications)/PostForm";
import { Button } from "@/src/components/ui/button";
import ImageAnnotator from "../(classifications)/Annotating/AnnotatorView";
import TutorialContentBlock, { createTutorialSlides } from "../TutorialContentBlock";

interface Props {
    anomalyid: number | bigint;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// StarterActiveAsteroids component removed (deleted per cleanup request)

type Anomaly = {
    id: string;
    name?: string;
    content?: string;
    details?: string;
    anomalySet?: string;
    anomalytype?: string;
};

export function ActiveAsteroidWithId() {
    const session = useSession();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    
    const [loading, setLoading] = useState<boolean | null>(true);
    const [showTutorial, setShowTutorial] = useState<boolean>(false);

    useEffect(() => {
        async function fetchAnomaly() {
            if (!session) {
                setLoading(false);
                return;
            };

            try {
                const res = await fetch(
                  `/api/gameplay/anomalies?author=${encodeURIComponent(session.user.id)}&anomalySet=telescope-active-asteroids&limit=1`
                );
                const payload = await res.json();
                if (!res.ok) throw new Error(payload?.error || "Failed to load anomaly");
                const anomalyData = payload?.anomalies?.[0];

                if (anomalyData) {
                    setAnomaly(anomalyData);
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                    setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/telescope-active-asteroids/${anomalyData.id}.png`);
                } else {
                    setAnomaly(null);
                    setImageUrl(null);
                }
            } catch (error: any) {
                console.error("Error fetching anomaly:", error.message);
                setAnomaly(null);
            } finally {
                setLoading(false);
            }
        }

        fetchAnomaly();
    }, [session]);

    if (loading) {
        return <div>Loading...</div>;
    };

    if (!anomaly) {
        return <div>No anomaly found. Please try again later or contact support if this issue persists.</div>
    };

    const startTutorial = () => setShowTutorial(true);

    return (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full overflow-y-auto max-h-[90vh] rounded-lg overflow-x-hidden">
            <Button onClick={startTutorial} variant="outline">
                Show Tutorial
            </Button>

            {showTutorial && (
                <div className="p-4 text-center text-sm text-gray-200">Tutorial is not available.</div>
            )}

            {imageUrl && (
                <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                    <div className="relative">
                        <div className='absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0'></div>
                        <div className="bg-white bg-opacity-90">
                            <img
                                src={imageUrl}
                                alt="Active asteroid candidate"
                                className="relative z-10 w-80 h-80 object-contain max-w-full max-h-full"
                            />
                        </div>
                    </div>
                    <ImageAnnotator
                        initialImageUrl={imageUrl}
                        anomalyId={anomaly.id}
                        anomalyType="active-asteroid"
                        assetMentioned={imageUrl}
                        structureItemId={3103}
                        annotationType="AA"
                    />
                </div>
            )}
        </div>
    );
};

// New component specifically for active asteroids with specific ID
export function ActiveAsteroidClassifyWithId({ anomalyId }: { anomalyId: string }) {
    const session = useSession();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showTutorial, setShowTutorial] = useState<boolean>(false);

    useEffect(() => {
        async function fetchAnomaly() {
            if (!session) {
                setError("Authentication required");
                setLoading(false);
                return;
            }

            try {
                console.log("Fetching active asteroid anomaly with ID:", anomalyId);
                
                const res = await fetch(
                  `/api/gameplay/anomalies?id=${encodeURIComponent(anomalyId)}&anomalySet=active-asteroids&limit=1`
                );
                const payload = await res.json();
                if (!res.ok) throw new Error(payload?.error || "Failed to load anomaly");
                const anomalyData = payload?.anomalies?.[0];

                console.log("Query returned:", anomalyData);

                if (anomalyData) {
                    setAnomaly(anomalyData);
                    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                    setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/telescope-active-asteroids/${anomalyData.id}.png`);
                } else {
                    setError("Active asteroid not found.");
                }
            } catch (error: any) {
                console.error("Error fetching anomaly:", error.message);
                setError("Unable to load active asteroid.");
            } finally {
                setLoading(false);
            }
        }

        fetchAnomaly();
    }, [anomalyId, session]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-white text-lg">Loading active asteroid...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-red-400 text-lg">{error}</div>
            </div>
        );
    }

    if (!anomaly || !imageUrl) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-white text-lg">No active asteroid data available.</div>
            </div>
        );
    }

    const startTutorial = () => setShowTutorial(true);

    return (
        <div className="w-full h-full flex flex-col pt-4">
            {/* Header with Tutorial Button - responsive sizing */}
            <div className="flex-shrink-0 bg-[#1a1a1a]/95 border-b border-gray-600 p-2 md:p-4 mt-2">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4">
                        <Button 
                            onClick={startTutorial} 
                            variant="outline" 
                            className="text-xs sm:text-sm px-4 py-2 md:px-6 md:py-3 bg-blue-600 hover:bg-blue-700 text-white border-blue-500 font-semibold"
                        >
                            📚 Tutorial
                        </Button>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                            <span className="text-white font-semibold">🎯 Task:</span>
                            <span>Find activity (tails/comas/dust clouds)</span>
                        </div>
                    </div>
                    <div className="flex gap-2 md:gap-4 text-xs sm:text-sm flex-wrap">
                        <div className="flex items-center gap-1">
                            <span className="text-green-400">✓</span>
                            <span className="text-white"><strong>Active</strong></span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-red-400">✗</span>
                            <span className="text-white"><strong>Not Active</strong></span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-yellow-400">⚠</span>
                            <span className="text-white"><strong>Uncertain</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tutorial Modal */}
            {showTutorial && (
                <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-2">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
                        <div className="p-3">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-lg font-bold">Active Asteroid Tutorial</h2>
                                <Button 
                                    onClick={() => setShowTutorial(false)}
                                    variant="outline"
                                    className="text-xs px-2 py-1"
                                >
                                    ✕ Close
                                </Button>
                            </div>
                            <div className="p-4 text-center text-sm text-gray-200">Tutorial is not available.</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Classification Interface */}
            {!showTutorial && (
                <div className="flex-1 min-h-0 overflow-hidden p-2 md:p-4">
                    {/* Annotation Interface - responsive sizing */}
                    <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden max-w-4xl mx-auto">
                        <ImageAnnotator
                            initialImageUrl={imageUrl}
                            anomalyId={anomaly.id}
                            anomalyType="active-asteroid"
                            assetMentioned={imageUrl}
                            structureItemId={3103}
                            annotationType="AA"
                            className="h-full"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
