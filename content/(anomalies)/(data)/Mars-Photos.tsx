import { useState, useEffect } from "react";
import axios from "axios";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import ClassificationForm from "@/components/Projects/(classifications)/PostForm";
import { MapPinIcon } from "@/components/Inventory/items/MineralDeposits";
import Spinner from "@/components/ui/Spinner";

export const RooverFromAppeears: React.FC = () => { 
    const supabase = useSupabaseClient(); 
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [rovers, setRovers] = useState<{ id: number; avatar_url: string; }[]>([]);
    const [roverConfig, setRoverConfig] = useState<any>(null);
    const [imagesCollected, setImagesCollected] = useState(false);
    const [isClassified, setIsClassified] = useState(false);
    const [mineralDeposits, setMineralDeposits] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const resourceList = ["11", "15", "16", "17", "19", "20"];

    const fetchMarsImages = async () => {
        setLoading(true); 
        const randomDate = Math.floor(Math.random() * 1000) + 1;
        const selectedRover = "perseverance";
        const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${selectedRover}/photos?sol=${randomDate}&api_key=iT0FQTZKpvadCGPzerqXdO5F4b62arNBOP0dtkXE`;
    
        try {
            const response = await axios.get(apiUrl);
            const photos = response.data.photos.map((photo: { img_src: string; }) => photo.img_src);
    
            if (photos.length > 0) {
                setRovers([{ id: Date.now(), avatar_url: photos[0] }]);
                setRoverConfig(response.data);
            } else {
                setRovers([{ id: Date.now(), avatar_url: "No images found" }]);
            };
        } catch (error) {
            console.error("Error fetching rover images from NASA:", error);
            setRovers([{ id: Date.now(), avatar_url: "An error occurred while fetching the images." }]);
        } finally {
            setLoading(false); 
        };
    };    

    useEffect(() => {
        fetchMarsImages();
    }, [supabase]);

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
                const anomalies = rovers.map((rover) => ({
                    id: rover.id,
                    content: `Rover image by ${session.user.id}`,
                    anomalytype: "roverImg",
                    avatar_url: rover.avatar_url,
                    configuration: roverConfig,
                    parentAnomaly: activePlanet.id ? Number(activePlanet.id) : null,
                    created_at: new Date(),
                }));
    
                const { data, error } = await supabase
                    .from("anomalies")
                    .insert(anomalies)
                    .select("id, avatar_url");
    
                if (error) {
                    console.error("Error inserting anomalies: ", error.message);
                    throw error;
                };
    
                setImagesCollected(true);
                alert("Images collected successfully!");
                setIsClassified(true);
    
                setRovers(data);
    
            } catch (error: any) {
                console.error("Error collecting images: ", error);
                alert("Failed to collect and classify the images from your rover.");
            };
        };
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
                };

                alert("Mining settlement established successfully!");
            } catch (error) {
                console.error("Error establishing mining settlement: ", error);
                alert("Failed to establish the mining settlement.");
            };
        };
    };

    return (
        <div className="grid grid-cols-3 gap-4">
            {loading ? (
                <Spinner />
            ) : (
                <>
                    {rovers.length > 0 ? (
                        rovers.map((rover) => (
                            <div key={rover.id} className="text-center col-span-3">
                                <div className="p-2 max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                                    <div className='relative h-64 w-full'>
                                        <img
                                            src={rover.avatar_url}
                                            alt={`Mars rover image`}
                                            className="relative z-10 w-full h-full object-contain"
                                        />
                                    </div>

                                    {!imagesCollected && (
                                        <button
                                            onClick={handleCollectAndClassify}
                                            className="col-span-3 mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-700"
                                        >
                                            Collect this image
                                        </button>
                                    )}

                                    {imagesCollected && (
                                        <ClassificationForm
                                            anomalyId={rover.id.toString()}
                                            anomalyType="roverImg"
                                            missionNumber={1370104}
                                            assetMentioned={rover.avatar_url}
                                            originatingStructure={rover.id}
                                        />
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center col-span-3">
                            {rovers[0]?.avatar_url}
                        </div>
                    )}
                    {isClassified && (
                        <div className="col-span-3 mt-4">
                            <h3 className="text-lg font-semibold text-center">
                                Mineral Deposits Found:
                            </h3>
                            <div className="flex justify-center items-center">
                                {mineralDeposits.map((deposit, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col items-center m-2 p-2 border-2 border-gray-300 rounded-lg"
                                    >
                                        <MapPinIcon className="h-6 w-6 text-blue-500 mb-2" />
                                        <span className="text-sm">{deposit}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleEstablishMiningSettlement}
                                className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-700"
                            >
                                Establish mining settlement
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export const RoverPhoto: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [rovers, setRovers] = useState<{ id: number; avatar_url: string }[]>([]);
    const [roverConfig, setRoverConfig] = useState<any>(null);
    const [imagesCollected, setImagesCollected] = useState(false);

    // Fetch Mars rover images from NASA API
    const fetchMarsImages = async () => {
        const randomDate = Math.floor(Math.random() * 1000) + 1;
        const selectedRover = "perseverance";
        const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${selectedRover}/photos?sol=${randomDate}&api_key=iT0FQTZKpvadCGPzerqXdO5F4b62arNBOP0dtkXE`;

        try {
            const response = await axios.get(apiUrl);
            const photos = response.data.photos.map((photo: { img_src: string }) => photo.img_src);

            if (photos.length > 0) {
                setRovers([{ id: Date.now(), avatar_url: photos[0] }]);
                setRoverConfig(response.data);
                saveImageFromRover(photos[0]);
            } else {
                setRovers([{ id: Date.now(), avatar_url: "No images found" }]);
            };
        } catch (error) {
            console.error("Error fetching rover images from NASA:", error);
            setRovers([{ id: Date.now(), avatar_url: "An error occurred while fetching the images." }]);
        };
    };

    // Save the image from the rover to the anomalies table
    const saveImageFromRover = async (avatar_url: string) => {
        if (session && activePlanet) {
            try {
                const anomaly = {
                    id: Date.now(),
                    content: `Rover image by ${session.user.id}`,
                    anomalytype: "roverImg",
                    avatar_url: avatar_url,
                    configuration: roverConfig,
                    parentAnomaly: activePlanet.id ? Number(activePlanet.id) || null : null,
                    created_at: new Date(),
                };

                const { data, error } = await supabase
                    .from("anomalies")
                    .insert([anomaly])
                    .select("id, avatar_url");

                if (error) {
                    console.error("Error inserting anomaly:", error.message);
                    throw error;
                };

                setImagesCollected(true);
                setRovers(data);
            } catch (error) {
                console.error("Error saving rover image:", error);
                alert("Failed to collect and classify the images from your rover.");
            };
        };
    };

    useEffect(() => {
        fetchMarsImages(); 
    }, [supabase]);

    return (
        <div className="">
            {rovers.length > 0 ? (
                rovers.map((rover) => (
                    <div key={rover.id} className="text-center col-span-2">
                        <div className="p-2 max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur bg-opacity-70">
                            <div className="relative h-64 w-full">
                                <img
                                    src={rover.avatar_url}
                                    alt={`Mars rover image`}
                                    className="relative z-10 w-full h-full object-contain"
                                />
                            </div>
                            {imagesCollected && (
                                <ClassificationForm
                                    anomalyId={rover.id.toString()}
                                    anomalyType="roverImg"
                                    missionNumber={13714101}
                                    assetMentioned={rover.avatar_url}
                                    originatingStructure={rover.id}
                                    structureItemId={3102}
                                />
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <></>
            )}
        </div>
    );
};