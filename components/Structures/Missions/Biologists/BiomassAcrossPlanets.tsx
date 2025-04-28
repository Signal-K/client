'use client';

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { startOfWeek } from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TIMEZONE = 'Australia/Melbourne';

export default function BiomeAcrossPlanets({
    classificationIds,
}: {
    classificationIds: string[];
}) {
    const supabase = useSupabaseClient();

    const [biomassScores, setBiomassScores] = useState<number[]>();
    const [densities, setDensities] = useState<number[] | null>();
    const [temperatures, setTemperatures] = useState<number[] | null>();
    const [periods, setPeriods] = useState<number[] | null>();
    const [radii, setRadii] = useState<number[] | null>();

    // const calculateBiomasses = (temperature?: number, radius?: number, surveyorPeriod?: number): number => {

    // }

    return (
        <></>
    );
};