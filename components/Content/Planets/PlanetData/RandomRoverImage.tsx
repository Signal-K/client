import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Card from "../../../Card";

interface RoverImageCardProps {
    roverImage: {
        id: string;
        content: string;
        image: string;
        planets2: string;
    };
};

function RoverImageCard({ roverImage }: RoverImageCardProps) {
    const { id, content, image, planets2 } = roverImage;

    return (
        <div className="col-md-4 mb-4">
            <Card noPadding={false}>
                <div style={{ width: "100%", height: "200px", overflow: "hidden" }}>
                    <img src={image} alt="Rover image" className="w-100 h-auto" />
                </div>
            </Card>
        </div>
    );
};

const RoverImage = ({ date, rover, onImageMetadataChange }) => {
    const [imageUrl, setImageUrl] = useState('');
    const apiKey = 'iT0FQTZKpvadCGPzerqXdO5F4b62arNBOP0dtkXE';

    const [imageMetadata, setImageMetadata] = useState('');

    useEffect(() => {
        const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${date}&api_key=${apiKey}`;

        axios.get(apiUrl)
            .then((response) => {
                if (response.data.photos && response.data.photos.length > 0) {
                    const firstImage = response.data.photos[0].img_src;
                    setImageUrl(firstImage);
                    const metadataText = JSON.stringify(response.data.photos[0], null, 2);
                    setImageMetadata(metadataText);
                    onImageMetadataChange(imageMetadata);
                } else {
                    setImageUrl('No images found for the given date & rover.');
                    setImageMetadata('No images found for the given date & rover' + response);
                }
            })
            .catch((error) => {
                setImageUrl('An error occured while fetching the image');
                setImageMetadata('Error fetching image');
                console.error(error);
            });
    }, [date, rover, onImageMetadataChange]);

    return (
        <div>
            <h2>Your Rover Photo</h2>
            <p>Date: {date}</p>
            <p>Rover model: {rover}</p>
            {imageUrl ? (
                <>
                    <img src={imageUrl} alt="Rover image" />
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
    const [metadata, setMetadata] = useState('');

    const handleMetadataChange = (newMetadata) => {
        setMetadata(newMetadata);
    };

    const handlePostSubmit = async () => {
        if (content) {
            const user = session?.user?.id;
            if (user) {
                const response = await supabase.from('contentROVERIMAGES').upsert([
                    {
                        author: user,
                        metadata: metadata,
                        imageLink: RoverImage,
                        // planet: '1', // Change this when upserting in planets/[id].tsx
                        // basePlanet: '1',
                        content: content,
                        media: null, // See slack comms
                    },
                ]);

                if (response.error) {
                    console.error(response.error);
                } else {
                    setContent('');
                }
            }
        };
    }

    return (
        <div className="py-10">
            <RoverImage date='91' rover={selectedRover} onImageMetadataChange={handleMetadataChange} />
            <pre>{metadata}</pre>
        </div>
    );
};