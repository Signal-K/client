'use client';

import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

interface TickerProps {
    classfiicationTypes: string[];
    anomalySet: string;
};

export default function MultiUseTimer({ classfiicationTypes, anomalySet }: TickerProps) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [classifications, setClssifications] = useState<any[]>([]);
    const [countdown, setCountdown] = useState<number | null>(null);

    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchClassifications = async () => {
            if (!session) {
                return null;
            };

            const {
                data, error
            } = await supabase
                .from("classifications")
                .select('id, classificationtype, created_at')
                .eq('author', session.user.id)
                .in('classificationtype', [classfiicationTypes])
                .order('created_at', {
                    ascending: false
                });

            if (error) {
                console.error("Error fetching classifications: ", error);
            } else {
                setClssifications(data || []);
            };
        };

        fetchClassifications();
    }), [session];

    useEffect(() => {
        const checkRecentClassifications = () => {
            const relevantClassifications = classifications.filter((classification) => {
                const timeDiff = new Date().getTime() - new Date(classification.created_at).getTime();
                return timeDiff <= 24 * 60 * 60 * 1000 * 7; // Within the last week
            });

            if (relevantClassifications.length >= 5) {
                const FifthRecentClassification = relevantClassifications[4];
                const fifthRecentTime = new Date(FifthRecentClassification.created_at).getTime();
                const timeLeft = fifthRecentTime + 24 * 60 * 60 * 1000 * 7 - new Date().getTime();
                setCountdown(timeLeft > 0 ? timeLeft : 0);
            };
        };

        checkRecentClassifications();
    }, [classifications]);

    const formatTime = ( time: number ) => {
        const hours = Math.floor(time / 1000 / 60 / 60);
        const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((time % (1000 * 60)) / 1000);
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex flex-wrap gap-6 p-6">
        <div className="bg-gray-900 bg-opacity-80 p-4 rounded-lg">
            <h3 className="text-xl font-semibold text-white">{classfiicationTypes[0]} Overview</h3>
            <p className="text-sm text-gray-400">{classifications.length} classifications available</p>

            {countdown !== null && countdown > 0 ? (
                <div className="mt-4 text-center">
                    <p className="text-lg text-yellow-400">Please wait for new anomalies to be identified by your instrunments</p>
                    <p className="text-white text-xl font-bold">{formatTime(countdown)}</p>
                </div>
            ) : (
                <p className="mt-4 text-sm text-gray-400">More classifications are available!</p>
            )}
        </div>
    </div>
  );
};