import { useRouter } from "next/router";
import React, { useEffect, useState, useRef, createRef } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import DashboardLayout from "../../components/Tests/Layout/Dashboard";
// import { PlanetPostCard } from "../../components/PostCard";
import PlanetPostCard from "../../components/Posts/PlanetPostsFetch";
import PlanetAvatar from "../../components/Gameplay/Planets/PlanetAvatar";
import { UserContext } from "../../context/UserContext";
import { PostFormCardPlanetTag } from "../../components/PostFormCard";
import Card from "../../components/Card";
import UnityBuildLod1 from "../../components/Gameplay/Unity/Build/LOD-Rocky";
import UnityBuildLod11 from "../../components/Gameplay/Unity/Build/LOD-Water";
import UnityScreenshot from "../../components/Gameplay/Generator/UnityScreenshot";
import PostCard from "../../components/Posts/Postcards/Postcard";
import { useScreenshot, createFileName } from 'use-react-screenshot';
import CoreLayout from "../../components/Core/Layout";
import ProfilePage from "../../components/Tests/Planet/ProfileCardTest";
import fetchTic from "../../components/Gameplay/Inventory/fetchTic";
import YourComponent from "../../components/Gameplay/Inventory/fetchTic";
import LightkurveForm from "../../components/Gameplay/Inventory/fetchTic2";

enum SidebarLink {
  Feed,
  Demo,
  Data,
  Visit,
}

const getRandomGradientColors = () => {
  const colors = ["red", "blue", "green", "purple", "orange", "pink"];
  const color1 = colors[Math.floor(Math.random() * colors.length)];
  let color2 = color1;
  while (color2 === color1) {
    color2 = colors[Math.floor(Math.random() * colors.length)];
  }
  return [color1, color2];
};

