import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ClimbingBoxLoader } from "react-spinners";

export default function PostFormCardAnomalyTag({ onPost, planetId }) {
    const supabase = useSupabaseClient();
    const session = useSession();
 
    const [content, setContent] = useState('');
    const profile = session?.user?.id;
    const [avatar_url, setAvatarUrl] = useState(null);
    const [uploads, setUploads] = useState<string[]>([]); // Define the type as an array of strings

    // Function to add media to the publication
    async function addMedia(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files ?? []);
        if (files.length > 0) {
            setIsUploading(true);
            for (const file of files) {
                const fileName = Date.now() + (session?.user?.id ?? '') + file.name; // Handle the possibility of session.user.id being undefined
                const result = await supabase.storage
                    .from('media')
                    .upload(fileName, file);
                
                if (result.data) {
                    const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/media/' + result.data.path;
                    setUploads(prevUploads => [...prevUploads, url]);
                } else {
                    console.log(result);
                }
            }
            setIsUploading(false);
        };
    };

    const [isUploading, setIsUploading] = useState(false);
    /* const [userExperience, setUserExperience] = useState();
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
                media: uploads,
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
        <div style={{ width: '83%', margin: 'auto' }} className="">
            <div className="flex gap-2 mx-5 mt-5 pb-3">
                {/* <div>
                    <img src={avatar_url} width='60px' height='60px' />
                </div> */}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="grow p-3 h-24 rounded-xl bg-gray-100"
                    placeholder={`What do you think about this planet candidate, ${profile}?`}
                />
                {isUploading && (
                    <div><ClimbingBoxLoader /></div>
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