import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function PostFormCardAnomalyTag({ onPost, planetId }) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [content, setContent] = useState('');
    const profile = session?.user?.id;
    const [avatar_url, setAvatarUrl] = useState(null);
    /* const [uploads, setUploads] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [userExperience, setUserExperience] = useState();
    const [hasRequiredItem, setHasRequiredItem] = useState(false); */

    const router = useRouter();
    const anomalytId = router.query.id;

    // Check if user has items to make post -> not required functionality yet

    // Create the publication
    async function createPost() {
        // Will add an identifier to determine the number of posts mentioning the planet, as that will affect the classification rating

        supabase
            .from("classifications")
            .insert({
                author: profile,
                content,
                // media: uploads
                // planets2: planetId,   
                anomaly: planetId, // Set this to multiple anomaly types/foreign key options            
            }).then(response => {
                if (!response.error) {
                  alert(`Post ${content} created`);
                  setContent('');
                //   setUploads([]);
                  if ( onPost ) {
                    onPost();
                  }
                }
            });
            
            // .then (update user experience/currency)
    }

    /* Get user avatar & other data
    useEffect(() => {
        supabase
            .from('profiles')
            .select(`avatatar_url`)
            .eq("id", profile)
            .then((result) => {
                setAvatarUrl(result?.data[0]?.avatatar_url);
            });
    }, [session]); */

    // Function to add media to the publication

    // Frontend output
    return (
        <>
            <div className="flex gap-2 mx-5 mt-5">
                {/* <div>
                    <img src={avatar_url} width='60px' height='60px' />
                </div> */}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="grow p-3 h-24 rounded-xl"
                    placeholder={`What do you think about this planet candidate, ${profile}?`}
                />
                <div className="text-center">
                    <button onClick={createPost} className="text-black px-2 py-1 rounded-md">Share</button>
                </div>
            </div>
        </>
    )
}

export function PostFormCardAnomalyTagOldSchema({ onPost, planetId }) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [content, setContent] = useState('');
    const profile = session?.user?.id;
    const [avatar_url, setAvatarUrl] = useState(null);
    /* const [uploads, setUploads] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [userExperience, setUserExperience] = useState();
    const [hasRequiredItem, setHasRequiredItem] = useState(false); */

    const router = useRouter();
    const anomalytId = router.query.id;

    // Check if user has items to make post -> not required functionality yet

    // Create the publication
    async function createPost() {
        // Will add an identifier to determine the number of posts mentioning the planet, as that will affect the classification rating

        supabase
            .from("posts_duplicates")
            .insert({
                author: profile,
                content,
                // media: uploads
                // planets2: planetId,   
                anomaly: planetId, // Set this to multiple anomaly types/foreign key options            
            }).then(response => {
                if (!response.error) {
                  alert(`Post ${content} created`);
                  setContent('');
                //   setUploads([]);
                  if ( onPost ) {
                    onPost();
                  }
                }
            });
            
            // .then (update user experience/currency)
    }

    /* Get user avatar & other data
    useEffect(() => {
        supabase
            .from('profiles')
            .select(`avatatar_url`)
            .eq("id", profile)
            .then((result) => {
                setAvatarUrl(result?.data[0]?.avatatar_url);
            });
    }, [session]); */

    // Function to add media to the publication

    // Frontend output
    return (
        <>
            <div className="flex gap-2 mx-5 mt-5">
                {/* <div>
                    <img src={avatar_url} width='60px' height='60px' />
                </div> */}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="grow p-3 h-24 rounded-xl"
                    placeholder={`What do you think about this planet candidate, ${profile}?`}
                />
                <div className="text-center">
                    <button onClick={createPost} className="text-black px-2 py-1 rounded-md">Share</button>
                </div>
            </div>
        </>
    )
}