export default function PlanetPage({ id }: { id: string }) {
  const router = useRouter();

  const supabase = useSupabaseClient();
  const session = useSession();

  const [planetData, setPlanetData] = useState(null);
  const [planetPosts, setPlanetPosts] = useState([]);
  const { id: planetId } = router.query; // Rename the variable to 'planetId'
  const [unityBuild, setUnityBuild] = useState(null);

  useEffect(() => {
    if (planetData?.temperature < 300) {
      setUnityBuild(1);
    }
    if (planetData?.temperature >= 300) {
      setUnityBuild(2);
    }
  }, [planetData?.temperature]);

  const [profile, setProfile] = useState(null);
  const [activeLink, setActiveLink] = useState(SidebarLink.Feed); // Track the active link
  const [showUnity, setShowUnity] = useState(false); // Track the visibility of Unity component
  const [loadUnityComponent, setLoadUnityComponent] = useState(false);

  const displayPlanet = async () => {
    setLoadUnityComponent(true);
    handleSidebarLinkClick(SidebarLink.Demo);
  }

    // State to hold the gradient colors
    const [gradientColor1, setGradientColor1] = useState("gray-200");
    const [gradientColor2, setGradientColor2] = useState("gray-300");
  
    // State to hold the screen width
    const [screenWidth, setScreenWidth] = useState<number>(0);
  
    // State to track whether to show the sidebar or not
    const [showSidebar, setShowSidebar] = useState<boolean>(true);
  
    useEffect(() => {
      // Calculate the gradient colors
      const [color1, color2] = getRandomGradientColors();
      setGradientColor1(color1);
      setGradientColor2(color2);
  
      // Update the screen width
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
      // Check screen width to show/hide the sidebar
      setShowSidebar(screenWidth >= 800);
    }, [screenWidth]);

  const planetBinned =
    "https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/" +
    id +
    "/binned.png";
  const planetPhased =
    "https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/" +
    id +
    "/phase.png";
  const planetCover =
    "https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/" +
    id +
    "/download.png";

  useEffect(() => {
    if (planetId) {
      getPlanetData();
      fetchPostsForPlanet(planetId);
    }
  }, [planetId]);

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    supabase
      .from("profiles")
      .select()
      .eq("id", session?.user?.id)
      .then((result) => {
        if (result.data.length) {
          setProfile(result.data[0]);
        }
      });
  }, [session?.user?.id]);

  const getPlanetData = async () => {
    try {
      const { data, error } = await supabase
        .from("planetsss")
        .select("*")
        .eq("id", planetId) // Use 'planetId' here
        .single();

      if (data) {
        setPlanetData(data);
      }

      if (error) {
        throw error;
      }
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

  const a = 0;

  useEffect(() => {
    if (planetPosts.length > 0) {
      const postIds = planetPosts.map((post) => post.id);
      supabase
        .from("comments")
        .select("id, content, created_at, profiles(id, avatar_url, username), post_id")
        .in("post_id", postIds)
        .order("created_at", { ascending: true })
        .then((commentsResponse) => {
          const commentsByPostId: { [postId: number]: Comment[] } = commentsResponse.data.reduce(
            (acc, comment) => {
              const postId = comment.post_id;
              if (!acc[postId]) {
                acc[postId] = [];
              }
              acc[postId].push(comment);
              return acc;
            },
            {}
          );
  
          const postsWithComments = planetPosts.map((post) => ({
            ...post,
            comments: commentsByPostId[post.id] || [],
          }));
  
          setPlanetPosts(postsWithComments);
        })
    }
  }, [a]);

  const handleSidebarLinkClick = (link: SidebarLink) => {
    setActiveLink(link);
    if (link === SidebarLink.Demo) {
      setShowUnity(true);
    } else {
      setShowUnity(false);
    }
  };

  if (!planetData) {
    return <div>Loading...</div>;
  }

  const { content, avatar_url, cover } = planetData;

  return (
    <CoreLayout>
      <>
      {/* <ProfilePage /> */}
  <link
    rel="stylesheet"
    href="https://unpkg.com/tailwindcss@2.2.19/dist/tailwind.min.css"
  />
  <div className="max-w-4xl flex items-center h-auto lg:h-screen flex-wrap mx-auto my-32 lg:my-0">
    {/*Main Col*/}
    <div
      id="profile"
      className="w-full lg:w-3/5 rounded-lg lg:rounded-l-lg lg:rounded-r-none shadow-2xl bg-white opacity-75 mx-6 lg:mx-0"
    >
      <div className="p-4 md:p-12 text-center lg:text-left">
        {/* Image for mobile view*/}
        <div
          className="block lg:hidden rounded-full shadow-xl mx-auto -mt-16 h-48 w-48 bg-cover bg-center"
          style={{
            backgroundImage: `url("${cover}")`
          }}
        />
        <h1 className="text-3xl font-bold pt-8 lg:pt-0 mb-2">{content}</h1>
        {/* <center><iframe title="Embedded cell output" src={planetData?.deepnote} height="425" width="90%" /></center> */}
        <p className="pt-2 text-gray-600 text-xs lg:text-sm flex items-center justify-center lg:justify-start">
          <svg
            className="h-4 fill-current text-green-700 pr-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm7.75-8a8.01 8.01 0 0 0 0-4h-3.82a28.81 28.81 0 0 1 0 4h3.82zm-.82 2h-3.22a14.44 14.44 0 0 1-.95 3.51A8.03 8.03 0 0 0 16.93 14zm-8.85-2h3.84a24.61 24.61 0 0 0 0-4H8.08a24.61 24.61 0 0 0 0 4zm.25 2c.41 2.4 1.13 4 1.67 4s1.26-1.6 1.67-4H8.33zm-6.08-2h3.82a28.81 28.81 0 0 1 0-4H2.25a8.01 8.01 0 0 0 0 4zm.82 2a8.03 8.03 0 0 0 4.17 3.51c-.42-.96-.74-2.16-.95-3.51H3.07zm13.86-8a8.03 8.03 0 0 0-4.17-3.51c.42.96.74 2.16.95 3.51h3.22zm-8.6 0h3.34c-.41-2.4-1.13-4-1.67-4S8.74 3.6 8.33 6zM3.07 6h3.22c.2-1.35.53-2.55.95-3.51A8.03 8.03 0 0 0 3.07 6z" />
          </svg>{" "}
          Anomaly temperature: {planetData.temperature}
        </p>
        <p className="pt-2 text-gray-600 text-xs lg:text-sm flex items-center justify-center lg:justify-start">
          <svg
            className="h-4 fill-current text-green-700 pr-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm7.75-8a8.01 8.01 0 0 0 0-4h-3.82a28.81 28.81 0 0 1 0 4h3.82zm-.82 2h-3.22a14.44 14.44 0 0 1-.95 3.51A8.03 8.03 0 0 0 16.93 14zm-8.85-2h3.84a24.61 24.61 0 0 0 0-4H8.08a24.61 24.61 0 0 0 0 4zm.25 2c.41 2.4 1.13 4 1.67 4s1.26-1.6 1.67-4H8.33zm-6.08-2h3.82a28.81 28.81 0 0 1 0-4H2.25a8.01 8.01 0 0 0 0 4zm.82 2a8.03 8.03 0 0 0 4.17 3.51c-.42-.96-.74-2.16-.95-3.51H3.07zm13.86-8a8.03 8.03 0 0 0-4.17-3.51c.42.96.74 2.16.95 3.51h3.22zm-8.6 0h3.34c-.41-2.4-1.13-4-1.67-4S8.74 3.6 8.33 6zM3.07 6h3.22c.2-1.35.53-2.55.95-3.51A8.03 8.03 0 0 0 3.07 6z" />
          </svg>{" "}
          Orbital Period: {planetData?.orbital_period} days
        </p>
        <p className="pt-2 text-gray-600 text-xs lg:text-sm flex items-center justify-center lg:justify-start">
          <svg
            className="h-4 fill-current text-green-700 pr-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm7.75-8a8.01 8.01 0 0 0 0-4h-3.82a28.81 28.81 0 0 1 0 4h3.82zm-.82 2h-3.22a14.44 14.44 0 0 1-.95 3.51A8.03 8.03 0 0 0 16.93 14zm-8.85-2h3.84a24.61 24.61 0 0 0 0-4H8.08a24.61 24.61 0 0 0 0 4zm.25 2c.41 2.4 1.13 4 1.67 4s1.26-1.6 1.67-4H8.33zm-6.08-2h3.82a28.81 28.81 0 0 1 0-4H2.25a8.01 8.01 0 0 0 0 4zm.82 2a8.03 8.03 0 0 0 4.17 3.51c-.42-.96-.74-2.16-.95-3.51H3.07zm13.86-8a8.03 8.03 0 0 0-4.17-3.51c.42.96.74 2.16.95 3.51h3.22zm-8.6 0h3.34c-.41-2.4-1.13-4-1.67-4S8.74 3.6 8.33 6zM3.07 6h3.22c.2-1.35.53-2.55.95-3.51A8.03 8.03 0 0 0 3.07 6z" />
          </svg>{" "}
          Radius: Unknown
        </p>
        <p className="pt-2 text-gray-600 text-xs lg:text-sm flex items-center justify-center lg:justify-start">
          <svg
            className="h-4 fill-current text-green-700 pr-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm7.75-8a8.01 8.01 0 0 0 0-4h-3.82a28.81 28.81 0 0 1 0 4h3.82zm-.82 2h-3.22a14.44 14.44 0 0 1-.95 3.51A8.03 8.03 0 0 0 16.93 14zm-8.85-2h3.84a24.61 24.61 0 0 0 0-4H8.08a24.61 24.61 0 0 0 0 4zm.25 2c.41 2.4 1.13 4 1.67 4s1.26-1.6 1.67-4H8.33zm-6.08-2h3.82a28.81 28.81 0 0 1 0-4H2.25a8.01 8.01 0 0 0 0 4zm.82 2a8.03 8.03 0 0 0 4.17 3.51c-.42-.96-.74-2.16-.95-3.51H3.07zm13.86-8a8.03 8.03 0 0 0-4.17-3.51c.42.96.74 2.16.95 3.51h3.22zm-8.6 0h3.34c-.41-2.4-1.13-4-1.67-4S8.74 3.6 8.33 6zM3.07 6h3.22c.2-1.35.53-2.55.95-3.51A8.03 8.03 0 0 0 3.07 6z" />
          </svg>{" "}
          Owner: {planetData?.owner || "None"}
        </p>
        {/* <p className="pt-2 text-gray-600 text-xs lg:text-sm flex items-center justify-center lg:justify-start">
          <svg
            className="h-4 fill-current text-green-700 pr-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M10 20a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm7.75-8a8.01 8.01 0 0 0 0-4h-3.82a28.81 28.81 0 0 1 0 4h3.82zm-.82 2h-3.22a14.44 14.44 0 0 1-.95 3.51A8.03 8.03 0 0 0 16.93 14zm-8.85-2h3.84a24.61 24.61 0 0 0 0-4H8.08a24.61 24.61 0 0 0 0 4zm.25 2c.41 2.4 1.13 4 1.67 4s1.26-1.6 1.67-4H8.33zm-6.08-2h3.82a28.81 28.81 0 0 1 0-4H2.25a8.01 8.01 0 0 0 0 4zm.82 2a8.03 8.03 0 0 0 4.17 3.51c-.42-.96-.74-2.16-.95-3.51H3.07zm13.86-8a8.03 8.03 0 0 0-4.17-3.51c.42.96.74 2.16.95 3.51h3.22zm-8.6 0h3.34c-.41-2.4-1.13-4-1.67-4S8.74 3.6 8.33 6zM3.07 6h3.22c.2-1.35.53-2.55.95-3.51A8.03 8.03 0 0 0 3.07 6z" />
          </svg>{" "}
          Contract info: {planetData?.contract}
        </p> */}
        <p className="pt-8 text-sm">
        </p>
        {session?.user?.id && ( <> <UserContext.Provider value={{profile}}><PostFormCardPlanetTag planetId2={planetId} onPost={() => fetchPostsForPlanet(planetId)} /></UserContext.Provider> </> )}
        <div className="mt-6 pb-16 lg:pb-0 w-4/5 lg:w-full mx-auto flex flex-wrap items-center justify-between">
  {/* Feed Icon */}
  {/* <a className="link" href="#" data-tippy-content="Feed">
    <svg
      className="h-6 fill-current text-gray-600 hover:text-green-700"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <title>Feed</title>
      <path d="M3.5 13C2.7 13 2 13.7 2 14.5S2.7 16 3.5 16 5 15.3 5 14.5 4.3 13 3.5 13zM3.5 9C2.7 9 2 9.7 2 10.5S2.7 12 3.5 12 5 11.3 5 10.5 4.3 9 3.5 9zM3.5 5C2.7 5 2 5.7 2 6.5S2.7 8 3.5 8 5 7.3 5 6.5 4.3 5 3.5 5zM20 12h-8c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2zm0 10h-8v-8h8v8z" />
    </svg>
  </a> */}

  {/* Graphs Icon */}
  <button
  onClick={() => handleSidebarLinkClick(SidebarLink.Feed)}
  className={`text-gray-800 p-2 ${activeLink === SidebarLink.Feed ? "font-bold" : ""}`}
>
  <div className="flex items-center">
    <svg
      className="h-6 fill-current text-gray-600 hover:text-green-700 mr-2"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <title>Feed</title>
      <path d="M21.1 2.1C19.6.6 17.2 0 14.5 0S9.4.6 7.9 2.1C6.4 3.6 5.8 5.9 5.8 8.5s.6 4.9 2.1 6.4c1.5 1.5 3.8 2.1 6.4 2.1s4.9-.6 6.4-2.1c1.5-1.5 2.1-3.8 2.1-6.4s-.6-4.9-2.1-6.4zM19.7 8.3c-.3.3-.6.4-1 .5.3-.3.6-.7.9-1.1-.3.2-.7.5-1.1.7-.2-.6-.4-1.2-.7-1.7-.4.3-.8.6-1.2.8-.4-.6-.9-1.1-1.5-1.5-.2.4-.5.8-.9 1.1-.6-.2-1.2-.4-1.7-.7.2-.4.5-.9.7-1.3-.4-.3-.7-.6-1.1-.8-.3.6-.7 1.1-1.1 1.5-1-.8-2.2-1.3-3.4-1.7v3.3h2c-.1 0-.1.1-.2.1v3.5c.2-.1.3-.2.5-.3v2.9c1.3.3 2.6.9 3.7 1.7-.2.2-.3.5-.5.7-.4-.4-.8-.7-1.3-1.1.5-.4 1-1 1.5-1.5.3.2.6.4 1 .6-.2.6-.5 1.2-.9 1.7.4.3.8.6 1.1.9.2-.4.4-.7.6-1.1 1.2.8 2.5 1.3 3.9 1.7v3.3h2v-3.3c1.4-.4 2.7-1 3.9-1.7-.2-.3-.4-.6-.6-1 1.1-.5 2-1.1 2.9-1.9-.1-.4-.2-.8-.4-1.2-.8.7-1.7 1.3-2.7 1.7v-2.2c.2 0 .3 0 .5-.1v-3.6c-.1 0-.1-.1-.2-.1h2v-3.3c-.5-.3-1-.5-1.5-.7-.1-.1-.2-.1-.3-.2-.6-.4-1.2-.8-1.8-1.2-.3.3-.6.6-.9.9-1-.8-2.2-1.4-3.5-1.7zm-1.2-4.7c1.6-.1 3.2.4 4.6 1.2-.7 1.3-1.5 2.4-2.5 3.3-1.7-1-3.6-1.4-5.6-1.3v-2.2c1.2-.2 2.4.1 3.5.3zM7 10.4c1.5-.7 3.1-.9 4.6-.8v2.2c-2 .1-3.9.7-5.6 1.7-.9-.9-1.8-2-2.5-3.3 1.3-.8 2.9-1.3 4.5-1.8zm-.2 4.9c1.3-.2 2.6 0 3.8.3-.2 1.5-1 2.8-2.1 3.7-1.7-1.5-3.7-2.3-5.9-2.3s-4.2.8-5.9 2.3c-1.1-.9-1.9-2.2-2.1-3.7 1.2-.2 2.5-.5 3.8-.3.3 1.2 1 2.2 2 3 1.8-1.8 4-2.9 6.2-2.9s4.5 1.1 6.2 2.9c.9-.8 1.6-1.8 2-3z" />
    </svg>
    <span className="text-gray-800">Feed</span>
  </div>
</button>

  {/* Gameplay Icon */}
  <button
              onClick={() => handleSidebarLinkClick(SidebarLink.Data)}
              className={`text-gray-800 p-2 ${
                activeLink === SidebarLink.Data ? "font-bold" : ""
              }`}
            ><a className="link" href="#" data-tippy-content="Gameplay"><div className="flex items-center">
    <svg
      className="h-6 fill-current text-gray-600 hover:text-green-700"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <title>Data</title>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M12 2c-4.42 0-8 3.58-8 8 0 3.31 2.55 6.02 5.84 7.93.48.23.82.74.82 1.34v2c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-2c0-.65-.45-1.19-1.07-1.32C4.41 18.79 2 15.42 2 12c0-5.52 3.58-10 8-10s8 4.48 8 10c0 3.42-2.41 6.79-5.25 7.68-.62.15-1.05.67-1.05 1.32v2c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-2c0-.6.34-1.11.82-1.34C19.45 16.02 22 13.31 22 10c0-4.42-3.58-8-8-8zm-.53 17.45c-.32.13-.56.42-.61.76-.1.63-.33 1.67-.86 1.76-.18.03-.36.03-.53 0a.99.99 0 0 1-.86-1.11c.06-.63.32-1.15.7-1.61.5-.57.63-1.32.41-2.07-.22-.73-.75-1.33-1.47-1.67-.33-.14-.43-.51-.21-.77.45-.54.77-1.18.87-1.89.13-.76-.17-1.52-.75-2.03-.56-.49-1.34-.61-2.03-.34-.67.28-1.17.84-1.31 1.53-.13.73.2 1.42.77 1.87.31.24.41.64.26 1-.48 1.09-.56 2.35-.15 3.51.3.9 1.13 1.51 2.05 1.56h.04c.51.04 1.04-.15 1.4-.5.27-.27.62-.41 1-.41.71 0 1.23.66 1.09 1.35-.13.7-.76 1.27-1.46 1.41-.17.03-.34.05-.52.05zm-.47-4.67c-.03.14-.14.25-.28.31-.55.2-1.11.26-1.66.15-.5-.11-.95-.36-1.28-.7-.26-.25-.35-.61-.26-.95.1-.38.42-.7.8-.78.73-.14 1.47-.2 2.2-.05.53.11.94.41 1.25.81.23.29.2.7-.07.97zm3.29 1.59c.3-.26.49-.64.49-1.06 0-.34-.15-.66-.4-.89-.23-.21-.54-.33-.85-.33s-.63.12-.86.33c-.25.23-.4.55-.4.89 0 .42.19.8.49 1.06.31.26.71.41 1.13.41s.83-.15 1.13-.41zm1.07-1.8c.15-.18.17-.43.04-.63-.35-.5-.89-.88-1.54-1.07a1.41 1.41 0 0 0-1.06.07c-.25.1-.42.3-.49.55-.08.36.05.72.29.97.21.21.49.34.78.36 1.16.08 2.15-.67 2.38-1.81a1.24 1.24 0 0 0-.22-1.02c-.3-.34-.76-.55-1.24-.57-.41-.02-.82.15-1.1.47-.27.3-.37.7-.26 1.08.09.33.3.62.6.8.23.15.48.2.73.16 1.04-.16 1.8-.99 1.92-2.03a2.29 2.29 0 0 0-.4-1.36c-.34-.47-.86-.8-1.46-.91-.42-.09-.85.02-1.19.26-.27.23-.41.55-.39.89.01.4.2.77.52 1.03.3.25.69.37 1.08.34.56-.04 1.02-.43 1.08-.98.05-.47-.18-.9-.55-1.15-.27-.18-.6-.25-.94-.19a2.37 2.37 0 0 0-1.15.58c-.19.17-.21.42-.06.61zm1.69-1.03c.3-.15.52-.42.57-.75.06-.46-.29-.86-.75-.93a.78.78 0 0 0-.68.4.76.76 0 0 0-.11.67c.03.25.21.48.44.6.26.12.55.06.75-.15zM11.05 5c-.3-.24-.72-.2-1.01.08-.2.18-.32.43-.34.69a.84.84 0 0 0 .22.7c.3.24.72.2 1.01-.08.2-.18.32-.43.34-.69-.03-.26-.21-.48-.44-.6zm-5.53 5.5c-.07.13-.1.28-.08.42.09.55.5.95 1.02 1.06.1.02.2.03.29.03.45 0 .89-.19 1.2-.52.12-.12.14-.3.07-.44-.1-.2-.31-.32-.54-.34-.38.02-.71-.27-.78-.65a.76.76 0 0 1 .14-.59zm2.36-.1c.18-.11.28-.31.26-.51a.73.73 0 0 0-.26-.51.78.78 0 0 0-.56-.1.75.75 0 0 0-.47.5c-.07.19.03.4.22.5.14.08.3.1.44.06zm9.17-1.86a.73.73 0 0 0-.26-.51c-.18-.12-.42-.13-.61-.02-.18.1-.3.29-.3.49 0 .38.28.69.66.75.1.02.2.03.3.03.34 0 .67-.15.9-.42.12-.12.14-.3.07-.44-.1-.2-.31-.32-.54-.34-.38.02-.71-.27-.78-.65zm-5.2-.3c-.3.3-.3.78 0 1.08.12.12.26.2.41.23.16.03.31-.01.44-.1.09-.06.2-.14.29-.23.3-.3.3-.78 0-1.08-.3-.3-.78-.3-1.08 0zm1.28-2.14c-.18.1-.3.29-.3.49 0 .38.28.69.66.75.1.02.2.03.3.03.34 0 .67-.15.9-.42.12-.12.14-.3.07-.44-.1-.2-.31-.32-.54-.34-.38.02-.71-.27-.78-.65a.76.76 0 0 1 .14-.59zm-.58 2.29c-.12-.13-.29-.22-.47-.22-.45 0-.78.36-.75.75 0 .21.1.4.26.51.1.05.22.07.34.07.36 0 .69-.19.9-.51a.75.75 0 0 0-.28-1.06zm2.65-5.36c-.12-.12-.27-.19-.42-.22-.36 0-.66.28-.71.66-.02.12 0 .24.06.35.07.14.19.26.34.34.12.07.24.1.36.1.37 0 .69-.28.75-.66.02-.12 0-.24-.06-.35-.07-.15-.18-.28-.31-.36zM11 2.5c-.45 0-.85.29-.99.72a1 1 0 0 0-.15.87c.07.33.3.6.61.74.27.13.58.13.85.01.18-.1.31-.27.36-.46.08-.29-.1-.59-.38-.71a.78.78 0 0 0-.34-.04zm2.33 0c-.45 0-.85.29-.99.72a1 1 0 0 0-.15.87c.07.33.3.6.61.74.27.13.58.13.85.01.18-.1.31-.27.36-.46.08-.29-.1-.59-.38-.71a.78.78 0 0 0-.34-.04zm-4.65.5c-.3 0-.57.23-.62.54-.04.38.26.72.64.76.1.01.2.01.3-.02.34-.07.63-.28.81-.57.12-.21.34-.36.59-.42.43-.11.86-.05 1.24.17.29.16.51.42.58.72.04.38-.26.72-.64.76a.77.77 0 0 1-.29-.04c-.16-.04-.31-.17-.39-.32-.06-.11-.17-.19-.3-.23a.725.725 0 0 0-.36.02c-.3.07-.54.26-.69.52-.14.26-.37.46-.66.55-.22.07-.44.02-.61-.12-.19-.16-.33-.37-.39-.62a.75.75 0 0 1 .29-.83c.06-.05.13-.08.2-.09.26-.06.52.07.68.27.16.2.3.46.38.72.05.16.17.29.32.38.18.11.41.14.61.07.42-.13.7-.52.71-.94.01-.42-.26-.78-.65-.87-.15-.03-.3-.01-.44.05a.8.8 0 0 0-.33.27c-.15-.15-.34-.25-.54-.3a.78.78 0 0 0-.52.02c-.35.2-.58.57-.57.99.01.42.26.78.65.87.13.03.27.03.41-.01.2-.07.38-.21.48-.39a.76.76 0 0 0 .1-.55c-.04-.24-.2-.46-.42-.58-.16-.1-.34-.14-.52-.12-.26.04-.5.2-.61.45-.1.24-.25.45-.43.61-.17.15-.39.25-.61.3a.79.79 0 0 1-.58-.04c-.26-.13-.41-.41-.36-.68.05-.26.27-.46.54-.52.08-.02.16-.03.24-.03.25 0 .48.1.65.28.2.21.32.48.35.77.03.34-.19.65-.52.74-.1.03-.19.03-.28.01a.74.74 0 0 1-.66-.61c-.03-.21-.18-.39-.38-.5a.77.77 0 0 0-.44-.02c-.29.08-.52.31-.61.6-.08.36.1.72.43.86.22.09.47.07.67-.06.13-.08.23-.2.3-.34.05-.11.07-.22.06-.33 0-.34-.28-.64-.64-.68-.09-.01-.18-.01-.26.02-.34.07-.63.28-.81.57-.12.21-.34.36-.59.42a.76.76 0 0 1-.59-.42c-.08-.17-.23-.31-.4-.39-.34-.15-.74-.08-1.04.19a.745.745 0 0 0-.21 1.03c.09.13.21.23.36.28.07.02.15.03.22.02.31-.02.59-.2.73-.49.12-.22.34-.38.6-.42a.77.77 0 0 1 .59.42c.07.15.22.28.39.35.34.15.74.08 1.04-.19.14-.15.21-.33.21-.53-.01-.2-.11-.38-.27-.52-.17-.14-.38-.25-.6-.31-.33-.08-.68.03-.94.28-.25.25-.37.58-.32.9.03.34.19.65.51.75.12.03.24.03.35.01a.78.78 0 0 0 .74-.63c.02-.12.04-.24.03-.36-.01-.25-.2-.46-.44-.57a.74.74 0 0 0-.41-.02c-.29.08-.52.31-.61.6-.09.36.1.72.43.86.23.1.48.08.67-.05.13-.08.23-.2.3-.34.05-.11.07-.22.06-.33-.01-.33-.29-.62-.64-.66-.09-.01-.18-.01-.26.02-.34.07-.63.28-.81.57-.12.21-.34.36-.59.42a.76.76 0 0 1-.59-.42c-.08-.17-.23-.31-.4-.39-.34-.15-.74-.08-1.04.19a.745.745 0 0 0-.21 1.03c.09.13.21.23.36.28.08.02.15.03.22.02.31-.02.59-.2.73-.49.12-.22.34-.38.6-.42a.77.77 0 0 1 .59.42c.07.15.22.28.39.35.34.15.74.08 1.04-.19.14-.15.21-.33.21-.53-.01-.2-.11-.38-.27-.52-.17-.14-.38-.25-.6-.31-.33-.08-.68.03-.94.28-.25.25-.37.58-.32.9.03.34.19.65.51.75.12.03.24.03.35.01.39-.12.65-.49.66-.91a.77.77 0 0 0-.77-.76z" />
    </svg><span className="text-gray-800">Data</span></div>
  </a></button>

  {/* Stats Icon */}
  <button
  onClick={() => displayPlanet()}
  className={`text-gray-800 p-2 ${activeLink === SidebarLink.Demo ? "font-bold" : ""}`}
>
  <div className="flex items-center">
    <svg
      className="h-6 fill-current text-gray-600 hover:text-green-700 mr-2"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <title>Demo</title>
      <path d="M3 2h3v16h-3zm5 18h3v-8h-3zm5 0h3V8h-3zm5 0h3V12h-3z" />
    </svg>
    <span className="text-gray-800">Demo</span>
  </div>
</button>

</div>

        {/* Use https://simpleicons.org/ to find the svg for your preferred product */}
      </div>
    </div>
    {/*Img Col*/}
    <div className="w-full lg:w-2/5">
  {/* Big profile image for side bar (desktop) */}
  <div
    className="h-96 lg:h-40 bg-cover bg-center bg-no-repeat lg:bg-cover lg:bg-center lg:bg-no-repeat lg:rounded-lg shadow-2xl hidden lg:block"
    style={{ width: '400px', height: '476px', backgroundImage: `url('${cover}')` }}
  ></div>


      {/* Image from: http://unsplash.com/photos/MP0IUfwrn0A */}
    </div>
    {/* Pin to top right corner */}
    {/* <div className="absolute top-0 right-0 h-12 w-18 p-4">
      <button className="js-change-theme focus:outline-none">🌙</button>
    </div> */}
  </div>
</>
      
      {/* <ProfilePage /> */}
      {/* Buttons for smaller screens */}
      
      <div id='unityContainer1' className="flex mt-[-1.51rem]">

        {/* Content Section */}
        
        <div className={`${showSidebar ? "ml-1/5" : ""} w-full p-8`}>
          <br />
          {activeLink === SidebarLink.Feed && (
            <>
                <h2 className="text-xl font-bold text-gray-800">Object discussion</h2><br />
              {planetPosts?.length > 0 &&
                planetPosts.map((post) => (
                  <PlanetPostCard key={post.id} {...post} id={post.id} planets2={planetId} comments={post.comments} />
                ))}
            </>
          )}
          {activeLink === SidebarLink.Demo && (
            <div id="unityContainer">
                <h2 className="text-xl font-bold text-gray-800">Unity build</h2><br /><Card noPadding={false}>
              <div>{loadUnityComponent && planetData?.temperature <= 300 && <UnityBuildLod11 />}</div>
              <div>{loadUnityComponent && planetData?.temperature >= 300 && <UnityBuildLod1 />}</div>
              {session?.user?.id == "cebdc7a2-d8af-45b3-b37f-80f328ff54d6" && ( <><iframe src="https://flask-8gn2.onrender.com/" height="50%" width="100%" /><iframe src="https://flask-8gn2.onrender.com/input" height="50%" width="100%" /> {/* <YourComponent /> */} <LightkurveForm /> </> )}
              <br /><br /><br /><br /></Card>
            </div>
          )}
          {activeLink === SidebarLink.Data && (
            <>
              <h2 className="text-xl font-bold text-gray-800">Lightkurve graphs</h2><br />
              <Card noPadding={false}>
                {planetData?.deepnote ? (
                  <>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 items-center">
                      <div>
                        <h3 className="text-l font-bold text-gray-800">Binned data</h3>
                        <img src={planetBinned} alt="Planet Cover" className="w-full sm:w-auto" />
                      </div>
                      <div>
                        <h3 className="text-l font-bold text-gray-800">Phase folded data</h3>
                        <img src={planetPhased} alt="Planet Cover" className="w-full sm:w-auto" />
                      </div>
                    </div>
                    <br />
                    <center><iframe title="Embedded cell output" src={planetData?.deepnote} height="650" width="60%" /></center>
                  </>
                ) : (
                  <img src={cover} alt="Planet Cover" className="" />
                )}
              </Card>
            </>
          )}
          {activeLink === SidebarLink.Visit && (
            <>
              <PostCard
                planetImage='https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Kepler-22b.jpg/1200px-Kepler-22b.jpg'
                time='11 July 2023'
                user={profile?.username}
                planet={planetData?.content}
                comment='Generated by Liam'
              />
            </>
          )}
        </div>
      </div>
    </CoreLayout>
  );
}