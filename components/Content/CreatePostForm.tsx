import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "../ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../ui/Form";
import { Textarea } from "../ui/TextArea";
import { useToast } from "../ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { VenetianMask } from "lucide-react";
import React, { useContext, useEffect, useState} from "react";
import { useForm } from "react-hook-form";
import { UserContext } from "../../context/UserContext";
import { useRouter } from "next/router";
import { Avatar, AvatarFallback } from "../ui/Avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

type TProps = {
    category_id: "1" | "2",
    openCreateMenu: boolean;
    setOpenCreateMenu: (value: React.SetStateAction<boolean>) => void;
    setCreatedPost: (value: React.SetStateAction<boolean>) => void;
};

export default function CreatePostForm ( { planetId2 } ) { // category_id
    const supabase = useSupabaseClient();
    const session = useSession();

    const [postContent, setPostContent] = useState('')
    const profile = useContext(UserContext);
    const [username, setUsername] = useState('');

    const [uploads, SetUploads] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [avatar_url, setAvatarUrl] = useState(null);
    const [userExperience, setUserExperience] = useState();
    // const [hasRequiredItem, setHasRequiredItem] = useState(false);

    function createPost() {
        supabase
            .from('posts_duplicates')
            .insert({
                author: session?.user?.id,
                content: postContent,
                media: uploads,
                planets2: planetId2,
            }).then(async response => {
                if (!response.error) {
                    await supabase.from('inventoryPLANETS').insert([
                        {
                            planet_id: planetId2,
                            owner_id: session?.user?.id,
                        },
                    ]);

                    setPostContent('');
                }
            })
    };

    useEffect(() => {
        supabase
            .from('profiles')
            .select(`avatar_url, experience, username`)
            .eq('id', session?.user?.id)
            .then(result => {
                setAvatarUrl(result?.data[0]?.avatar_url);
                setUsername(result?.data[0]?.username);
            });
    }, [session]);

    // async function addMedia ( e ) {
    //     const files = e.target.files;
    //     if (files.length > 0) {
    //       setIsUploading(true);
    //       for (const file of files) { // To-Do: List of user's photos from the image gallery in wb3-10
    //         const fileName = Date.now() + session?.user?.id + file.name; // Generate a random string to make the file unique
    //         const result = await supabase.storage
    //           .from('media') // Upload the file/media
    //           .upload(fileName, file);
    
    //         if (result.data) {
    //           const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/media/' + result.data.path;
    //           SetUploads(prevUploads => [...prevUploads, url]); // Add the most recently uploaded image to an array of images that are in state
    //         } else {
    //           console.log(result);
    //         }
    //       }
    //       setIsUploading(false);
    //     }
    // }

    const form = useForm({
        defaultValues: {
            content: "",
        },
    });

    return (
        <>
        <div className="flex gap-2">
                        <Avatar>
                            {/* <AvatarImage src={"https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/avatars/" + avatar_url ?? ""}> */}
                                <AvatarFallback>{username}</AvatarFallback>
                            {/* </AvatarImage> */}
                        </Avatar>
                    </div>
                    {/* <CardContent className="p-0 pt-2">
                        <Form {...form}>
                            
                        </Form>
                    </CardContent> */}
                    <textarea value={postContent} onChange={e => setPostContent(e.target.value)} className="grow p-3 h-24 rounded-xl" placeholder={"What do you think about this candidate"} />
                    {/* {uploads.length > 0 && (
                        <div className="flex gap-2 mt-4">
                            {uploads.map(upload => (
                                <div className=""><img src={upload} className="w-auto h-48 rounded-md" />
                            ))}
                        </div>
                    )} */}
            {/* <div className={`fixed inset-0 bg-white/80 backdrop-blur-md z-20 items-center justify-center`}> */}
                {/* <Card> */}
                {/* </Card> */}
            {/* </div> */}
        </>
    )
}

// Look into methods to engage resource gathering with the lightcurves, make it a scrollable feed with planet content, show how the curves lead into the rover. 

export function RoverContentPostForm( { metadata, imageLink, sector } ) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [postContent, setPostContent] = useState('');
    const [media, setMedia] = useState([]);

    function createRoverClassification() {
        supabase
            .from('contentROVERIMAGES')
            .insert({
                author: session?.user?.id,
                metadata: metadata,
                imageLink: imageLink,
                content: postContent,
                media: media,
                sector: sector,
            },);
    };

    const handlePostSubmit = async () => {
        if (postContent) {
            const user = session?.user?.id;
            if (user) {
                const response = await supabase.from('contentROVERIMAGES').upsert([
                    {
                        author: user,
                        metadata: metadata,
                        imageLink: imageLink,
                        // planet: '1', // Change this when upserting in planets/[id].tsx
                        // basePlanet: '1',
                        content: postContent,
                        media: null, // See slack comms
                        sector: sector,
                    },
                ]);

                if (response.error) {
                    console.error(response.error);
                } else {
                    setPostContent('');
                }
            }
        };
    }

    return (
        <div className="flex gap-2">
            {/* <Avatar>
                <AvatarFallback>{session?.user?.id}</AvatarFallback>
            </Avatar> */}
            <textarea value={postContent} onChange={e => setPostContent(e.target.value)} className="grow p-3 h-24 rounded-xl" placeholder={"What do you think about this image"} />
            <div className="text-center">
                <button onClick={handlePostSubmit} className="text-black px-2 py-1 rounded-md">Share</button>
            </div>
        </div>
    );
};

export function FactionPostForm( { factionId, planetId } ) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [postContent, setPostContent] = useState('');
    const [media, setMedia] = useState([]);

    function createFactionPost() {
        supabase
            .from('posts_duplicates')
            .insert({
                author: session?.user?.id,
                content: postContent,
                media: media,
                anomaly: planetId,
                faction: factionId,
            },
        );
    };

    const handlePostSubmit = async () => {
        if (postContent && session) {
            const user = session?.user?.id;
            if (user) {
                const response = await supabase.from('posts_duplicates').upsert([
                    {
                        author: user,
                        content: postContent,
                        media: media,
                        anomaly: planetId,
                        faction: factionId,
                    },
                ]);

                if (response.error) {
                    console.error(response.error);
                } else {
                    setPostContent('');
                };
            };
        };
    };

    return (
        <div className="flex gap-2">
        <textarea value={postContent} onChange={e => setPostContent(e.target.value)} className="grow p-3 h-24 rounded-xl" placeholder={"What do you think about this image"} />
        <div className="text-center">
            <button onClick={handlePostSubmit} className="text-black px-2 py-1 rounded-md">Share</button>
        </div>
    </div>
    );
};