'use client'

import { Badge } from "@/src/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, Eye, Cloud, Zap, Thermometer, Mountain, Globe } from "lucide-react";
import type { WeatherAnomaly, WeatherMission, WeatherProject } from "@/types/Structures/WeatherBalloon";

interface WeatherDiscoveriesViewProps {
    classifications: any[];
    allClassifications: any[];
    projectMissions: WeatherMission[];
    selectedProject: WeatherProject | null;
    onBack: () => void;
    onViewAnomaly: ( anomaly: WeatherAnomaly ) => void;
    showAllDiscoveries: boolean;
    anomalies: WeatherAnomaly[];
};

export function WeatherDiscoveriesView({
    classifications,
    allClassifications,
    projectMissions,
    selectedProject,
    onBack,
    onViewAnomaly,
    showAllDiscoveries,
    anomalies,
}: WeatherDiscoveriesViewProps) {
    // Convert classifications to anomaly format (get the anomalies) for displaying alongside the anomalies
    // const convertClassifficationsToAnomalies = (classificationData: any[]): WeatherAnomaly[] => {
    //     return classificationData
    //         .map(( classification ) => {
    //             // Find corresponding anomaly from `classifications[id].anomaly => anomalies` table
    //             const dbAnomalyId = `db-${classification.anomaly}`
    //             const anomaly = anomalies.find((a) => a.id === dbAnomalyId);
    //             if (anomaly) {
    //                 return {
    //                     ...anomaly,
    //                     classified: true,
    //                     discoveryDate: new Date(classification.created_at).toLocaleDateString(),
    //                     classificationId: classification.id,
    //                     classificationContent: classification.content,
    //                     discoveredBy: showAllDiscoveries ? `User${classification.author?.slice(-4)}` : undefined,
    //                 };
    //             };

    //             // If anomaly not found - fallback
    //             const mapClassificationType = (type: string): WeatherAnomaly["type"] => {
    //                 switch (type) {
    //                     case "storm":
    //                         return "storm";
    //                     case "cloud":
    //                         return "cloud_formation";
    //                     case "atmospheric":
    //                         return "atmospheric_phenomenon";
    //                     case "surface":
    //                         return "surface_weather";
    //                     case "geological":
    //                         return "geological_weather";
    //                     default:
    //                         return "cloud_formation";
    //                 };
    //             };

    //             const mapProjectType = (type: string): string => {
    //                     switch (type) {
    //                     case "storm":
    //                         return "storm-tracking"
    //                     case "cloud":
    //                         return "cloud-classification"
    //                     case "atmospheric":
    //                         return "atmospheric-phenomena"
    //                     case "surface":
    //                         return "surface-weather"
    //                     case "geological":
    //                         return "geological-weather"
    //                     default:
    //                         return "cloud-classification"
    //                 };
    //             };
                
    //             const anomalyType = mapClassificationType(classification.classificationtype || "cloud");
    //             const project = mapProjectType(classification.classificationtype || "cloud");

    //             // If you want to return a fallback WeatherAnomaly object, construct and return it here.
    //             // Otherwise, return undefined to filter out this entry.
    //             return undefined;
    //         })
    //         .filter((anomaly): anomaly is (WeatherAnomaly & { classified: boolean; discoveryDate: string; classificationId: any; classificationContent: any; discoveredBy?: string }) => anomaly !== undefined);
    // };

    return (
        <div className="h-full bg-gradient-to-br from-[#263238] via-[#37474F] to-[#455A64] p-4 overflow-hidden">
            <div className="max-w-7xl mx-auto h-full flex flex-col">
                {/* Header */}
                <div className="mb-4">
                    <div className="flex items-center gap-3 mb-3">
                        <Button onClick={onBack} size="sm" className="bg-[#607D8B] text-white hover:bg-[#546E7A]">
                            <ArrowLeft className="h-3 w-3 mr-1" />
                                Back
                        </Button>
                        <h1 className="text-xl font-bold text-[#ECEFF4]">Weather Archive</h1>
                        <Badge className="bg-[#4CAF50] text-white text-xs">
                            {showAllDiscoveries ? "All Users" : "Your Discoveries"}
                        </Badge>
                    </div>

                    {selectedProject && (
                        <div className="bg-gradient-to-r from=[#37474F] to-[#455A64] border border-[#607D8B] rounded-lg p-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                    style={{ background: selectedProject.bgGradient }}
                                >
                                    {selectedProject.icon}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-[#ECEFF4]">
                                        {selectedProject.name}
                                    </h3>
                                    <p className="text-[#B0BEC5] text-xs">{selectedProject.description}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
                    <div className="flex flex-col">
                        {/* <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-[#ECEFF4]">
                            <CheckCircle2 className="h-4 w-4 text-[#4CAF50]" />
                            Classified Anomalies ({ filteredAnomalies.length })
                        </h3>

                        {filteredAnomalies.length === 0 ? (

                        ) : (

                        )} */}
                    </div>

                    {/* Missions for balloon */}
                </div>
            </div>
        </div>
    );
};