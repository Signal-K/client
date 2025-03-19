'use client';

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Navbar from "@/components/Layout/Navbar";
import { PostCardSingleWithGenerator } from "@/content/Posts/PostWithGen";

import CloudClassificationSummary from "@/components/Structures/Missions/Meteorologists/Cloudspotting/CloudAggregator";
import BiomeAggregator from "@/components/Data/Generator/BiomeAggregator";
import SatellitePlanetFourAggregator, { SatellitePlanetFourClassification} from "@/components/Structures/Missions/Astronomers/SatellitePhotos/P4/P4Aggregator";

import { Classification, Anomaly, AggregatedAI4M, AggregatedCloud, AI4MClassification, AggregatedP4 } from "../[id]/page";

export default function MarsClassifications() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [classifications, setClassifications] = useState<any[]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [dominantBiome, setDominantBiome] = useState<string | null>('Jungle');
    const [cloudSummary, setCloudSummary] = useState<AggregatedCloud | null>(null);
    const [p4Summary, setP4Summary] = useState<AggregatedP4 | null>(null);
    const [ai4MSummary, setAI4MSummary] = useState<AggregatedAI4M | null>(null);
    const [relatedClassifications, setRelatedClassifications] = useState<Classification[]>([]);

    const [showCurrentUser, setShowCurrentUser] = useState<boolean>(true);
    const [showMetadata, setShowMetadata] = useState<boolean>(false);
};