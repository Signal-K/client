"use client";

import type React from "react";
import { useRef } from "react";
import type { Anomaly, Star } from "@/types/Structures/telescope";
import { AnomalyComponent } from "../viewport/anomaly-component";
import { Move } from "lucide-react";

interface SatelliteViewProps {
    stars?: Star[];
    filteredAnomalies?: Anomaly[];
    isDragging: boolean;
    handleMouseDown: (e: React.MouseEvent) => void;
    handleMouseMove: (e: React.MouseEvent) => void;
    handleMouseUp: () => void;
    handleAnomalyClick: (anomaly: Anomaly) => void;
    currentSectorName: string;
    focusedAnomaly?: Anomaly | null;
    anomalies?: Anomaly[];
};

export function SatelliteView({
    stars = [],
    filteredAnomalies = [],
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleAnomalyClick,
    currentSectorName,
    focusedAnomaly = null,
    anomalies = [],
}: SatelliteViewProps) {
    const viewportRef = useRef<HTMLDivElement>(null);

    return (
        <div className="h-full relative">
            <div
                ref={viewportRef}
                className="w-full h-full cursor-move relative overflow-hidden"
                style={({
                    background: `
                        radial-gradient(ellipse at 30% 40%, #0a0a1a 0%, transparent 70%),
                        radial-gradient(ellipse at 70% 60%, #000510 0%, transparent 70%),
                        radial-gradient(ellipse at 20% 80%, #050510 0%, transparent 70%),
                        linear-gradient(135deg, #000000 0%, #0a0a1a 50%, #000510 100%)
                    `,
                })}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                        background: `
                        radial-gradient(ellipse 300px 150px at 20% 30%, #a8d8ea22 0%, transparent 70%),
                        radial-gradient(ellipse 200px 100px at 80% 70%, #ffb3d922 0%, transparent 70%),
                        radial-gradient(ellipse 150px 200px at 60% 20%, #b8e6b822 0%, transparent 70%)
                        `,
                    }}
                    />

                    {/* Simple crosshair in center */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-8 h-8 border border-[#a8d8ea]/40 rounded-full relative">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-[#a8d8ea]/30 transform -translate-y-1/2" />
                        <div className="absolute left-1/2 top-0 w-px h-full bg-[#a8d8ea]/30 transform -translate-x-1/2" />
                        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-[#a8d8ea]/60 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                </div>

                {filteredAnomalies.map((anomaly) => (
                    <AnomalyComponent
                        key={anomaly.id}
                        anomaly={anomaly}
                        onClick={handleAnomalyClick}
                        isHighlighted={focusedAnomaly?.id === anomaly.id}
                    />
                ))}
            </div>
        </div>
    );
};