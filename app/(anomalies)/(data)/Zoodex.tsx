import React, { useEffect, useState } from "react";
import ClassificationForm from "@/app/(create)/(classifications)/PostForm";

interface ZoodexProps {
    anomalyType: string;
    anomalyId: string;
    missionNumber: number;
    assetMentioned: string;
}

const Zoodex: React.FC<ZoodexProps> = ({ anomalyType, anomalyId, missionNumber, assetMentioned }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch or load any data needed for Zoodex if required
        // Update isLoading and error state based on your logic
        setIsLoading(false); // Example: once data is loaded
    }, []);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Zoodex Classification</h2>
            <ClassificationForm
                anomalyType="animalBurrowingOwl"
                anomalyId={anomalyId}
                missionNumber={missionNumber}
                assetMentioned={assetMentioned}
            />
        </div>
    );
};

export default Zoodex;