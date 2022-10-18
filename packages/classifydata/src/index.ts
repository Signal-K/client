import React, { useState, useEffect } from "react";
import axios from "axios";

export const RoverImage = ({ date, rover, onImageMetadataChange }: { date: string; rover: string; onImageMetadataChange: string; }) => {
    const [imageUrl, setImageUrl] = useState('');
    const apiKey = 'iT0FQTZKpvadCGPzerqXdO5F4b62arNBOP0dtkXE';

    const [imageMetadata, setImageMetadata] = useState('');
    const [metadata, setMetadata] = useState('');

    useEffect(() => {
        const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${date}&api_key=${apiKey}`;

        axios.get(apiUrl)
            .then((response) => {
                if (response.data.photos && response.data.photos.length > 0) {
                    const firstImageMetadata = response.data.photos[0];
                    // setImageUrl(firstImageMetadata.img_src || '');
                    const firstImage = response.data.photos[0].img_src;
                    setImageUrl(firstImage);
                    const metadataText = JSON.stringify(firstImageMetadata, null, 2);
                    setImageMetadata(metadataText);
                    setMetadata(metadataText)
                    // onImageMetadataChange(metadataText);
                } else {
                    setImageUrl('No images found for the given date & rover.');
                    setImageMetadata('No images found for the given date & rover' + JSON.stringify(response));
                }
            })
            .catch((error) => {
                setImageUrl('An error occurred while fetching the image');
                setImageMetadata('Error fetching image');
                console.error(error);
            });
    }, [date, rover, onImageMetadataChange]);
};

/*
            {/* <h2>Your Rover Photo</h2>
            <p>Date: {date}</p>
            <p>Rover model: {rover}</p> 
            {imageUrl ? (
                <>
                    <img src={imageUrl} alt="Rover image" />
                    {/* <RoverContentPostForm metadata={metadata} imageLink={imageUrl} /> 
                    {/* <pre>{imageUrl}</pre> 
                </>
            ) : (
                <p>Loading...</p> 
            )}
*/