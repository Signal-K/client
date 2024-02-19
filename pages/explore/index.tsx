// import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useState } from "react";
import { RoverMobileTest } from "../../components/Modals/rover-mobile-test";
import { RoverInterface, RoverInterfaceDark } from "../../components/Modals/rover-interface";
import Layout from "../../components/Core/Section/Layout";
import Navigation from "../../components/Core/Section/Navbar";
import FeedOverlay from "../../components/Overlays/1-Feed";

export default function Explore() {
    // const supabase = useSupabaseClient();
    // const session = useSession();

    const [showFeedOverlay, setShowFeedOverlay] = useState(false);
    const handleOpenFeedOverlay = () => {
      setShowFeedOverlay(true);
    };

    return (
        // <RoverMobileTest />
        // <RoverInterface />
        <>
        <style jsx global>
             {`
               body {
                 background: url('garden.png') center/cover;
               }
               
               @media only screen and (max-width: 767px) {
                 .planet-heading {
                   color: white;
                   font-size: 24px;
                   text-align: center;
                   margin-bottom: 10px;
                 }
               }
             `}
           </style>
            <Navigation />
            <div className="">
                <RoverInterfaceDark />
                <div className="mt-20">
             {showFeedOverlay && (
               <>
                 <div className="mt-20">
                   <FeedOverlay onClose={() => setShowFeedOverlay(false)} />
                 </div>
               </>
             )}
           </div>
      {!showFeedOverlay && (
           <button
             onClick={handleOpenFeedOverlay}
             className="fixed bottom-2 left-1/2 transform -translate-x-1/2 mt-4 px-4 py-2 text-white rounded"
           >
             <a
               href="#_"
               className="inline-flex overflow-hidden text-white bg-gray-900 rounded group"
             >
               <span className="px-3.5 py-2 text-white bg-purple-500 group-hover:bg-purple-600 flex items-center justify-center">
                 <svg
                   className="w-5 h-5"
                   fill="none"
                   stroke="currentColor"
                   viewBox="0 0 24 24"
                   xmlns="http://www.w3.org/2000/svg"
                 >
                   <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth="2"
                     d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                   ></path>
                 </svg>
               </span>
               <span className="pl-4 pr-5 py-2.5">Menu</span>
             </a>
           </button>
         )}
            </div>
        </>
    );
};