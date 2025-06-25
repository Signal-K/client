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

export function WeatherAnomalyDialog({}) {
    return (
        <></>
    );
};