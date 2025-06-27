'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WeatherAnomaly } from "@/types/Structures/WeatherBalloon";
import { Zap, Cloud, Wind, Thermometer, Mountain, Globe } from "lucide-react";

interface WeatherAnomalyDialogProps {
    showClassifyDialog: boolean;
    setShowClassifyDialog: ( show: boolean ) => void;
    selectedAnomaly: WeatherAnomaly | null;
    handleClassify: () => void;
    dbAnomaly?: any;
};

export function WeatherAnomalyDialog({
    showClassifyDialog,
    setShowClassifyDialog,
    selectedAnomaly,
    handleClassify,
    dbAnomaly
}: WeatherAnomalyDialogProps) {
    const getAnomalyIcon = ( type: string ) => {
        switch (type) {
            case "storm":
                return <Zap className="h-5 w-5 text-[#4C9AFF]" />
            case "cloud_formation":
                return <Cloud className="h-5 w-5 text-[#79E2F2]" />
            case "atmospheric_phenomenon":
                return <Wind className="h-5 w-5 text-[#B39DDB]" />
            case "surface_weather":
                return <Thermometer className="h-5 w-5 text-[#A5D6A7]" />
            case "geological_weather":
                return <Mountain className="h-5 w-5 text-[#BCAAA4]" />
            default:
                return <Cloud className="h-5 w-5 text-[#79E2F2]" />
        };
    };

    const getAnomalyTypeLabel = ( type: string ) => {
        switch ( type ) {
            case "storm":
                return "Storm System"
            case "cloud_formation":
                return "Cloud Formation"
            case "atmospheric_phenomenon":
                return "Atmospheric Phenomenon"
            case "surface_weather":
                return "Surface Weather"
            case "geological_weather":
                return "Geological Weather"
            default:
                return type
        };
    };

    return (
        <Dialog open={showClassifyDialog} onOpenChange={setShowClassifyDialog}>
            <DialogContent className="bg-gradient-to-br from-[#37474F] to-[#263238] border-2 border-[#607D8B] text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-[#ECEFF4] text-lg">Classify Weather Phenomenon</DialogTitle>
                </DialogHeader>
                {selectedAnomaly && (
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-[#455A64] to-[#37474F] rounded-lg p-4 border border-[#546E7A]">
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center"
                                    style={{
                                        // background:
                                            // weatherProjects.find(( p ) => p.id === selectedAnomaly.project?.bgGradient || "linear-gradient(135deg, #79E2F2, #00B8D4")
                                    }}
                                >
                                    {getAnomalyIcon(selectedAnomaly.type)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-[#ECEFF4]">{selectedAnomaly.name}</h4>
                                    <p className="text-sm text-[#B0BEC5]">
                                        {getAnomalyTypeLabel(selectedAnomaly.type)}
                                    </p>
                                    <div className="flex items-center gap-1 text-xs text-[#90A4A3] mt-1">
                                        <Globe className="h-3 w-3" />
                                        {/* <span>{getPlanetInfo(selectedAnomaly.planet).name}</span> */}
                                        <span>•</span>
                                        <span>{selectedAnomaly.region}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex justify-between">
                                        <span className="text-[#90A4AE]">ID:</span>
                                        <span className="font-mono text-[#ECEFF4] text-xs">{selectedAnomaly.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#90A4AE]">Body:</span> {/* Previously/defined as "Planet..." */}
                                        <div className="flex items-center gap-1">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                // style={{
                                                //     backgroundColor:
                                                //         getPlanetInfo(selectedAnomaly.planet).color
                                                // }}
                                            />
                                            {/* <span className="text-[#ECEFF4] text-xs">{getPlanetInfo(selectedAnomaly.planet).name}</span> */}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex justify-between">
                                        <span className="text-[#90A4AE]">Position:</span>
                                        <span className="font-mono text-[#ECEFF4] text-xs">
                                            ({selectedAnomaly.x.toFixed(1)})%,
                                            ({selectedAnomaly.y.toFixed(1)})%,
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#90A4AE]">Intensity:</span>
                                        <span className="font-mono text-[#ECEFF4] text-xs">
                                            {(selectedAnomaly.intensity * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[#90A4AE]">Project:</span>
                                    <span className="text-[#ECEFF4] text-xs">
                                        {/* {weatherProjects.find((p) => p.id === selectedAnomaly.project)?.name} */}
                                    </span>
                                </div>

                                {dbAnomaly && (
                                    <div className="border-t border-[#546E7A] pt-2 mt-2">
                                        <div className="text-xs text-[#81C784] mb-1">
                                            Database Information:
                                        </div>
                                        {dbAnomaly.anomalyType && (
                                            <div className="flex justify-between">
                                                <span className="text-[#90A4AE]">Type:</span>
                                                <Badge variant='outline' className="text-xs border-[#607D8B] text-[#[B0BEC5]">
                                                    {dbAnomaly.anomalyType}
                                                </Badge>
                                            </div>
                                        )}
                                        {dbAnomaly.content && (
                                            <div className="mt-2">
                                                <span className="text-[#90A4AE] text-xs">Description:</span>
                                                <p className="text-xs text-[B0BEC5] mt-1 p-2 bg-[#263238] rounded">
                                                    {dbAnomaly.content}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleClassify}
                                className="flex-1 bg-[#607D8B] hover:bg-[#546E7A] text-white border-none"
                            >
                                Back
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};