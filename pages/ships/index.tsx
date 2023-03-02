import React, { useEffect, useState } from "react";

import Layout from "../../components/Layout";
import CoreLayout from "../../components/Core/Layout";
import PostCard from "../../components/PostCard";
import Card from "../../components/Card";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { UserContext } from "../../context/UserContext";

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import Login from "../login";
TimeAgo.addDefaultLocale(en);

export default function ShipyardIndex () {
    const supabase = useSupabaseClient();
    const session = useSession();
    const [posts, setPosts] = useState([]);
    const [profile, setProfile] = useState(null);

    return (
        <CoreLayout>
            <Layout hideNavigation={true}>
                <Card noPadding={false}>This page will display all the ships</Card>
                <Card noPadding={false}>This card will display the user's ships</Card>
            </Layout>
        </CoreLayout>
    )
}