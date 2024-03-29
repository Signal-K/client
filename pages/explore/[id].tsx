import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import React from "react";
import Navigation from "../../components/_Core/Section/Navbar";
import RoverExploreDesktop from "../../components/Gameplay/Explore/RoverExplore";
import { RoverInterfaceDark } from "../../components/Modals/rover-interface";

export default function ExplorePlanet () {
    const supabase = useSupabaseClient();
    const session = useSession();

    const router = useRouter();
    const { id } = router.query;

    return (
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
                {/* <RoverExploreDesktop id={id as string} /> */}
                <RoverInterfaceDark />
            </div>
        </>
    );
};