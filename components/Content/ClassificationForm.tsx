import React, { useEffect, useState } from "react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useProfileContext } from "@/context/UserProfile";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export default function CreateBaseClassification(assetMentioned: any) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [content, setContent] = useState("");
    const [uploads, setUploads] = useState<string[]>([]);
    const { activePlanet } = useActivePlanet();
    const { userProfile } = useProfileContext(); 
    
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        console.log("Don't you feel", userProfile);
    }, [session])

    async function createPost() {
        supabase
            .from("classifications")
            .insert({
                author: session?.user?.id,
                content,
                media: uploads,
                // asset: assetMentioned,
                anomaly: activePlanet?.id,
                // sector: activePlanet?.id.randomSector... ; possibly include the structure so we know where it came from (or maybe classification type?)
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
        <div style={{ width: '83%', margin: 'auto' }} className="">
            <div className="flex gap-2 mx-5 mt-5 pb-3">
                <div>
                    <img src={userProfile?.avatar_url} width='60px' height='60px' />
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="grow p-3 h-24 rounded-xl bg-gray-100"
                    placeholder={`What do you think about this planet candidate, ${userProfile?.username}?`}
                />
                {isUploading && (
                    // <div><ClimbingBoxLoader /></div>
                    <p>Uploading...</p>
                )}
                {isUploading && (
                    <div className="flex gap-2 mt-4">
                        {uploads.map(upload => (
                            <div className=""><img src={upload} className="w-auto h-48 rounded-md" /></div>
                        ))}
                    </div>
                )}
                <div className="text-center">
                    <label className="flex gap-1">
                        <input type="file" className="hidden" onChange={addMedia} />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                            </svg>
                            <span className="hidden md:block">Media</span>
                        </label>
                    <button onClick={createPost} className="text-black px-2 py-1 rounded-md">Share</button>
                </div>
            </div>
        </div>
    );
};