import Layout, { ProfileLayout } from "../../components/Layout";
import Card from "../../components/Card";
import Avatar from "../../components/Avatar";
import Link from "next/link";
import PostCard from "../../components/PostCard";
import {useRouter} from "next/router";
import FriendInfo from "../../components/FriendInfo";
import React, { useContext, useEffect, useState} from "react";
import { Database } from "../../utils/database.types";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import AccountAvatar, { PostCardAvatar } from "../../components/AccountAvatar";
import { UserContext } from "../../context/UserContext";
import UserCoverImage from "../../components/Cover";
import UtterancesComments from "../../components/Lens/Utterances";
import ProfileTabs from "../../components/Posts/ProfileNavigation";

type Profiles = Database['public']['Tables']['profiles']['Row'];

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const router = useRouter();
  const userId = router.query.id;
  const {asPath:pathname} = router;

  const supabase = useSupabaseClient();

  const isPosts = pathname.includes('posts') || pathname === '/profile';
  const isAbout = pathname.includes('about');
  const isFriends = pathname.includes('friends');
  const isPhotos = pathname.includes('photos');
  const tabClasses = 'flex gap-1 px-4 py-1 items-center border-b-4 border-b-white';
  const activeTabClasses = 'flex gap-1 px-4 py-1 items-center border-socialBlue border-b-4 text-socialBlue font-bold';

  // Toggle different profile actions (like changing picture) IF profile being viewed is the logged in user's picture
  const session = useSession();
  const isLoggedUser = userId === session?.user?.id;

  useEffect(() => {
    if (!userId) {
      return;
    }
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

  return (
    <ProfileLayout hideNavigation={false}>
      <Card noPadding={true}>
        <div className="relative overflow-hidden rounded-md">
          <UserCoverImage url={profile?.cover} editable={true} onChange={fetchProfile()} />
          <div className="absolute top-40 mt-12 left-4 w-full z-20">
            {profile && (<PostCardAvatar // Add upload handler from AccountAvatarV1
                url={profile?.avatar_url}
                size={120} /> )}
          </div>
          <div className="p-4 pt-0 md:pt-4 pb-0">
            <div className="ml-24 md:ml-40">
              <div className="flex ml-10"> {/* Profile Name - Set up styling rule to remove the ml-10 on mobile */}<h1 className="text-3xl font-bold">{profile?.full_name}</h1><p className="@apply text-blue-200 leading-4 mb-2 mt-2">{profile?.username}</p></div>
              <div className="text-gray-500 leading-4 mt-0.5 ml-10">{profile?.location}</div><div className="items-center cursor-pointer absolute right-0 bottom-0 m-2"><label className="flex items-center gap-2 bg-white py-1 px-2 rounded-md shadow-md shadow-black cursor-pointer">
                  <input type='file' className='hidden' /> {/* Use this to update location, address (will later be handled by Thirdweb), username, profile pic. Maybe just have a blanket button to include the cover as well */}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" /></svg>Update profile</label>
                </div>
              <div className="@apply text-blue-200 leading-4 mb-2 mt-2 ml-10">{profile?.address}{/* | {profile?.username}*/}</div> {/* Profile Location (from styles css) */}
            </div>
            <ProfileTabs />
          </div>
        </div>
      </Card>
      {isPosts && (
        <div>
          {/*<PostCard key = { postMessage.id } { ..post } />*/}
        </div>
      )}
      {isAbout && (
        <div>
          <Card noPadding={false}>
            <h2 className="text-3xl mb-2">About me</h2>
            <p className="mb-2 text-sm">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aut doloremque harum maxime mollitia perferendis praesentium quaerat. Adipisci, delectus eum fugiat incidunt iusto molestiae nesciunt odio porro quae quaerat, reprehenderit, sed.</p>
            <p className="mb-2 text-sm">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Amet assumenda error necessitatibus nesciunt quas quidem quisquam reiciendis, similique. Amet consequuntur facilis iste iure minima nisi non praesentium ratione voluptas voluptatem?</p>
          </Card>
          <UtterancesComments />
        </div>
      )}
      {isFriends && (
        <div>
          <Card noPadding={false}>
            <h2 className="text-3xl mb-2">Friends</h2>
            <div className="">
              <div className="border-b border-b-gray-100 p-4 -mx-4">
                <FriendInfo />
              </div>
              <div className="border-b border-b-gray-100 p-4 -mx-4">
                <FriendInfo />
              </div>
              <div className="border-b border-b-gray-100 p-4 -mx-4">
                <FriendInfo />
              </div>
              <div className="border-b border-b-gray-100 p-4 -mx-4">
                <FriendInfo />
              </div>
              <div className="border-b border-b-gray-100 p-4 -mx-4">
                <FriendInfo />
              </div>
              <div className="border-b border-b-gray-100 p-4 -mx-4">
                <FriendInfo />
              </div>
              <div className="border-b border-b-gray-100 p-4 -mx-4">
                <FriendInfo />
              </div>
            </div>
          </Card>
        </div>
      )}
      {isPhotos && (
        <div>
          <Card noPadding={false}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-md overflow-hidden h-48 flex items-center shadow-md">
                <img src="https://images.unsplash.com/photo-1601581875039-e899893d520c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80" alt=""/>
              </div>
              <div className="rounded-md overflow-hidden h-48 flex items-center shadow-md">
                <img src="https://images.unsplash.com/photo-1563789031959-4c02bcb41319?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80" alt=""/>
              </div>
              <div className="rounded-md overflow-hidden h-48 flex items-center shadow-md">
                <img src="https://images.unsplash.com/photo-1560703650-ef3e0f254ae0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" alt=""/>
              </div>
              <div className="rounded-md overflow-hidden h-48 flex items-center shadow-md">
                <img src="https://images.unsplash.com/photo-1601581874834-3b6065645e07?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1074&q=80" alt=""/>
              </div>
            </div>
          </Card>
        </div>
      )}
    </ProfileLayout>
  );
}