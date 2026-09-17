import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "../../_Core/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../_Core/ui/Card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "../../_Core/ui/Form";
import { Textarea } from "../../_Core/ui/TextArea";
import { useToast } from "../../_Core/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { VenetianMask } from "lucide-react";
import React, { useContext, useEffect, useState} from "react";
import { useForm } from "react-hook-form";
import { UserContext } from "../../../context/UserContext";
import { useRouter } from "next/router";
import { Avatar, AvatarFallback } from "../../_Core/ui/Avatar";
import { AvatarImage } from "@radix-ui/react-avatar";

// -----------
import PostFormCardAnomalyTag from "./AnomalyPostFormCard"; // This is important -> this file is for post creation not specifically for (referencing components on top of anomalies instead) classifications. Anomaly is for posts as classifications
import { ClimbingBoxLoader } from "react-spinners";
// -----------

type TProps = {
    category_id: "1" | "2",
    openCreateMenu: boolean;
    setOpenCreateMenu: (value: React.SetStateAction<boolean>) => void;
    setCreatedPost: (value: React.SetStateAction<boolean>) => void;
};

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