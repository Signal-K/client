import React, { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import ClassificationForm from "@/app/(create)/(classifications)/PostForm";

interface ZoodexProps {
    anomalyType: string;
    anomalyId: string;
    missionNumber: number;
    assetMentioned: string;
}

const Zoodex: React.FC<ZoodexProps> = ({ anomalyType, anomalyId, missionNumber, assetMentioned }) => {
    const supabase = useSupabaseClient();

    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRandomImage = async () => {
            try {
                // List files in the 'burrowingOwl' folder
                const { data: files, error: listError } = await supabase
                    .storage
                    .from('zoodex')
                    .list('burrowingOwl', { limit: 100 });

                if (listError) {
                    throw new Error(listError.message);
                }

                if (files && files.length > 0) {
                    // Select a random file
                    const randomFile = files[Math.floor(Math.random() * files.length)];
                    const { data: urlData } = supabase
                        .storage
                        .from('zoodex')
                        .getPublicUrl(`burrowingOwl/${randomFile.name}`);

                    setImageUrl(urlData.publicUrl);
                } else {
                    setError('No images found.');
                }
            } catch (error: any) {
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRandomImage();
    }, [supabase]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Zoodex Classification</h2>
            {imageUrl ? (
                <div>
                    <img src={imageUrl} alt="Random Zoodex" style={{ maxWidth: '100%', height: 'auto' }} />
                    <ClassificationForm
                        anomalyType={anomalyType}
                        anomalyId={anomalyId}
                        missionNumber={missionNumber}
                        assetMentioned={assetMentioned}
                    />
                </div>
            ) : (
                <p>No image available</p>
            )}
        </div>
    );
};

export default Zoodex;