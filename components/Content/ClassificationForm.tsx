import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";

export default function CreateBaseClassification() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [content, setContent] = useState("");
    const [avatar_url, setAvatarUrl] = useState(null);
    const [uploads, setUploads] = useState([])
    const { activePlanet } = useActivePlanet();
    
    const [isUploading, setIsUploading] = useState(false);

    async function createPost() {
        supabase
            .from("classifications")
            .insert({
                author: session?.user?.id,
                content,
                media: uploads,
                anomaly: activePlanet?.id,
                // sector: activePlanet?.id.randomSector...
            }).then(response => {
                if (!response.error) {
                    alert(`Post ${content} created`);
                    setContent('');
                };
            });
    };

    async function addMedia ( e: any ) {
        const files = e.target.files;
        if (files.length > 0 && session) {
            setIsUploading(true);
            for (const file of files) {
                const fileName = Date.now() + session.user.id + file.name; // Fit the anomaly context/post id in somewhere
                const result = await supabase.storage
                    .from("media")
                    .upload(fileName, file);

                if (result.data) {
                    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/media' + result.data.path;
                    setUploads(prevUploads => [...prevUploads, url]);
                } else {
                    console.log(result);
                };
            };
            setIsUploading(false);
        };
    };

    return (
        <></>
    );
};