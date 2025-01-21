import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostAvatar } from "@/components/Account/Avatar";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

import SimplePlanetGenerator from "@/components/Data/Generator/Astronomers/PlanetHunters/SimplePlanetGenerator";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface PickPlanetCardProps {
    title: string;
    id: string;
    author: string;
    content: string;
    anomalyTitle: string;
    images: string[];
    classificationConfiguration?: any;
};

export default function PickPlanetCard({
    id,
    title,
    author,
    content,
    anomalyTitle,
    images,
    classificationConfiguration
}: PickPlanetCardProps) {
    const supabase = useSupabaseClient();

    const [full_name, setFullName] = useState<string | null>('');
    const [username, setUsername] = useState<string | null>('');

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!supabase) {
            return;
        };

        async function fetchAvatar() {
            setLoading(true);
            const { data, error } = await supabase
                .from("profiles")
                .select("full_name, username")
                .eq("id", author)
                .single();

            if (data) {
                setUsername(data.username);
                setFullName(data.full_name);
            };

            if (error) {
                console.error(error);
            };
            
            setLoading(false);
        };
        
        fetchAvatar();
    }, [supabase]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const goToNextImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const goToPreviousImage = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    if (loading) {
        return (
            <div className="mt-2">
                Loading...
            </div>
        );
    };

    return (
        <div className="flex items-center justify-center">
            <Card className="w-full max-w-lg bg-white/30 backdrop-blur-md border border-white/10 shadow-lg rounded-lg relative">
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        {/* <PostAvatar author={author} />
                        <div>
                            <CardTitle>{content}</CardTitle>
                            <p className="text-sm text-muted-foreground">discovered by {username || author}</p>
                        </div> */}
                        <SimplePlanetGenerator
                            classificationId={id}
                            classificationConfig={classificationConfiguration}
                            author={author}
                        />
                    </div>
                </CardHeader>
            </Card>
        </div>
    );
};