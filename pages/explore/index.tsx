// import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React from "react";
import { RoverMobileTest } from "../../components/rover-mobile-test";
import { RoverInterface } from "../../components/Modals/rover-interface";
import Layout from "../../components/Section/Layout";

export default function Explore() {
    // const supabase = useSupabaseClient();
    // const session = useSession();

    return (
        // <RoverMobileTest />
        <Layout>
            <RoverInterface />
        </Layout>
    );
};