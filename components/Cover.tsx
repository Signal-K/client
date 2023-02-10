import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { ClimbingBoxLoader } from "react-spinners";

export default function UserCoverImage ( { url, editable, onChange } ) {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [isUploading, setIsUploading] = useState(false);

    async function updateCover (e) {
        const file = e.target.files?.[0];
        if (file) {
            setIsUploading(true);
            const fileName = session?.user?.id + '_cover_' + Date.now(); // Could also include the original file name somewhere...
            const { data, error } = await supabase.storage
                .from('covers')
                .upload(fileName, file)//.then()

            if (error) throw error;
            if (data) {
                const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/covers/' + data.path;
                supabase.from('profiles')
                    .update({
                        cover: url,
                    })
                    .eq('id', session?.user?.id)
                    .then(({data, error}) => {
                        if (error) throw error;
                        if (data && onChange) { onChange(); };
                    })
                setIsUploading(false);
            }
        }
    }

    return (
        <div className="h-60 overflow-hidden flex justify-center items-center relative">
            <div><img src={url} alt="User's cover image"/></div>
            {isUploading && (
                <div className="absolute inset-0 bg-white bg-opacity-80% flex items-center z-10"><div className="inline-block mx-auto"><ClimbingBoxLoader /></div></div>
            )}
            {editable && (
                <div className="items-center cursor-pointer absolute right-0 bottom-0 m-2"><label className="flex items-center gap-2 bg-white py-1 px-2 rounded-md shadow-md shadow-black cursor-pointer">
                    <input type='file' onChange={updateCover} className='hidden' />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>Change cover image</label>
                </div>
            )}
        </div>
    );
}