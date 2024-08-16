"use client";

import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import axios from "axios";

export const RooverFromAppeears: React.FC = () {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [rovers, setRovers] = useState(null);
    const [roverConfig, setRoverConfig] = useState(null);

    const fetchMarsImages = async () => {
        const randomDate = Math.floor(Math.random() * 1000) + 1;
        const selectedRover = 'perseverance';
        const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${selectedRover}/photos?sol=${randomDate}&api_key=iT0FQTZKpvadCGPzerqXdO5F4b62arNBOP0dtkXE`;

        try {
            const response = await axios.get(apiUrl);
            if (response.data.photos && response.data.photos.length > 0) {
                setRovers([response.data.photos[0].img_src]);
                setRoverConfig(response.data);
            } else {
                setRovers(['No images found for the given date and rover.']);
            };
        } catch (error) {
            console.error(error);
            setRovers(['An error occurred while fetching the image.']);
        };
    };

    async function fetchPhotosOnUserPlanet() {
        // pass
    };
};