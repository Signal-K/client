import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { UserContext } from "../../../context/UserContext";
import Layout from "../../Section/Layout";
import CardForum from "../DiscussCard";

enum SidebarLink {
    Feed,
    Demo,
    Data,
    Visit,
}

export default function IndividualPlanet({ id }: { id: string }) {
    const router = useRouter();

    const supabase = useSupabaseClient();
    const session = useSession();

    const [planetData, setPlanetData] = useState(null);
    const [planetPosts, setPlanetPosts] = useState([]);
    const { id: planetId } = router.query;

    const [activeLink, setActiveLink] = useState(SidebarLink.Data);
    const [screenWidth, setScreenWidth] = useState<number>(0);
    const [showSidebar, setShowSidebar] = useState<boolean>(true);

    useEffect(() => {
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    useEffect(() => {
        setShowSidebar(screenWidth >= 800);
    }, [screenWidth]);

    const planetCover = "https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/" + id + "/download.png";

    useEffect(() => {
        if (planetId) {
            getPlanetData();
            fetchPostsForPlanet(id);
        }
    })
    
    const getPlanetData = async () => {
        try {
            const { data, error } = await supabase
                .from("planetsss")
                .select("*")
                .eq("id", planetId)
                .single();

            if (data) {
                setPlanetData(data);
            };

            if (error) { throw error; };
        } catch (error: any) {
            console.error(error.message);
        }
    };

    async function fetchPostsForPlanet(planetId) {
        try {
            const { data: postsData, error: postsError } = await supabase
                .from("posts_duplicates")
                .select("id, content, created_at, media, profiles(id, avatar_url, username)")
                .eq("planets2", planetId)
                .order("created_at", { ascending: false });
    
            if (postsData) {
                setPlanetPosts(postsData);
            }
    
            if (postsError) {
                throw postsError;
            }
        } catch (error: any) {
            console.error("Error fetching posts:", error.message);
        }
    }

    if (!planetData) {
        return <div>Loading...</div>;
    };

    const { content, avatar_url, cover } = planetData;

    return (
        <Layout>
            <div className="mb-7"><center><img height="20%" width="20%" src={cover} /></center></div>
            {planetPosts?.length > 0 && 
                planetPosts.map((post) => (
                    <>
                        <CardForum key={post.id} {...post} />
                    </>
                ))
            }
        </Layout>
    );
};