import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Form } from "react-hook-form";

const RoverImage = ({ date, rover }) => {
    const [imageUrl, setImageUrl] = useState('');
    const apiKey = "iT0FQTZKpvadCGPzerqXdO5F4b62arNBOP0dtkXE"

    useEffect(() => {
        const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${date}&api_key=${apiKey}`;
        axios.get(apiUrl)
            .then((response) => {
                if (response.data.photos && response.data.photos.length > 0) {
                    const firstImage = response.data.photos[0].img_src;
                    setImageUrl(firstImage);
                } else {
                    setImageUrl("No images found for the given date and rover");
                }
            })
            .catch((error) => {
                setImageUrl('');
                console.error(error);
            });
    }, [date, rover]);

    return (
        <div>
            <h2>Mars Rover Photo</h2>
            <p>Date: {date}</p>
            <p>Rover: {rover}</p>
            <img src={imageUrl} alt="Mars Rover" />
        </div>
    );
};

interface Props {
    roverImage: {
        id: string;
        content: string;
        image: string;
        planets2: string;
    };
};

export function RoverImageCard({ roverImage }: Props) {
    const { id, content, image, planets2 } = roverImage;
    return (
        <div className="col-md-4 mb-4">
            <div style={{ width: '100%', height: "200px", overflow: "hidden" }}>
                <img
                    src={image}
                    alt="Rover Image"
                    className="w-100 h-auto"
                />                    
            </div>
        </div>
    );
};