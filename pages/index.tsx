import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React, { useState } from "react";
import CoreLayout from "../components/Core/Layout";
import { SocialGraphHomeModal } from "./posts";
import { Database } from "../utils/database.types";
import IndexAuth from "../components/Core/indexAuth";
import PlaygroundPage from "../components/Blocks/dashboard";

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

    return (
            <CoreLayout>
              {/* <IndexAuth /> */}
              <PlaygroundPage />
        <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-12 lg:px-24">
          <div className="flex flex-col w-full mb-12 text-center">
            <div className="inline-flex items-center justify-center flex-shrink-0 w-20 h-20 mx-auto mb-5 text-blue-600 rounded-full bg-gray-50">
            </div>

            <h1 className="max-w-5xl text-2xl font-bold leading-none tracking-tighter text-neutral-600 md:text-5xl lg:text-6xl lg:max-w-7xl">
              Welcome to Star Sailors <br />
            </h1>

            <p className="max-w-xl mx-auto mt-8 text-base leading-relaxed text-center text-gray-500">Our game offers a unique and engaging experience that combines the excitement of gaming with scientific knowledge. By playing, you can actively contribute to scientific research by classifying objects based on real-world data. Our current focus is on the planets mini-game, where you can help identify potential new planets discovered by the TESS telescope. To start playing, log in to the Star Sailors website and navigate to the planets page where you'll classifying different objects with relevant information to help you make informed decisions. You can create posts about your decisions and invite other users to vote on your assessment. As you participate, you'll earn points that can be redeemed for rewards and recognition within the Star Sailors community. Join us today and embark on a thrilling journey of discovery and learning!</p>

            {/* <a className="mx-auto mt-8 text-sm font-semibold text-blue-600 hover:text-neutral-600" title="read more"> Read more about the offer » </a> */}
          </div>
        </div>
      
      
        <br />
        <center><Link href="/tests/onboarding/"><button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Play Star Sailors</button></Link></center> <br /><br /><br />
      <center><h2 className="max-w-3xl text-l font-bold leading-none tracking-tighter text-neutral-600 md:text-5xl lg:text-4xl lg:max-w-4xl">Recent classifications by our users<br /></h2></center>
      <SocialGraphHomeModal />
      <br /><br />
            </CoreLayout>
    )
}