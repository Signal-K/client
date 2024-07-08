import { useState, useEffect } from "react";
import axios from "axios";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

export const RooverFromAppeears: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [rovers, setRovers] = useState<string[]>([]);
    const [roverConfig, setRoverConfig] = useState<any>(null);

    const fetchMarsImages = async () => {
        const randomDate = Math.floor(Math.random() * 1000) + 1;
        const selectedRover = "perseverance";
        const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${selectedRover}/photos?sol=${randomDate}&api_key=iT0FQTZKpvadCGPzerqXdO5F4b62arNBOP0dtkXE`;

        try {
            const response = await axios.get(apiUrl);
            if (response.data.photos && response.data.photos.length > 0) {
                setRovers([response.data.photos[0].img_src]);
                setRoverConfig(response.data);
            } else {
                setRovers(["No images found for the given date and rover."]);
            }
        } catch (error) {
            console.error("Error fetching rover images from NASA:", error);
            setRovers(["An error occurred while fetching the image."]);
        }
    };

    useEffect(() => {
        fetchMarsImages();
    }, []);

    const handleCollectImage = async (image: string) => {
        if (session && activePlanet) {
            try {
                const randomId = Math.floor(Math.random() * 1000000);
                const { data, error } = await supabase
                    .from("anomalies")
                    .insert({
                        id: randomId,
                        content: `Rover image by ${session.user.id}`,
                        anomalytype: "roverImg",
                        avatar_url: image,
                        configuration: roverConfig,
                        parentAnomaly: String(activePlanet.id),
                        created_at: new Date(),
                    });

                if (error) {
                    throw error;
                }

                alert("Image collected successfully!");
            } catch (error) {
                console.error("Error collecting image: ", error);
                alert("Failed to collect the image from your rover.");
            }
        }
    };

    return (
        <div className="grid grid-cols-3 gap-4">
            {rovers.map((rover, index) => (
                <div key={index} className="text-center">
                    <img
                        src={rover}
                        alt={`Mars rover image ${index}`}
                        className="w-full h-auto rounded-md"
                    />
                    <button
                        onClick={() => handleCollectImage(rover)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-700"
                    >
                        Collect this image
                    </button>
                </div>
            ))}
        </div>
    );
};

export default RooverFromAppeears;