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
  }, [planetPosts]);

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
      {/* Buttons for smaller screens */}
      {!showSidebar && (
          <div className="flex justify-around mb-8">
            <button
              onClick={() => handleSidebarLinkClick(SidebarLink.Feed)}
              className={`text-gray-800 p-2 ${
                activeLink === SidebarLink.Feed ? "font-bold" : ""
              }`}
            >
              Feed
            </button>
            <button
              onClick={() => handleSidebarLinkClick(SidebarLink.Demo)}
              className={`text-gray-800 p-2 ${
                activeLink === SidebarLink.Demo ? "font-bold" : ""
              }`}
            >
              Demo
            </button>
            <button
              onClick={() => handleSidebarLinkClick(SidebarLink.Data)}
              className={`text-gray-800 p-2 ${
                activeLink === SidebarLink.Data ? "font-bold" : ""
              }`}
            >
              Data
            </button>
            <button
              onClick={() => handleSidebarLinkClick(SidebarLink.Visit)}
              className={`text-gray-800 p-2 ${
                activeLink === SidebarLink.Visit ? "font-bold" : ""
              }`}
            >
              Visit
            </button>
          </div>
        )}
      <div id='unityContainer1' className="flex mt-[-1.51rem]">
        {/* Sidebar */}
        <div
        id='sidebarContainer'
        className={`flex ${
          showSidebar ? "fixed h-screen" : "flex-col items-center"
        } bg-gradient-to-b from-${gradientColor1} to-${gradientColor2} w-1/5 p-4`}
      ></div>
        <div className={`w-full md:w-1/5 md:block bg-gradient-to-b from-${gradientColor1} via-${gradientColor2} to-${gradientColor1} md:bg-gray-50 overflow-hidden fixed h-full md:h-auto md:relative md:flex md:flex-col md:justify-between md:space-y-8 ${!showSidebar && 'hidden'} ${screenWidth < 800 && 'hidden'}`}>
          <div className="h-64 relative">
            <img
              src={cover}
              alt="Planet Cover" // Note that the cover image should be cropped to a consistent size (if it isn't already)
              className="object-cover h-full w-full"
            />
            <img
              src={avatar_url}
              alt="Planet Avatar"
              className="absolute bottom-0 left-0 h-24 w-24 m-4 rounded-full border-4 border-white"
            />
          </div>
          <div className="px-4 py-8">
            <nav>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className={`flex items-center space-x-2 text-gray-800 ${
                      activeLink === SidebarLink.Feed ? "font-bold" : ""
                    }`}
                    onClick={() => handleSidebarLinkClick(SidebarLink.Feed)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M3 9l4-4 4 4m5 7l-4 4-4-4"></path>
                    </svg>
                    <span>Feed</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`flex items-center space-x-2 text-gray-800 ${
                      activeLink === SidebarLink.Demo ? "font-bold" : ""
                    }`}
                    onClick={() => handleSidebarLinkClick(SidebarLink.Demo)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                      <line x1="12" y1="6" x2="12" y2="11"></line>
                      <line x1="6" y1="16" x2="18" y2="16"></line>
                    </svg>
                    <span>Demo</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`flex items-center space-x-2 text-gray-800 ${
                      activeLink === SidebarLink.Data ? "font-bold" : ""
                    }`}
                    onClick={() => handleSidebarLinkClick(SidebarLink.Data)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                    <span>Data</span>
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className={`flex items-center space-x-2 text-gray-800 ${
                      activeLink === SidebarLink.Visit ? "font-bold" : ""
                    }`}
                    onClick={() => handleSidebarLinkClick(SidebarLink.Visit)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="9" y1="21" x2="9" y2="9"></line>
                    </svg>
                    <span>Visit</span>
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Content Section */}
        <div className={`${showSidebar ? "ml-1/5" : ""} w-full p-8`}>
          <center>
            <h1 className="text-2xl font-bold text-gray-800">{content}</h1>
            {session?.user?.id && ( <> <UserContext.Provider value={{profile}}><PostFormCardPlanetTag planetId2={planetId} onPost={() => fetchPostsForPlanet(planetId)} /></UserContext.Provider><br /> </> )}
          </center>
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
                <h2 className="text-xl font-bold text-gray-800">Unity build</h2><br />
              <button onClick={() => setLoadUnityComponent(true)}>View Planet</button>
              <div>{loadUnityComponent && planetData?.temperature <= 300 && <UnityBuildLod11 />}</div>
              <div>{loadUnityComponent && planetData?.temperature >= 300 && <UnityBuildLod1 />}</div>
              <br /><br /><br /><br />
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
                  <img src={planetCover} alt="Planet Cover" className="" />
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