"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Users, Globe } from "lucide-react";

interface Contributor {
    username: string;
    avatar: string;
};

interface KeyStat {
    label: string;
    value: string;
};

interface PostCardProps {
    name: string;
    type: string;
    profileImage?: string;
    discoveredOn: string;
    contributors: Contributor[];
    parentAnomaly: string;
    keyStats: KeyStat[];
};

export default function ClassificationGameCard({
    name = "Unnamed Discovery",
    type = "Unknown",
    profileImage,
    discoveredOn = "Unknown",
    contributors = [],
    parentAnomaly = "Unknown",
    keyStats = [],
}: PostCardProps) {
    const imageUrl = profileImage || generateImagePlaceholder(name);

    return (
        <Card className="w-full max-w-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900 overflow-hidden relative border-2 border-slate-300 rounded-xl shadow-lg">
            <></>
        </Card>
    );
};

const generateImagePlaceholder = (name: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const context = canvas.getContext('2d');

    if (context) {
        context.fillStyle = `hsl(${Math.random() * 360}, 70%, 80%)`;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = 'bold 80px Arial';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText((name && name.length > 0) ? name.charAt(0).toUpperCase() : '?', canvas.width / 2, canvas.height / 2);
    };

    return canvas.toDataURL();
};