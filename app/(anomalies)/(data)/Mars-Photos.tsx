import { useState, useEffect } from "react";
import axios from "axios";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import ClassificationForm from "@/app/(create)/(classifications)/PostForm";
import { MapPinIcon } from "@/app/(inventory)/items/MineralDeposits";

export const RooverFromAppeears: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [rovers, setRovers] = useState<string[]>([]);
    const [roverConfig, setRoverConfig] = useState<any>(null);
    const [imagesCollected, setImagesCollected] = useState(false);
    const [isClassified, setIsClassified] = useState(false);
    const [mineralDeposits, setMineralDeposits] = useState<string[]>([]);

    const resourceList = ["Coal", "Iron", "Nickel", "Alloy", "Copper", "Chromium"];

    const fetchMarsImages = async () => {
        const randomDates = Array.from({ length: 3 }, () => Math.floor(Math.random() * 1000) + 1);
        const selectedRover = "perseverance";
        const apiUrl = (date: number) => `https://api.nasa.gov/mars-photos/api/v1/rovers/${selectedRover}/photos?sol=${date}&api_key=iT0FQTZKpvadCGPzerqXdO5F4b62arNBOP0dtkXE`;

        try {
            const responses = await Promise.all(randomDates.map(date => axios.get(apiUrl(date))));
            const photos = responses.flatMap(response => response.data.photos.map((photo: { img_src: string; }) => photo.img_src));
            
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

    useEffect(() => {
        const getRandomMineralDeposits = () => {
            const shuffled = [...resourceList].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, 3);
        };

        setMineralDeposits(getRandomMineralDeposits());
    }, [isClassified]);

    const handleCollectAndClassify = async () => {
        if (session && activePlanet) {
            try {
                const anomalies = rovers.map((rover, index) => ({
                    id: Date.now() + index,
                    content: `Rover image by ${session.user.id}`,
                    anomalytype: "roverImg",
                    avatar_url: rover,
                    configuration: roverConfig,
                    parentAnomaly: activePlanet.id ? Number(activePlanet.id) : null,
                    created_at: new Date(),
                }));

                const { data, error } = await supabase
                    .from("anomalies")
                    .insert(anomalies);

                if (error) {
                    console.error("Error inserting anomalies: ", error.message);
                    throw error;
                }

                setImagesCollected(true);
                alert("Images collected and classified successfully!");
                setIsClassified(true);
            } catch (error) {
                console.error("Error collecting images: ", error);
                alert("Failed to collect and classify the images from your rover.");
            }
        }
    };

    const handleEstablishMiningSettlement = async () => {
        if (session && activePlanet) {
            try {
                const deposits = mineralDeposits.map(deposit => ({
                    anomaly: activePlanet.id ? Number(activePlanet.id) : null,
                    owner: session.user.id,
                    mineralconfiguration: {
                        mineral: deposit,
                        quantity: Math.floor(Math.random() * 100) + 1,
                    },
                }));

                const { data, error } = await supabase
                    .from("mineralDeposits")
                    .insert(deposits);

                if (error) {
                    console.error("Error inserting mineral deposits: ", error.message);
                    throw error;
                }

                alert("Mining settlement established successfully!");
            } catch (error) {
                console.error("Error establishing mining settlement: ", error);
                alert("Failed to establish the mining settlement.");
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
            {isClassified && (
                <div className="col-span-3 mt-4">
                    <h3 className="text-lg font-medium">Resource Sites</h3>
                    <ul className="space-y-2">
                        {mineralDeposits.map((resource, index) => (
                            <li key={index}>
                                <div className="flex flex-col items-center">
                                    <MapPinIcon className="w-8 h-8 text-blue-500" />
                                    <div className="mt-2 text-sm font-medium">{`Site ${String.fromCharCode(65 + index)}`}</div>
                                    <div className="text-gray-600">{resource}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={handleEstablishMiningSettlement}
                        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-700"
                    >
                        Send Rovers to Establish Mining Settlement
                    </button>
                </div>
            )}
        </div>
    );
};

export default RooverFromAppeears;