"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Navbar from "@/components/Layout/Navbar";
import { PostCardSingleWithGeneratorEditMode } from "@/content/Posts/PostWithGen";
import CloudClassificationSummary from "@/components/Structures/Missions/Meteorologists/Cloudspotting/CloudAggregator";
import BiomeAggregator from "@/components/Data/Generator/BiomeAggregator";

import { Classification } from "../../[id]/page";

export default function EditPlanetAnomaly({ params }: { params: { id: string } }) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [classification, setClassification] = useState<Classification | null>(null);
    const [relatedClassifications, setRelatedClassifications] = useState<Classification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true; // Prevent setting state if unmounted

        const fetchClassification = async () => {
            if (!params.id || !session) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("classifications")
                .select("*, anomaly:anomalies(*), classificationConfiguration, media")
                .eq("id", params.id)
                .single();

            if (error) {
                if (isMounted) setError("Failed to fetch classification.");
                setLoading(false);
                return;
            }

            if (data && isMounted) {
                // Extract media URLs correctly
                let images: string[] = [];

                if (Array.isArray(data.media)) {
                    images = data.media
                        .map((item: { uploadUrl: any; }) => (typeof item === "string" ? item : item?.uploadUrl))
                        .filter(Boolean);
                } else if (data.media?.uploadUrl) {
                    images.push(data.media.uploadUrl);
                }

                setClassification({
                    ...data,
                    images,
                    votes: data.classificationConfiguration?.votes || 0,
                });

                // Fetch related classifications
                const parentPlanetLocation = data.anomaly?.id;
                if (parentPlanetLocation) {
                    const { data: relatedData, error: relatedError } = await supabase
                        .from("classifications")
                        .select("*, anomaly:anomalies(*), classificationConfiguration, media")
                        .eq("classificationConfiguration->>parentPlanetLocation", parentPlanetLocation.toString())
                        .eq("author", session.user.id);

                    if (relatedError) {
                        if (isMounted) setError("Failed to fetch related classifications.");
                    } else if (relatedData && isMounted) {
                        setRelatedClassifications(relatedData);
                    }
                }
            }

            setLoading(false);
        };

        fetchClassification();

        return () => {
            isMounted = false; // Cleanup function to avoid setting state on unmounted component
        };
    }, [params.id, supabase, session]);

    const cloudClassifications = relatedClassifications.filter(
        (related) => related.classificationtype === "cloud"
    );
    
    // const handleCloudSummaryUpdate = (summary: AggregatedCloud) => {
    //     setCloudSummary(summary); 
    // };

    if (loading) {
        return (
            <p>Loading classification data...</p>
        );
    };
    
    if (error) {
        return (
            <p className="text-red-500">{error}</p>
        );
    };

    if (!classification) {
        return (
            <p>No classification found.</p>
        );
    };

    return (
        <div className="p-6 bg-black text-white border border-gray-200 rounded-md shadow-md">
            <Navbar />
            <img
                className="absolute inset-0 w-full h-full object-cover opacity-20 z-[-1]"
                src="/assets/Backdrops/Venus.png"
                alt="Barren (default planet type) background"
            />
            <PostCardSingleWithGeneratorEditMode
                key={classification.id}
                classificationId={classification.id}
                title={classification.title || "Untitled"}
                author={classification.author || "Unknown"}
                content={classification.content || "No content available"}
                votes={classification.votes || 0}
                category={classification.classificationtype || "Uncategorized"}
                tags={classification.tags || []}
                images={classification.images || []}
                anomalyId={classification.anomaly ? String(classification.anomaly.id) : ""}
                classificationConfig={classification.classificationConfiguration}
                classificationType={classification.classificationtype || "Unknown"}
            />

            {/* Related Classifications */}
            {/* {relatedClassifications.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-xl font-semibold">Related Classifications</h3>
                    <ul className="list-disc pl-5">
                        {relatedClassifications.map((related) => (
                            <li key={related.id}>{related.classificationtype} - {related.id}</li>
                        ))}
                    </ul>
                </div>
            )} */}
        </div>
    );
};