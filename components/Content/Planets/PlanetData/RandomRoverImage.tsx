import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Card from "../../../Core/Card";
import { RoverContentPostForm } from "../../CreatePostForm";

interface RoverImageCardProps {
    roverImage: {
        id: string;
        content: string;
        image: string;
        planets2: string;
    };
};

export const RoverImage = ({ date, rover, onImageMetadataChange }) => {
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
                    onImageMetadataChange(metadataText);
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

    return (
        <div>
            {/* <h2>Your Rover Photo</h2>
            <p>Date: {date}</p>
            <p>Rover model: {rover}</p> */}
            {imageUrl ? (
                <>
                    <img src={imageUrl} alt="Rover image" />
                    {/* <RoverContentPostForm metadata={metadata} imageLink={imageUrl} /> */}
                    {/* <pre>{imageUrl}</pre> */}
                </>
            ) : (
                <p>Loading...</p> 
            )}
        </div>
    );
};

export const RoverImageNoHandle = ({ date, rover, sectorNo }) => {
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
    }, [date, rover]);

    return (
        <div>
            {imageUrl ? (
                <>
                    <img src={imageUrl} alt="Rover image" />
                    <RoverContentPostForm metadata={metadata} imageLink={imageUrl} sector={sectorNo}/>
                </>
            ) : (
                <p>Loading...</p> 
            )}
        </div>
    );
};

export default function RoverImageGallery() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const randomDate = Math.floor(Math.random() * 1000) + 1; // Allow the user to insert a custom date, set date based on current date + user actions?
    const selectedRover = 'perseverance';
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [metadata, setMetadata] = useState('');

    const handleMetadataChange = (newMetadata, newImageUrl) => {
        setMetadata(newMetadata);
        setImageUrl(newImageUrl);
    };

    // const imgSrc = metadata && metadata.img_src;

    return (
        <Card noPadding={false}>
            <div className="">
                <pre>{imageUrl}</pre>
                <RoverImage date='721' rover={selectedRover} onImageMetadataChange={handleMetadataChange} />
                {/* <RoverContentPostForm metadata={metadata} imageLink={imageUrl} />                */}
            </div>
        </Card>
    );
};