import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import CoreLayout from "./Layout";
import UserOnboarding from "../onboarding/comments";
import Db from "../../pages/tests/db";
import { Database } from "../../utils/database.types";
import { url } from "inspector";
import AccountEditor from "./UpdateProfile";
import Login from "../../pages/login";

type Profiles = Database['public']['Tables']['profiles']['Row'];

export default function IndexAuth() {
    const session = useSession();
    const supabase = useSupabaseClient();
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>(null);
    const [showProfile, setShowProfile] = useState(false);

    // add an iframe/ref to super.so dashboard

    async function logoutUser () { 
      const { error } = await supabase.auth.signOut() 
    }

    const [profile, setProfile] = useState(null);
    const [username, setUsername] = useState<Profiles['username']>(null);

    async function getProfile () {
      try {
        setLoading(true);
        if (!session?.user) throw new Error('No user authenticated');
        let { data, error, status } = await supabase
            .from('profiles')
            .select(`username, website, avatar_url, address, address2`)
            .eq('id', session?.user?.id)
            .single()

        if (error && status !== 406) {
            throw error; 
        }

        if (data) {
            setUsername(data.username);
            setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
          //alert('Error loading your user data');
          console.log(error);
      } finally {
          setLoading(false);
      }
    }

    function fetchUser() {
      supabase.from('profiles')
        .select()
        .eq('id', session?.user?.id)
        .then(result => {
          if (result.error) {
            throw result.error;
          }
          if (result.data) {
            setProfile(result.data[0]);
          }
        });
    }

    function saveProfile () {
      supabase.from('profiles')
        .update({
          username,
          avatar_url,
        })
        .eq('id', session?.user?.id)
        .then(result => {
          if (!result.error) {
            setProfile(prev => ({ ...prev, username }));
          }
          setEditMode(false);
        })
    }

    async function updateProfile({
      username,
      avatar_url,
    }: {
      username: Profiles['username']
      avatar_url: Profiles['avatar_url']
    }) {
      try {
        setEditMode(true);
        if (!session?.user) throw new Error('No user authenticated');
        const updates = {
          id: session?.user?.id,
          username,
          avatar_url,
          updated_at: new Date().toISOString,
        }
        let { error } = await supabase.from('profiles').upsert(updates)
        if ( error ) throw error;
        alert('Profile updated')
      } catch ( error ) {
        console.log(error)
      } finally {
        setEditMode(false);
      }
    }

    const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async ( event ) => {
      try {
        setIsUploading(true);
        if (!event.target.files || event.target.files.length === 0) {
          throw new Error('You must select an image to upload');
        };

        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${session?.user?.id}.${fileExt}`;
        const filePath = `${fileName}`; // Preserving user's old avatars -> how?
        let { error: uploadError } = await supabase.storage
          .from('avatars')
            .upload(filePath, file, { upsert: true })
            if (uploadError) {
              throw uploadError;
          };
      } catch (error) {
        alert('Error uploading avatar, check console');
        console.log(error);
      } finally {
        setIsUploading(false);
      }
    }

    useEffect(() => {
      fetchUser();
      console.log(profile);
      console.log(profile?.full_name)
    }, [session?.user?.id])

    return (
        <>
              {/* <button className="bg-white rounded-full p-4" onClick={() => setShowProfile(true)}>
                <div className="relative w-10 h-10">
                  <div className="absolute top-0 left-0 w-10 h-2 bg-gray-400 rounded-full"></div>
                  <div className="absolute top-4 left-0 w-2 h-4 bg-gray-400 rounded-full"></div>
                  <div className="absolute top-4 right-0 w-2 h-4 bg-gray-400 rounded-full"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-2 bg-gray-400 rounded-full"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-2 bg-gray-400 rounded-full"></div>
                  <div className="absolute top-2 left-2 w-6 h-6 bg-blue-400 rounded-full"></div>
                </div>
              </button>

              {session?.user?.id && showProfile == true && ( */}
                
                <center>
                                    <h1 className="">Your profile</h1><div className="align-content: center">
                  
<br />
<AccountEditor session={session} /><br />

                  <p>Username: {profile?.username}</p><br />
                  <button onClick={() => {setEditMode(true)}}>Edit Profile</button><br />
                    <div><br />
                      <input
                        id='username'
                        type='text'
                        className="border py-2 px-3 rounded-md mt-1"
                        placeholder={profile?.username}
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                      />
                      <button onClick={() => updateProfile({ username, avatar_url })} className="inline-flex mx-1 gap-1 bg-white rounded-md shadow-sm shadow-gray-500 py-1 px-2">
                        Save profile
                      </button>
                    </div>
                  {/* )} */}
                </div></center>
                {/* <UserOnboarding />          */}
                {/* <script data-name="BMC-Widget" data-cfasync="false" src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js" data-id="starsailors" data-description="Support me on Buy me a coffee!" data-message="I hope you enjoyed using Star Sailors. Please consider contributing so I can get extra features out faster." data-color="#5F7FFF" data-position="Right" data-x_margin="18" data-y_margin="18"></script> */}
        </>)
}