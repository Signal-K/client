import Card from "./Card";
import AccountAvatar from "./AccountAvatar";
import React, { useContext, useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { UserContext } from "../context/UserContext";
import { ClimbingBoxLoader } from "react-spinners";

// type Profiles = Database['public']['Tables']['profiles']['Row'];

export default function PostFormCard ( { onPost } ) {
  const supabase = useSupabaseClient();
  const [content, setContent] = useState('');
  const session = useSession();
  const { profile } = useContext(UserContext);

  const [uploads, setUploads] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  //const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>(); 
  const [avatar_url, setAvatarUrl] = useState(null);

  function createPost () {
    supabase.from('posts').insert({
      author: session?.user?.id, // This is validated via RLS so users can't pretend to be other user
      content, // : content,
      media: uploads, // This should be changed to the user path `storage/userId/post/media...` like in the image gallery
      // File upload -> show an icon depending on what type of file.
    }).then(response => {
      if (!response.error) {
        alert(`Post ${content} created`);
        setContent('');
        setUploads([]);
        if ( onPost ) {
          onPost();
        }
      }
    });
  }

  useEffect(() => {
    supabase.from('profiles')
      .select(`avatar_url`)
      .eq('id', session?.user?.id)
      .then(result => {
        setAvatarUrl(result.data[0].avatar_url); //console.log(result.data[0].avatar_url)
      })
  }, []);

  async function addMedia ( e ) {
    const files = e.target.files;
    if (files.length > 0) {
      setIsUploading(true);
      for (const file of files) { // To-Do: List of user's photos from the image gallery in wb3-10
        const fileName = Date.now() + session?.user?.id + file.name; // Generate a random string to make the file unique
        const result = await supabase.storage
          .from('media') // Upload the file/media
          .upload(fileName, file);

        if (result.data) {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/media/' + result.data.path;
          setUploads(prevUploads => [...prevUploads, url]); // Add the most recently uploaded image to an array of images that are in state
        } else {
          console.log(result);
        }
      }
      setIsUploading(false);
    }
  }

  // https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/media/1675853386903cebdc7a2-d8af-45b3-b37f-80f328ff54d6image-asset.jpg
  // https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/media1675853386903cebdc7a2-d8af-45b3-b37f-80f328ff54d6image-asset.jpg

  return (
    <Card noPadding={false}>
      <div className="flex gap-2">
        <div>
          <AccountAvatar uid={session?.user?.id}
                url={avatar_url}
                size={60} />
        </div> { profile && (
          <textarea value={content} onChange={e => setContent(e.target.value)} className="grow p-3 h-14" placeholder={`What's on your mind, ${profile?.username}?`} /> )}
      </div>
      {isUploading && (
        <div><ClimbingBoxLoader /></div>
      )}
      {uploads.length > 0 && (
        <div className="flex gap-2 mt-4">
          {uploads.map(upload => (
            <div className=""><img src={upload} className='w-auto h-48 rounded-md' /></div>
          ))}
        </div>
      )}
      <div className="flex gap-5 items-center mt-2">
        <div>
          <label className="flex gap-1">
            <input type='file' className="hidden" onChange={addMedia} />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
            <span className="hidden md:block">Media</span>
          </label>
        </div>
        <div>
          <button className="flex gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span className="hidden md:block">People</span>
          </button>
        </div>
        <div>
          <button className="flex gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="hidden md:block">Checkin</span>
          </button>
        </div>
        <div>
          <button className="flex gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
            <span className="hidden md:block">Mood</span>
          </button>
        </div>
        <div className="grow text-right">
          <button onClick={createPost} className="bg-socialBlue text-white px-6 py-1 rounded-md">Share</button>
        </div>
      </div>
    </Card>
  );
}

export function PostFormCardPlanetTag ( { onPost } ) {
  const supabase = useSupabaseClient();
  const [content, setContent] = useState('');
  const session = useSession();
  const { profile } = useContext(UserContext);

  const [uploads, setUploads] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  //const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>(); 
  const [avatar_url, setAvatarUrl] = useState(null);

  function createPost () {
    supabase.from('posts').insert({
      author: session?.user?.id, // This is validated via RLS so users can't pretend to be other user
      content, // : content,
      media: uploads, // This should be changed to the user path `storage/userId/post/media...` like in the image gallery
      // File upload -> show an icon depending on what type of file.
    }).then(response => {
      if (!response.error) {
        alert(`Post ${content} created`);
        setContent('');
        setUploads([]);
        if ( onPost ) {
          onPost();
        }
      }
    });
  }

  useEffect(() => {
    supabase.from('profiles')
      .select(`avatar_url`)
      .eq('id', session?.user?.id)
      .then(result => {
        setAvatarUrl(result.data[0]?.avatar_url); //console.log(result.data[0].avatar_url)
      })
  }, []);

  async function addMedia ( e ) {
    const files = e.target.files;
    if (files.length > 0) {
      setIsUploading(true);
      for (const file of files) { // To-Do: List of user's photos from the image gallery in wb3-10
        const fileName = Date.now() + session?.user?.id + file.name; // Generate a random string to make the file unique
        const result = await supabase.storage
          .from('media') // Upload the file/media
          .upload(fileName, file);

        if (result.data) {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/media/' + result.data.path;
          setUploads(prevUploads => [...prevUploads, url]); // Add the most recently uploaded image to an array of images that are in state
        } else {
          console.log(result);
        }
      }
      setIsUploading(false);
    }
  }

  // https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/media/1675853386903cebdc7a2-d8af-45b3-b37f-80f328ff54d6image-asset.jpg
  // https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/media1675853386903cebdc7a2-d8af-45b3-b37f-80f328ff54d6image-asset.jpg

  return (
    <Card noPadding={false}>
      <div className="flex gap-2">
        <div>
          <AccountAvatar uid={session?.user?.id}
                url={avatar_url}
                size={60} />
        </div> { profile && (
          <textarea value={content} onChange={e => setContent(e.target.value)} className="grow p-3 h-14" placeholder={`What do you think about this planet candidate, ${profile?.username}?`} /> )}
      </div>
      {isUploading && (
        <div><ClimbingBoxLoader /></div>
      )}
      {uploads.length > 0 && (
        <div className="flex gap-2 mt-4">
          {uploads.map(upload => (
            <div className=""><img src={upload} className='w-auto h-48 rounded-md' /></div>
          ))}
        </div>
      )}
      <div className="flex gap-5 items-center mt-2">
        {/*<div>
          <label className="flex gap-1">
            <input type='file' className="hidden" onChange={addMedia} />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
            <span className="hidden md:block">Media</span>
          </label>
        </div>
        <div>
          <button className="flex gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span className="hidden md:block">People</span>
          </button>
        </div>
        <div>
          <button className="flex gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="hidden md:block">Checkin</span>
          </button>
        </div>
        <div>
          <button className="flex gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
            </svg>
            <span className="hidden md:block">Mood</span>
          </button>
        </div>*/}
        <div className="grow text-right">
          <button onClick={createPost} className="bg-socialBlue text-white px-6 py-1 rounded-md">Share</button>
        </div>
      </div>
    </Card>
  );
}

/*export function PlanetTagPostForm ( { onPost } ) {
  const supabase = useSupabaseClient();
  const [content, setContent] = useState('');
  const session = useSession();
  const { profile } = useContext(UserContext);

  const [uploads, setUploads] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  //const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>();

  const [planet, setPlanet] = useState('');
  
  return <div>Test</div>;
*/