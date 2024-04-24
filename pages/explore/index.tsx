// import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useState } from "react";
import { RoverMobileTest } from "../../components/Modals/rover-mobile-test";
import { RoverInterface, RoverInterfaceDark, RoverInterfaceDarkMobile } from "../../components/Modals/rover-interface";
import Navigation from "../../components/_Core/Section/Navbar";
import FeedOverlay from "../../components/Overlays/1-Feed";
import { useMediaQuery } from "react-responsive";

export default function Explore() {
    // const supabase = useSupabaseClient();
    // const session = useSession();

    const [showFeedOverlay, setShowFeedOverlay] = useState(false);
    const handleOpenFeedOverlay = () => {
      setShowFeedOverlay(true);
    };

    const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' });
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });

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
                {isDesktopOrLaptop && ( <RoverInterfaceDark /> )};
                {isTabletOrMobile && (<RoverInterfaceDarkMobile /> )};
                <div className="mt-20">
             {showFeedOverlay && (
               <>
                 <div className="mt-20">
                   <FeedOverlay onClose={() => setShowFeedOverlay(false)} />
                 </div>
               </>
             )}
           </div>
            </div>
        </>
    );
};