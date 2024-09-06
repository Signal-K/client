"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface Classification {
    id: number;
    text: string;
    classificationtype: string;
    anomaly: number | null;
}

interface ClassificationViewerProps {
    classificationType: string;
}

const ClassificationViewer: React.FC<ClassificationViewerProps> = ({ classificationType }) => {
    const supabase = useSupabaseClient();
    
    const [classifications, setClassifications] = useState<Classification[]>([]);

    // Fetch classifications based on selected type
    useEffect(() => {
        if (!classificationType) return;

        const fetchClassifications = async () => {
            try { 
                const { data, error } = await supabase
                    .from('classifications')
                    .select('id, content, anomaly')
                    .eq('classificationtype', classificationType);

                if (error) throw error;

                // Ensure data matches the Classification interface
                const classificationsData: Classification[] = data.map((item: { id: number; content: string; anomaly: number | null }) => ({
                    id: item.id,
                    text: item.content,
                    classificationtype: classificationType,
                    anomaly: item.anomaly
                }));

                setClassifications(classificationsData);
            } catch (error) {
                console.error('Error fetching classifications:', error);
            }
        };

        fetchClassifications();
    }, [classificationType, supabase]);

    return (
        <div className="p-4 max-w-lg mx-auto bg-gray-800 text-white rounded-md">
            <h1 className="text-xl font-bold mb-4">Classification Viewer</h1>
            
            {classificationType && (
                <div>
                    <h2 className="text-lg font-semibold mt-4">Classifications for {classificationType}:</h2>
                    <div className="mt-2 space-y-2">
                        {classifications.map((classification) => (
                            <div key={classification.id} className="p-4 bg-gray-700 border border-gray-600 rounded-md flex justify-between items-center">
                                <span>{classification.text}</span>
                                {classification.anomaly && (
                                    <span className="text-yellow-300 font-semibold">Anomaly ID: {classification.anomaly}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassificationViewer;