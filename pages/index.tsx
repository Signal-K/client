import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React, { useState } from "react";
import CoreLayout from "../components/Core/Layout";
import SocialGraphHomeModal from "../components/Posts/Feed";
import { Database } from "../utils/database.types";
import IndexAuth from "../components/Core/indexAuth";
import PlaygroundPage from "../components/Blocks/dashboard";
import Feed from "./feed";
import { SocialGraphHomeModal1 } from "./posts";
import PostCard from "../components/Posts/Postcards/Postcard";
import CommentSection from "../components/Posts/Comments/CommentSection";
import UserProfileBlocks, { UserProfileEditBlock } from "../components/Posts/Config/UserBlocks";
import VideoEmbed from "../components/Core/atoms/VideoEmbed";
import gameLoopInfo from "../components/Core/intro/gameLoopInfo";

type Profiles = Database['public']['Tables']['profiles']['Row'];

export default function Home() {
    const session = useSession();
    const supabase = useSupabaseClient();

    // add an iframe/ref to super.so dashboard

    async function logoutUser () { 
      const { error } = await supabase.auth.signOut() 
    }

    const [profile, setProfile] = useState(null);
    const [username, setUsername] = useState<Profiles['username']>(null);

    const userId = session?.user?.id;

    if (session) {
      return (
        <CoreLayout>
          <PlaygroundPage />
          <UserProfileBlocks />
          {/* <UserProfileEditBlock />g */}
          <SocialGraphHomeModal />
        </CoreLayout>
      )
    }

    return (
            <CoreLayout>
              {/* <IndexAuth /> */}
              {/* <PlaygroundPage /> */}
        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-12 lg:px-24">
          <div className="flex flex-col w-full mb-12 text-center">
            <div className="inline-flex items-center justify-center flex-shrink-0 w-20 h-20 mx-auto mb-5 text-blue-600 rounded-full bg-gray-50">
            </div>
            <h1 className="max-w-5xl text-2xl font-bold leading-none tracking-tighter text-neutral-600 md:text-5xl lg:text-6xl lg:max-w-7xl">
              Welcome to Star Sailors <br />
            </h1>
            <VideoEmbed
              src='/assets/Videos/StarSailors.mp4'
              title='Star Sailors'
            />
            <PlaygroundPage />
            <div className="bg-white rounded-lg overflow-hidden shadow-lg p-6">
      <p className="mb-4">
        Our game offers a unique and engaging experience that combines the excitement of gaming with scientific knowledge.
      </p>
      <p className="mb-4">
        By playing, you can actively contribute to scientific research by classifying objects based on real-world data. The current focus is on the planets mini-game, where you can help identify potential new planets discovered by the TESS telescope.
      </p>
      <p className="mb-4">
        To start playing, sign up & create an account. Once you have logged in, you will be redirected to our training program, where we teach you how to play.
      </p>
      <p className="mb-4">
        Once complete, you will have the ability to navigate to the planets page where you'll classify different objects with relevant information to help you make informed decisions.
      </p>
      <p className="mb-4">
        The more you classify, the more items you collect, and the more items you collect, the more planets you can colonize. You can earn points that can be redeemed for rewards and recognition within the Star Sailors community. This is also where you can create posts about your decisions and invite other users to vote on your assessments.
      </p>
    </div>
          </div>
        </div>      
        <br />
        <center><Link href="/tests/onboarding/"><button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Play Star Sailors</button></Link></center> <br /><br /><br />
      {/* <center><h2 className="max-w-3xl text-l font-bold leading-none tracking-tighter text-neutral-600 md:text-5xl lg:text-4xl lg:max-w-4xl">Recent classifications by our users<br /></h2></center> */}
      {/* <SocialGraphHomeModal1 /> */}
      <script data-name="BMC-Widget" data-cfasync="false" src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js" data-id="starsailors" data-description="Support me on Buy me a coffee!" data-message="I hope you enjoyed using Star Sailors. Please consider contributing so I can get extra features out faster." data-color="#5F7FFF" data-position="Right" data-x_margin="18" data-y_margin="18"></script>
      <br /><br />
            </CoreLayout>
    )
}