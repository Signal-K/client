import React, { useState, useEffect } from "react";
import axios from "axios";

export const RoverImageNoHandle = ({ date, rover, }: { date: string; rover: string;}) => { // sectorNo }: { date: string; rover: string; sectorNo: string;}) => {
    const [imageUrl, setImageUrl] = useState('');
    const apiKey = 'iT0FQTZKpvadCGPzerqXdO5F4b62arNBOP0dtkXE';

    useEffect(() => {
        const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${date}&api_key=${apiKey}`;

        axios.get(apiUrl)
            .then((response) => {
                if (response.data.photos && response.data.photos.length > 0) {
                    const firstImageMetadata = response.data.photos[0];
                    const firstImage = firstImageMetadata.img_src;
                    setImageUrl(firstImage);
                } else {
                    setImageUrl('No images found for the given date & rover.');
                }
            })
            .catch((error) => {
                setImageUrl('An error occurred while fetching the image');
                console.error(error);
            });
    }, [date, rover]);

    return (
        <div>
            {imageUrl ? (
                <img src={imageUrl} alt="Rover image"  className="rounded-lg"
                height="100"
                style={{
                  aspectRatio: "100/100",
                  objectFit: "cover",
                }}
                width="100"/>
            ) : (
                <p>Loading...</p> 
            )}
        </div>
    );
};