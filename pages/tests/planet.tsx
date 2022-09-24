import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import DashboardLayout from "../../components/Tests/Layout/Dashboard";
import { PlanetPostCard } from "../../components/PostCard";
import PlanetAvatar from "../../components/Gameplay/Planets/PlanetAvatar";
import { UserContext } from "../../context/UserContext";
import { PostFormCardPlanetTag } from "../../components/PostFormCard";
import Card from "../../components/Card";
import UnityBuildLod1 from "../../components/Gameplay/Unity/Build/LOD-Rocky";
import UnityBuildLod11 from "../../components/Gameplay/Unity/Build/LOD-Water";
import UnityScreenshot from "../../components/Gameplay/Generator/UnityScreenshot";
import PostCard from "../../components/Posts/Postcards/Postcard";

enum SidebarLink {
  Feed,
  Demo,
  Data,
  Visit,
}

export default function PlanetPage({ id }: { id: string }) {
  const router = useRouter();

  const a = 'a';

  const supabase = useSupabaseClient();
  const session = useSession();

  const [planetData, setPlanetData] = useState(null);
  const [planetPosts, setPlanetPosts] = useState([]);
  const { id: planetId } = router.query; // Rename the variable to 'planetId'
  const [unityBuild, setUnityBuild] = useState(null);
  
  useEffect(() => {
    if (planetData?.temperature < 300) { setUnityBuild(1); };
    if (planetData?.temperature > 300) { setUnityBuild(2); };
  }, []);

  const [profile, setProfile] = useState(null);
  const [activeLink, setActiveLink] = useState(SidebarLink.Feed); // Track the active link
  const [showUnity, setShowUnity] = useState(false); // Track the visibility of Unity component
    const[loadUnityComponent, setLoadUnityComponent] = useState(false);

    const planetBinned = 'https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/' + id + '/binned.png';
    const planetPhased = 'https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/' + id + '/phase.png';
    const planetCover = 'https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/' + id + '/download.png';

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

  function fetchPostsForPlanet(planetId) {
    supabase
      .from("posts_duplicate")
      .select(
        "id, content, created_at, media, profiles(id, avatar_url, username)"
      )
      .eq("planets2", planetId)
      .order("created_at", { ascending: false })
      .then((result) => {
        setPlanetPosts(result.data);
      });
  }

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
    <DashboardLayout>
      <div id='unityContainer1' className="flex bg-gray-25 mt-[-1.51rem]">
        {/* Sidebar */}
        <div className="w-1/5 bg-gray-50 overflow-hidden fixed h-full">
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
        <div className="w-3/4 p-8 ml-auto">
          <center>
            <h1 className="text-2xl font-bold text-gray-800">{content}</h1>
            {session?.user?.id && ( <> <UserContext.Provider value={{profile}}><PostFormCardPlanetTag onPost={() => fetchPostsForPlanet(planetId)} /></UserContext.Provider><br /> </> )}
          </center>
          <br />
          {activeLink === SidebarLink.Feed && (
            <>
                <h2 className="text-xl font-bold text-gray-800">Object discussion</h2><br />
              {planetPosts?.length > 0 &&
                planetPosts.map((post) => (
                  <PlanetPostCard key={post.id} {...post} planets2={planetId} />
                ))}
            </>
          )}
          {activeLink === SidebarLink.Demo && (
            <div id="unityContainer">
                <h2 className="text-xl font-bold text-gray-800">Unity build</h2><br />
              <button onClick={() => setLoadUnityComponent(true)}>View Planet</button>
              <div>{loadUnityComponent && <UnityBuildLod1 />}</div>
              {/* {unityBuild === 1 && (
                <div>{loadUnityComponent && <UnityBuildLod11 />}</div>
              )}
              {unityBuild === 2 && (
                <div>{loadUnityComponent && <UnityBuildLod1 />}</div>
              )} */}
              <br /><br /><br /><br />
            </div>
          )}
          {activeLink === SidebarLink.Data && (<>
            <h2 className="text-xl font-bold text-gray-800">Lightkurve graph</h2><br />
            {/* <Card noPadding={false}>
              <img src={cover} height='500px' width='500px' alt="Planet Cover" className="" />
            </Card> */}
            <Card noPadding={false}>
            {planetData?.deepnote && (
  <div>
    <h3 className="text-l font-bold text-gray-800">Binned data</h3>
    <br />
    <img src={planetBinned} alt="Planet Cover" className="" />
    <br /><br />
    <h3 className="text-l font-bold text-gray-800">Phase folded data</h3>
    <br />
    <img src={planetPhased} alt="Planet Cover" className="" />
  </div>
)}
 {/* Add planetCover (download.png) */}
 {!planetData?.deepnote && (
    <img src={planetCover} alt="Planet Cover" className="" />
 )}
                <p>What does this mean?</p>
            </Card>
            <Card noPadding={false}>
            {/* <iframe title="Embedded cell output" src="https://embed.deepnote.com/b4c251b4-c11a-481e-8206-c29934eb75da/377269a4c09f46908203c402cb8545b0/2b82b4f1d68a4ca282977277e09df860?height=43" height="650" width="100%"/> Set this based on planet id/temperature */}
            <iframe title="Embedded cell output" src={planetData?.deepnote} height="650" width="100%"/>
            <p>{planetData?.temperature}</p>
            </Card></>
          )}
          {activeLink === SidebarLink.Visit && (
            <>
              <PostCard planetImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Kepler-22b.jpg/1200px-Kepler-22b.jpg'
        time = '11 July 2023'
        user = {profile?.username}
        planet = {planetData?.content}
        comment = 'Generated by Liam'/>
            </>
          )}
          <div><UnityScreenshot unityContainerId="unityContainer1" /></div>
        </div>
      </div>
    </DashboardLayout>
  ); // https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/51/download.png
}