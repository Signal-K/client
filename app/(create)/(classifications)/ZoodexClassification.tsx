import React, { useEffect, useState } from "react";
import ClassificationForm from "@/app/(create)/(classifications)/PostForm";

interface AnimalClassificationProps {
    anomalyType: string;
    anomalyId: string;
    missionNumber: number;
    assetMentioned: string;
}

const AnimalClassification: React.FC<AnimalClassificationProps> = ({ anomalyType, anomalyId, missionNumber, assetMentioned }) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch or load any data needed for AnimalClassification if required
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
            <h2>Animal Classification</h2>
            <ClassificationForm
                anomalyType={anomalyType}
                anomalyId={anomalyId}
                missionNumber={missionNumber}
                assetMentioned={assetMentioned}
            />
        </div>
    );
};

export default AnimalClassification;