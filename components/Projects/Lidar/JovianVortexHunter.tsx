'use client';

import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import ClassificationForm from "../(classifications)/PostForm";

import { Anomaly } from "../Telescopes/Transiting";

interface Props {
    anomalyid: number | bigint;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function StarterJovianVortexHunter({
    anomalyid
}: Props) {
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/lidar-jovianVortexHunter/${anomalyid}.png`;

    return (
        <p>Test</p>
    );
};