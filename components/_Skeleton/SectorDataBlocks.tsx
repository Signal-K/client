import { useEffect, useState } from "react";
import { RoverContentPostForm } from "../Content/Classify/CreatePostForm"
import axios from "axios";

export const SectorRoverImageClassificationBlock = () => {
    const [imageUrl, setImageUrl] = useState('');
    const apiKey = 'iT0FQTZKpvadCGPzerqXdO5F4b62arNBOP0dtkXE';

    const [imageMetadata, setImageMetadata] = useState('');
    const [metadata, setMetadata] = useState('');
    const date = Math.floor(Math.random() * 200) + 1; // Generate a random date here
    const rover = 'perseverance';

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
    }, [apiKey]);

    return (
        <><RoverContentPostForm  metadata={metadata} imageLink={imageUrl} sector="18" /><img src={imageUrl} className="h-[20%]" /></>
    );
};