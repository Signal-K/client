"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { format } from 'date-fns';
import ClassificationSummary from "../../(anomalies)/(planets)/classificationsGenerated";

interface Classification {
    id: number;
    content: string;
    classificationtype: string;
    anomaly: number | null;
    created_at: string;
    media: any[];
    classificationConfiguration: Record<string, any>; // Updated type to handle JSON data
};

interface Anomaly {
    id: number;
    content: string;
};

interface ClassificationViewerProps {
    classificationType: string;
};

const ClassificationViewer: React.FC<ClassificationViewerProps> = ({ classificationType }) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [classifications, setClassifications] = useState<Classification[]>([]);
    const [anomalies, setAnomalies] = useState<Map<number, Anomaly>>(new Map());
    const [selectedClassification, setSelectedClassification] = useState<Classification | null>(null);
    const [offset, setOffset] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [showSummary, setShowSummary] = useState<boolean>(false);

    const fetchClassifications = useCallback(async () => {
        if (!classificationType) return;

        setLoading(true);

        try {
            // Fetch classifications
            const { data: classificationsData, error: classificationsError } = await supabase
                .from('classifications')
                .select('id, content, author, classificationtype, anomaly, created_at, media, classificationConfiguration')
                .eq('author', session?.user?.id)
                .eq('classificationtype', classificationType)
                .range(offset, offset + 4);

            if (classificationsError) throw classificationsError;

            setClassifications(classificationsData as Classification[]);

            // Fetch anomalies
            const { data: anomaliesData, error: anomaliesError } = await supabase
                .from('anomalies')
                .select('id, content');

            if (anomaliesError) throw anomaliesError;

            // Map anomalies for quick lookup
            const anomaliesMap = new Map<number, Anomaly>();
            anomaliesData.forEach(anomaly => {
                anomaliesMap.set(anomaly.id, anomaly);
            });

            setAnomalies(anomaliesMap);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [classificationType, offset, supabase]);

    useEffect(() => {
        fetchClassifications();
    }, [fetchClassifications]);

    const handleClassificationClick = (classification: Classification) => {
        setSelectedClassification(classification);
    };

    const handleClose = () => {
        setSelectedClassification(null);
    };

    const loadMore = () => {
        setOffset(prevOffset => prevOffset + 5);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMMM d, yyyy');
    };

    return (
        <div className="p-4 max-w-lg mx-auto text-white rounded-md">
            <button
                className="mb-4 px-4 py-2 bg-[#5FCBC3] text-white rounded-md"
                onClick={() => setShowSummary(prev => !prev)}
            >
                {showSummary ? 'Show Classifications' : 'Show Summary'}
            </button>

            {showSummary ? (
                <ClassificationSummary />
            ) : (
                <>
                    {classificationType && (
                        <div>
                            <h2 className="text-lg font-semibold mt-4">Classifications for {classificationType}:</h2>
                            <div className="mt-2 space-y-2">
                                {classifications.map((classification) => {
                                    const anomalyContent = classification.anomaly ? anomalies.get(classification.anomaly)?.content : '';
                                    return (
                                        <div
                                            key={classification.id}
                                            className="p-4 bg-gray-700 border border-gray-600 rounded-md flex flex-col cursor-pointer"
                                            onClick={() => handleClassificationClick(classification)}
                                        >
                                            <div className="flex items-start space-x-3">
                                                {anomalyContent && (
                                                    <span className="text-yellow-300 font-semibold">{anomalyContent}</span>
                                                )}
                                            </div>
                                            <div className="mt-2">
                                                <p>{classification.content}</p>
                                            </div>
                                            <div className="mt-2 text-gray-400 text-sm">
                                                Posted on: {formatDate(classification.created_at)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                className="mt-4 px-4 py-2 bg-[#5FCBC3] text-white rounded-md"
                                onClick={loadMore}
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}

                    {selectedClassification && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-gray-900 p-4 rounded-lg max-w-lg w-full overflow-y-auto">
                                <h2 className="text-xl font-bold mb-4">Classification Details</h2>
                                <div className="mb-4">
                                    <p className="text-lg font-semibold">{selectedClassification.content}</p>
                                    <div className="mt-2 text-gray-400 text-sm">
                                        Posted on: {formatDate(selectedClassification.created_at)}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    {/* Media display */}
                                    {selectedClassification.media && selectedClassification.media.map((item, index) => (
                                        <div key={index} className="mb-2">
                                            {item[1] && (
                                                <img
                                                    src={item[1]}
                                                    alt={`Media ${index}`}
                                                    className="max-w-full h-auto"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mb-4">
                                    {/* Classification Configuration */}
                                    <h3 className="text-lg font-semibold">Classification Configuration:</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-300">
                                        {Object.entries(selectedClassification.classificationConfiguration).map(([key, value]) => (
                                            <li key={key} className="mt-1">
                                                <strong>{key}:</strong> {value ? 'Yes' : 'No'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    className="px-4 py-2 bg-[#5FCBC3] text-white rounded-md"
                                    onClick={handleClose}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ClassificationViewer;

export const ClassificationViewerAll: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [classifications, setClassifications] = useState<Classification[]>([]);
    const [anomalies, setAnomalies] = useState<Map<number, Anomaly>>(new Map());
    const [selectedClassification, setSelectedClassification] = useState<Classification | null>(null);
    const [offset, setOffset] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [showSummary, setShowSummary] = useState<boolean>(false);

    const fetchClassifications = useCallback(async () => {
        if (!session) {
            return;
        }

        setLoading(true);

        try {
            // Fetch classifications
            const { data: classificationsData, error: classificationsError } = await supabase
                .from('classifications')
                .select('id, content, author, classificationtype, anomaly, created_at, media, classificationConfiguration')
                .eq('author', session?.user?.id)
                .range(offset, offset + 4);

            if (classificationsError) throw classificationsError;

            setClassifications(classificationsData as Classification[]);

            // Fetch anomalies
            const { data: anomaliesData, error: anomaliesError } = await supabase
                .from('anomalies')
                .select('id, content');

            if (anomaliesError) throw anomaliesError;

            // Map anomalies for quick lookup
            const anomaliesMap = new Map<number, Anomaly>();
            anomaliesData.forEach(anomaly => {
                anomaliesMap.set(anomaly.id, anomaly);
            });

            setAnomalies(anomaliesMap);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, [offset, supabase]);

    useEffect(() => {
        fetchClassifications();
    }, [fetchClassifications]);

    const handleClassificationClick = (classification: Classification) => {
        setSelectedClassification(classification);
    };

    const handleClose = () => {
        setSelectedClassification(null);
    };

    const loadMore = () => {
        setOffset(prevOffset => prevOffset + 5);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MMMM d, yyyy');
    };

    return (
        <div className="p-4 max-w-lg mx-auto text-white rounded-md">
            <button
                className="mb-4 px-4 py-2 bg-[#5FCBC3] text-white rounded-md"
                onClick={() => setShowSummary(prev => !prev)}
            >
                {showSummary ? 'Show Classifications' : 'Show Summary'}
            </button>

            {showSummary ? (
                <ClassificationSummary />
            ) : (
                <>
                        <div>
                            <h2 className="text-lg font-semibold mt-4">Classifications:</h2>
                            <div className="mt-2 space-y-2">
                                {classifications.map((classification) => {
                                    const anomalyContent = classification.anomaly ? anomalies.get(classification.anomaly)?.content : '';
                                    return (
                                        <div
                                            key={classification.id}
                                            className="p-4 bg-gray-700 border border-gray-600 rounded-md flex flex-col cursor-pointer"
                                            onClick={() => handleClassificationClick(classification)}
                                        >
                                            <div className="flex items-start space-x-3">
                                                {anomalyContent && (
                                                    <span className="text-yellow-300 font-semibold">{anomalyContent}</span>
                                                )}
                                            </div>
                                            <div className="mt-2">
                                                <p>{classification.content}</p>
                                            </div>
                                            <div className="mt-2 text-gray-400 text-sm">
                                                Posted on: {formatDate(classification.created_at)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                className="mt-4 px-4 py-2 bg-[#5FCBC3] text-white rounded-md"
                                onClick={loadMore}
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Load More'}
                            </button>
                        </div>

                    {selectedClassification && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="bg-gray-900 p-4 rounded-lg max-w-lg w-full overflow-y-auto">
                                <h2 className="text-xl font-bold mb-4">Classification Details</h2>
                                <div className="mb-4">
                                    <p className="text-lg font-semibold">{selectedClassification.content}</p>
                                    <div className="mt-2 text-gray-400 text-sm">
                                        Posted on: {formatDate(selectedClassification.created_at)}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    {/* Media display */}
                                    {selectedClassification.media && selectedClassification.media.map((item, index) => (
                                        <div key={index} className="mb-2">
                                            {item[1] && (
                                                <img
                                                    src={item[1]}
                                                    alt={`Media ${index}`}
                                                    className="max-w-full h-auto"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="mb-4">
                                    {/* Classification Configuration */}
                                    <h3 className="text-lg font-semibold">Classification Configuration:</h3>
                                    <ul className="list-disc list-inside ml-4 text-gray-300">
                                        {Object.entries(selectedClassification.classificationConfiguration).map(([key, value]) => (
                                            <li key={key} className="mt-1">
                                                <strong>{key}:</strong> {value ? 'Yes' : 'No'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    className="px-4 py-2 bg-[#5FCBC3] text-white rounded-md"
                                    onClick={handleClose}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};