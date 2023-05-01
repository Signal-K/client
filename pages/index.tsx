import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React from "react";
import CoreLayout from "../components/Core/Layout";
import UserOnboarding from "../components/onboarding";
import { SocialGraphHomeModal, SocialGraphHomeNoSidebar } from "./posts";
import Db from "./tests/db";

export default function Home() {
    const session = useSession();
    const supabase = useSupabaseClient();
    // add an iframe/ref to super.so dashboard

    async function logoutUser () { 
      const { error } = await supabase.auth.signOut() 
    }

    return (
        <>
            <CoreLayout>  
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


            <div className="max-w-md mx-auto py-5">
      {/* <h1 className="text-4xl font-bold mb-8">Welcome to Star Sailors!</h1>
      <p className="text-lg mb-4">
      Our game offers a truly unique and engaging experience that combines the excitement of gaming with the pursuit of scientific knowledge. By playing our game, you can actively contribute to real-world scientific research projects by collecting and classifying objects based on actual data. We are currently focused on our planets mini-game, where you can help identify potential new planets that have been discovered by the TESS telescope. To begin, simply log in to the Star Sailors website and navigate to the planets page, where you'll be presented with various objects to classify along with relevant information to assist you in making informed decisions. Once you've made your decision, you can create a post about it and invite other users to vote on your assessment. As you participate, you'll earn points that can be redeemed for rewards and recognition within the Star Sailors community. Join us today and embark on a thrilling journey of discovery and learning!
      </p> */}
       {/*<p className="text-lg mb-4">
      Keep an eye on planets that have a light curve with consistent dips, and a temperature that appears consistent with the dips (for example, the larger the dips appear, the higher the temperature (measured in Kelvin) should be. )
      </p> Once radius comes in, discuss dips in relation to proposed radius & temperature. These two params would be determined by the user in the next build. Line 43 is just demo content for the current build and the explanation regarding dips and temperatures is obviously incorrect -> however this build is about having something to identify and measure */}
      <br /><br />
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
    </div>
                {/* <SocialGraphHomeModal /> */}
                <SocialGraphHomeNoSidebar /> 
                <button onClick={logoutUser}>Logout</button>
                <UserOnboarding />         
                <script data-name="BMC-Widget" data-cfasync="false" src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js" data-id="starsailors" data-description="Support me on Buy me a coffee!" data-message="I hope you enjoyed using Star Sailors. Please consider contributing so I can get extra features out faster." data-color="#5F7FFF" data-position="Right" data-x_margin="18" data-y_margin="18"></script>
            </CoreLayout>
        </>
    )
}