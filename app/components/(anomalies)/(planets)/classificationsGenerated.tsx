"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

interface ClassificationCount {
    classificationType: string;
    count: number;
}

export default function ClassificationSummary() {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [classificationCounts, setClassificationCounts] = useState<ClassificationCount[]>([]);
    const [planetClassificationCount, setPlanetClassificationCount] = useState<number>(0);
    const [activePlanetClassificationCount, setActivePlanetClassificationCount] = useState<number>(0);

    useEffect(() => {
        const fetchClassificationData = async () => {
            if (!session?.user || !activePlanet?.id) return;

            try {
                // Fetch classifications and count by classification type
                const { data: classifications, error: classificationsError } = await supabase
                    .from('classifications')
                    .select('classificationtype')
                    .eq('author', session.user.id);

                if (classificationsError) throw classificationsError;

                const typeCounts: Record<string, number> = {};
                classifications?.forEach((classification) => {
                    if (classification.classificationtype) {
                        typeCounts[classification.classificationtype] = (typeCounts[classification.classificationtype] || 0) + 1;
                    }
                });

                const counts = Object.keys(typeCounts).map(key => ({
                    classificationType: key,
                    count: typeCounts[key]
                }));
                setClassificationCounts(counts);

                // Fetch classifications for the active planet
                const { data: planetClassifications, error: planetClassificationsError } = await supabase
                    .from('classifications')
                    .select('*')
                    .eq('author', session.user.id)
                    .eq('anomaly', activePlanet.id);

                if (planetClassificationsError) throw planetClassificationsError;

                setPlanetClassificationCount(planetClassifications?.length || 0);

                // Fetch classifications where classificationConfiguration includes activePlanet.id
                const { data: activePlanetClassifications, error: activePlanetClassificationsError } = await supabase
                    .from('classifications')
                    .select('*')
                    .eq('author', session.user.id)
                    .filter('classificationConfiguration', 'cs', JSON.stringify({ activePlanet: activePlanet.id }));

                if (activePlanetClassificationsError) throw activePlanetClassificationsError;

                setActivePlanetClassificationCount(activePlanetClassifications?.length || 0);

            } catch (error: any) {
                console.error('Error fetching classification data:', error.message);
            }
        };

        fetchClassificationData();
    }, [session?.user?.id, activePlanet?.id, supabase]);

    return (
        <div className="p-4 max-w-lg mx-auto bg-gray-800 text-white rounded-md">
            <h2 className="text-lg font-bold text-[#5FCBC3] mb-4">Your Classification Summary</h2>
            <div className="space-y-4">
                <div>
                    <h3 className="text-md font-semibold text-[#88C0D0]">Classifications by Type:</h3>
                    <ul className="space-y-2">
                        {classificationCounts.length > 0 ? (
                            classificationCounts.map(({ classificationType, count }) => (
                                <li key={classificationType} className="text-[#E5E9F0]">
                                    <strong className="text-[#BF616A]">{classificationType}:</strong> {count}
                                </li>
                            ))
                        ) : (
                            <p className="text-[#E5E9F0]">No classifications made yet.</p>
                        )}
                    </ul>
                </div>
                <div>
                    <h3 className="text-md font-semibold text-[#88C0D0]">Classifications for Active Planet:</h3>
                    <p className="text-[#E5E9F0]">
                        <strong className="text-[#BF616A]">Total:</strong> {planetClassificationCount}
                    </p>
                </div>
                <div>
                    <h3 className="text-md font-semibold text-[#88C0D0]">Classifications Including Active Planet:</h3>
                    <p className="text-[#E5E9F0]">
                        <strong className="text-[#BF616A]">Total:</strong> {activePlanetClassificationCount}
                    </p>
                </div>
            </div>
        </div>
    );
};