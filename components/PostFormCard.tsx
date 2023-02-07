import Card from "./Card";
import AccountAvatar from "./AccountAvatar";
import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "../utils/database.types";

type Profiles = Database['public']['Tables']['profiles']['Row'];

export default function PostFormCard ( { onPost } ) {
  const [profile, setProfile] = useState(null);
  const supabase = useSupabaseClient();
  const [content, setContent] = useState('');
  const session = useSession();
  
  const [loading, setLoading] = useState(false);
  const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>();

  useEffect(() => {
    supabase.from('profiles') // Fetch profile from user id matching session
      .select()
      .eq('id', session.user.id)
      .then(result => {
        setProfile(result.data[0]);
      });
  }, []);

  function createPost () {
    supabase.from('posts').insert({
      author: session.user.id, // This is validated via RLS so users can't pretend to be other user
      content, // : content,
    }).then(response => {
      if (!response.error) {
        alert(`Post ${content} created`);
        setContent('');
        if ( onPost ) {
          onPost();
        }
      }
    });
  }

  useEffect(() => {
    supabase.from('profiles')
      .select(`avatar_url`)
      .eq('id', session.user.id)
      .then(result => {
        setAvatarUrl(result.data[0].avatar_url) //console.log(result.data[0].avatar_url)
      })
  }, []);

  async function getProfile() {
    try {
        setLoading(true);
        let { data, error, status } = await supabase
            .from('profiles')
            .select(`username, website, avatar_url, address`)
            .eq('id', session.user.id)
            .single()

        if (error && status !== 406) {
            throw error;
        }

        if (data) {
            console.log('Received')
            setAvatarUrl(data.avatar_url);
        }
    } catch (error) {
        console.log(error);
    } finally {
        setLoading(false);
    }
  }

  return (
    <Card noPadding={false}>
      <div className="flex gap-2">
        <div>
          <AccountAvatar uid={session.user!.id}
                url={avatar_url}
                size={60}/>
        </div> { profile && (
          <textarea value={content} onChange={e => setContent(e.target.value)} className="grow p-3 h-14" placeholder={`What's on your mind, ${profile?.username}?`} /> )}
      </div>
      <div className="flex gap-5 items-center mt-2">
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
            <span className="hidden md:block">Check in</span>
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