'use client';

import { useState, useEffect } from "react";
import { SatelliteDishIcon } from "lucide-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { TechSection } from "./TechSection";
import { UpgradeItem } from "./UpgradeItem";

type CapacityKey = 'probeCount' | 'balloonCount';
type UserCapacities = Record<CapacityKey, number>;

export default function MeteorologyResearch() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [availablePoints, setAvailablePoints] = useState(10);

    return (
        <></>
    );
};