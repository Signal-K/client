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

const RoverImagePage = () => {
    const randomDate = Math.floor(Math.random() * 1000);
    const selectedRover = 'perseverance';

    return (
        <div>
            <h1>Mars Rover Image</h1>
            <RoverImage date={randomDate} rover={selectedRover} />
        </div>
    );
};

export function RoverGallerySingle({ inventoryPlanetId }) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [roverImage, setRoverImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [metadata, setMetadata] = useState('');
    const [imageMetadata, setImageMetadata] = useState('');
    const [content, setContent] = useState('');

    const fetchImage = async () => {
        const randomDate = Math.floor(Math.random() * 1000) + 1;
        const selectedRover = 'perseverance'; // You can change this to 'curiosity' or 'opportunity' as needed
        const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${selectedRover}/photos?sol=${randomDate}&api_key=iT0FQTZKpvadCGPzerqXdO5F4b62arNBOP0dtkXE`;
    
        try {
            const response = await axios.get(apiUrl);
            if (response.data.photos && response.data.photos.length > 0) {
                const firstImage = response.data.photos[0].img_src;
                setRoverImage(firstImage);

                // Set metadata from the fetched image
                const metadataText = JSON.stringify(response.data.photos[0], null, 2);
                setImageMetadata(metadataText);
                setMetadata('Metadata for the current image:');
            } else {
                setRoverImage('No images found for the given date and rover.');
                setMetadata('No image available.');
                setImageMetadata('');
            } 
        } catch (error) {
            console.error(error);
            setRoverImage('An error occurred while fetching the image.');
            setMetadata('Error fetching the image.');
            setImageMetadata('');
        }
    
    setLoading(false); // Set loading to false when the image is loaded
    };

    const generateNewImage = () => {
        setLoading(true); 
        fetchImage();
    };
    
    useEffect(() => {
        fetchImage();
    }, []);

    const handlePostSubmit = async () => {
        if (content) {
          const user = session?.user?.id;
          if (user) {
            const response = await supabase.from('contentROVERIMAGES').upsert([
              {
                author: user,
                metadata: imageMetadata,
                imageLink: roverImage,
                planet: inventoryPlanetId,
                content,
                media: null,
              },
            ]);
    
            if (response.error) {
              console.error(response.error);
            } else {
              setContent('');
            }
          }
        }
    };

    return (
        <RoverImageCard roverImage={{ id: '1', content: '', image: roverImage, planets2: '' }} /> // Form components to be placed in
    )
}

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
    )
}