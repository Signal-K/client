import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import CoreLayout from "../components/Core/Layout";
import UserOnboarding from "../components/onboarding";
import { SocialGraphHomeModal, SocialGraphHomeNoSidebar } from "./posts";
import Db from "./tests/db";
import { Database } from "../utils/database.types";
import AccountAvatar, { AccountAvatarV1, AccountAvatarV2 } from "../components/AccountAvatar";
import { url } from "inspector";
import AccountEditor from "../components/Core/UpdateProfile";
import DbHeader from "../components/Backend/Header";

type Profiles = Database['public']['Tables']['profiles']['Row'];

export default function Home() {
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
            <CoreLayout>
              {/* <DbHeader /> */}
            <button className="bg-white rounded-full p-4" onClick={() => setShowProfile(true)}>
  <div className="relative w-10 h-10">
    <div className="absolute top-0 left-0 w-10 h-2 bg-gray-400 rounded-full"></div>
    <div className="absolute top-4 left-0 w-2 h-4 bg-gray-400 rounded-full"></div>
    <div className="absolute top-4 right-0 w-2 h-4 bg-gray-400 rounded-full"></div>
    <div className="absolute bottom-0 left-0 w-4 h-2 bg-gray-400 rounded-full"></div>
    <div className="absolute bottom-0 right-0 w-4 h-2 bg-gray-400 rounded-full"></div>
    <div className="absolute top-2 left-2 w-6 h-6 bg-blue-400 rounded-full"></div>
  </div>
</button>

              {session?.user?.id && showProfile == true && (
                
                <center>
                                    <h1 className="">Your profile</h1><div className="align-content: center">
                  
<br />
<AccountEditor session={session} />

                  <p>Username: {profile?.username}</p>
                  <button onClick={() => {setEditMode(true)}}>Edit Profile</button>
                  {/* {editMode && ( */}
                    <div>
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
              )}
            {/* <button onClick={logoutUser}>Logout</button> */}
            <Db />
    {/*<div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center mb-8">
        <img src="https://via.placeholder.com/150" alt="Profile" className="rounded-full h-24 w-24 mr-4" />
        <div>
          <h1 className="text-2xl font-bold">John Doe</h1>
          <p className="text-lg text-gray-500">johndoe@example.com</p>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">Address</h2>
        <p className="text-lg">123 Main St.</p>
        <p className="text-lg">Anytown, USA 12345</p>
      </div>
    </div>*/}
      {/* <h1 className="text-4xl font-bold mb-8">Welcome to Star Sailors!</h1>
      <p className="text-lg mb-4">
      Our game offers a truly unique and engaging experience that combines the excitement of gaming with the pursuit of scientific knowledge. By playing our game, you can actively contribute to real-world scientific research projects by collecting and classifying objects based on actual data. We are currently focused on our planets mini-game, where you can help identify potential new planets that have been discovered by the TESS telescope. To begin, simply log in to the Star Sailors website and navigate to the planets page, where you'll be presented with various objects to classify along with relevant information to assist you in making informed decisions. Once you've made your decision, you can create a post about it and invite other users to vote on your assessment. As you participate, you'll earn points that can be redeemed for rewards and recognition within the Star Sailors community. Join us today and embark on a thrilling journey of discovery and learning!
      </p> */}
       {/*<p className="text-lg mb-4">
      Keep an eye on planets that have a light curve with consistent dips, and a temperature that appears consistent with the dips (for example, the larger the dips appear, the higher the temperature (measured in Kelvin) should be. )
      </p> Once radius comes in, discuss dips in relation to proposed radius & temperature. These two params would be determined by the user in the next build. Line 43 is just demo content for the current build and the explanation regarding dips and temperatures is obviously incorrect -> however this build is about having something to identify and measure */}
      {/* <br /><br />
    <h2 className="text-2xl font-bold mb-8">How to play</h2>
    <p className="text-lg mb-4">A transit event occurs when a planet passes in front of its host star, causing a slight dip in the star's brightness. Telescopes like TESS observe possible transit events when a dip in a star's brightness is observed</p>
    <p className="text-lg mb-4">By measuring the dip in brightness, our game engine can infer the size and orbital period of the planetary candidate</p>
    <p className="text-lg mb-4">TESS also looks for repeated transit events to confirm the existence of a planet and determine its orbital period more precisely</p>
    <br /><img src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/24/download.png" />
    <p className="text-lg mb-4">For example, in the light curve above, there is a consistent dip magnitude, and it repeats at regular intervals. This would infer that the object being observed has a static (unchanging) radius, and orbits its parent star at regular intervals - just like a planet!</p>
    <br /><img src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/43/download.png" />
    <p className="text-lg mb-4">However, in this light curve, there is no noticable dip and thus no reptition. Candidates with graphs like this one are unlikely to be a planet</p>

    <br />
    <p className="text-lg mb-4">Throughout this first release, you'll be cataloguing different planetary candidates observed by different TESS telescopes and cataloguing them based on their initial light curve. In future releases, more data for each candidate will be added, as well as new scientific projects to contribute to - and more ways to play.</p>
    </div> */}
                {/* <SocialGraphHomeModal />
                <SocialGraphHomeNoSidebar />  */}
                <UserOnboarding />         
                <script data-name="BMC-Widget" data-cfasync="false" src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js" data-id="starsailors" data-description="Support me on Buy me a coffee!" data-message="I hope you enjoyed using Star Sailors. Please consider contributing so I can get extra features out faster." data-color="#5F7FFF" data-position="Right" data-x_margin="18" data-y_margin="18"></script>
            </CoreLayout>
        </>
    )
}