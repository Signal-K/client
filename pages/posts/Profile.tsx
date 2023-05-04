import { GameplayLayout } from "../../components/Core/Layout";
import { ProfileCard } from "../../components/Card";
import { useRouter } from "next/router";
import React, { useEffect, useState} from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { PostCardAvatar } from "../../components/AccountAvatar";
import { UserContextProvider } from "../../context/UserContext";
import UserCoverImage from "../../components/Cover";
import ProfileTabs from "../../components/Posts/ProfileNavigation";
import { ProfileContent } from "../../components/Posts/ProfileCard";

export default function ProfilePage () {
  const [profile, setProfile] = useState(null);
  const router = useRouter();
  const tab = router?.query?.tab?.[0] || 'posts';
  const userId = router.query.id;

  const [username, setUsername] = useState('');

  const supabase = useSupabaseClient();

  // Toggle different profile actions (like changing picture) IF profile being viewed is the logged in user's picture
  const session = useSession();
  const isLoggedUser = userId === session?.user?.id;

  useEffect(() => {
    if (!userId) { return; };
    fetchProfile();
  }, [userId]);

  function fetchProfile () {
    supabase.from('profiles') // Grab profile of userId
      .select()
      .eq('id', userId)
      .then(result => {
        if (result.error) { throw result.error; };
        if (result.data) { setProfile(result.data[0]); };
      }
    )
  }

  function updateProfile () {
    supabase.from('profiles')
      .update({
        username,
      })
      .eq('id', session?.user?.id)
      .then(result => {
        if (!result.error) {
          setProfile(prev => ({ ...prev, username, }));
        }
      })
  }

  return (
    <UserContextProvider>
      <GameplayLayout>{/* Should be <ProfileLayout></> */}<div className="mx-100">
        <ProfileCard noPadding={true}>
          <div className="relative overflow-hidden rounded-md">
            <UserCoverImage url={profile?.cover} editable={true} onChange={fetchProfile()} />
            <div className="absolute top-40 mt-12 left-4 w-full z-20">
              {profile && (<PostCardAvatar // Add upload handler from AccountAvatarV1
                  url={profile?.avatar_url}
                  size={120} 
                  /*uid={session?.user?.id} 
                  onUpload={
                    updateProfile({ username, website, avatar_url: url, address})
                  }*//> 
                  )}
            </div>
            <div className="p-4 pt-0 md:pt-4 pb-0">
              <div className="ml-24 md:ml-40 mt-1">
                <div className="flex ml-0"> {/* Profile Name - Set up styling rule to remove the ml-10 on mobile */}<h1 className="text-3xl font-bold">{profile?.full_name}</h1>{/* Only show userma,e on mouseover, along with the address (like a metamask profile view) <p className="@apply text-blue-200 leading-4 mb-2 mt-2">{profile?.username}</p>*/}</div>
                <div className="text-gray-500 leading-4 mt-1 ml-0"> {profile?.address} | {profile?.address2} | {profile?.location}</div><div className="text-gray-500 leading-4 mt-1.5 ml-0">Reputation: {/* Link this to thirdweb to show their reputation balance. Set hook to draw `reputation` in `players > reputation` table from `contract > reputationToken` balance */} {profile?.reputation}</div><div className="items-center cursor-pointer absolute right-0 bottom-0 m-2"><label className="flex items-center gap-2 bg-white py-1 px-2 rounded-md shadow-md shadow-black cursor-pointer">
                    <input type='file' className='hidden' /> {/* Use this to update location, address (will later be handled by Thirdweb), username, profile pic. Maybe just have a blanket button to include the cover as well */}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>Update profile</label>
                  </div>
                {/*<div className="@apply text-blue-200 leading-4 mb-2 mt-2 ml-10">{profile?.address}{/* | Only show this on mouseover {profile?.username}*/}{/*</div> {/* Profile Location (from styles css) */}
              </div>
              <ProfileTabs activeTab={tab} userId={profile?.id} />
            </div>
          </div>
        </ProfileCard>
        <ProfileContent activeTab={tab} userId={userId} /></div>
      </GameplayLayout>
    </UserContextProvider>
  );
}