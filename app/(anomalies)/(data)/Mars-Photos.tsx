import { useState, useEffect } from "react";
import axios from "axios";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import ClassificationForm from "@/app/(create)/(classifications)/PostForm";

export const RooverFromAppeears: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [rovers, setRovers] = useState<string[]>([]);
    const [roverConfig, setRoverConfig] = useState<any>(null);
    const [imagesCollected, setImagesCollected] = useState(false); // New state to track if images are collected

    const fetchMarsImages = async () => {
        const randomDates = Array.from({ length: 3 }, () => Math.floor(Math.random() * 1000) + 1);
        const selectedRover = "perseverance";
        const apiUrl = (date: number) => `https://api.nasa.gov/mars-photos/api/v1/rovers/${selectedRover}/photos?sol=${date}&api_key=iT0FQTZKpvadCGPzerqXdO5F4b62arNBOP0dtkXE`;

        try {
            const responses = await Promise.all(randomDates.map(date => axios.get(apiUrl(date))));
            const photos = responses.flatMap(response => response.data.photos.map((photo: { img_src: string; }) => photo.img_src));
            
            // Log the responses to verify
            console.log("API Responses:", responses);
            
            // Use the config from the first response, if available
            const firstResponse = responses[0]?.data;
            if (firstResponse) {
                setRoverConfig(firstResponse);
            }

            const uniquePhotos = Array.from(new Set(photos));
            setRovers(uniquePhotos.slice(0, 3));
        } catch (error) {
            console.error("Error fetching rover images from NASA:", error);
            setRovers(["An error occurred while fetching the images."]);
        }
    };

    useEffect(() => {
        fetchMarsImages();
    }, []);

    const handleCollectAndClassify = async () => {
        if (session && activePlanet) {
            try {
                const anomalies = rovers.map((rover, index) => ({
                    id: Date.now() + index, // Use unique ID based on current timestamp and index
                    content: `Rover image by ${session.user.id}`,
                    anomalytype: "roverImg",
                    avatar_url: rover,
                    configuration: roverConfig, // Ensure this is correctly set
                    parentAnomaly: activePlanet.id ? Number(activePlanet.id) : null, // Ensure this is a valid bigint or null
                    created_at: new Date(),
                }));

                // Log anomalies data to check for issues
                console.log("Inserting anomalies data:", anomalies);

                const { data, error } = await supabase
                    .from("anomalies")
                    .insert(anomalies);

                if (error) {
                    console.error("Error inserting anomalies: ", error.message);
                    throw error;
                }

                setImagesCollected(true); // Set images collected to true

                alert("Images collected and classified successfully!");
            } catch (error) {
                console.error("Error collecting images: ", error);
                alert("Failed to collect and classify the images from your rover.");
            }
        }
    };

    return (
        <div className="grid grid-cols-3 gap-4">
            {rovers.length > 0 ? (
                rovers.map((rover, index) => (
                    <div key={index} className="text-center">
                        <img
                            src={rover}
                            alt={`Mars rover image ${index}`}
                            className="w-full h-auto rounded-md"
                        />
                    </div>
                ))
            ) : (
                <div className="text-center col-span-3">
                    {rovers[0]}
                </div>
            )}
            {rovers.length > 0 && !imagesCollected && (
                <button
                    onClick={handleCollectAndClassify}
                    className="col-span-3 mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-700"
                >
                    Collect these images
                </button>
            )}
            {imagesCollected && (
                <div className="mx-3 col-span-3">
                    <ClassificationForm
                        anomalyId={rovers[0]}
                        anomalyType="roverImg"
                        missionNumber={1370104}
                        assetMentioned={rovers[0]}
                    />
                </div>
            )}
        </div>
    );
};

export default RooverFromAppeears;