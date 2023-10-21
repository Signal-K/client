import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

export default function IndividualBasePlanet({ id }: { id: string }) {
  const router = useRouter();

  const supabase = useSupabaseClient();
  const session = useSession();

  const [planetData, setPlanetData] = useState(null);
  const [planetPosts, setPlanetPosts] = useState([]);
  const { id: planetId } = router.query;
  const [hasPlanetInInventory, setHasPlanetInInventory] = useState(false);
  const [inventoryPlanetId, setInventoryPlanetId] = useState<string | null>(
    null
  );
  const [sectors, setSectors] = useState([]);

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

  useEffect(() => {
    if (planetId) {
      getPlanetData();
      fetchPostsForPlanet(id);
    //   fetchSectorsForPlanet();
      checkUserInventory();
    }
  }, [session]);

  const getPlanetData = async () => {
    try {
      const { data, error } = await supabase
        .from("basePlanets")
        .select("*")
        .eq("id", planetId)
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
        .select(
          "id, content, created_at, media, profiles(id, avatar_url, username)"
        )
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
  }

  const { content, avatar_url, type, deepnote, cover } = planetData;

  async function checkUserInventory() {
    if (!session || !planetId) {
      return;
    }

    const { data, error } = await supabase
      .from("inventoryPLANETS")
      .select()
      .eq("planet_id", planetId)
      .eq("owner_id", session?.user?.id);

    if (error) {
      console.error("Error checking user inventory:", error);
      return;
    }

    if (data.length > 0) {
      setHasPlanetInInventory(true);
      setInventoryPlanetId(data[0].id);
    }
  }

//   async function fetchSectorsForPlanet() {
//     try {
//       const { data, error } = await supabase
//         .from("basePlanetsSECTORS")
//         .select("*");

//       setSectors(data);

//       if (error) {
//         console.error("Error fetching sectors data:", error.message);
//         return;
//       }

//       setSectors(data);
//       console.log(data);
//     } catch (error) {
//       console.error(error);
//     }
//   }

  const rings = [2, 3, 4];
  const planetSizeMobile = 8; // 8% of the screen size
  const planetSizeDesktop = 14; // 14% of the screen size
  const ringSizeFactor = 2.12; // Start rings around 2 times the size of the planet image
  const ringCount = 3; // Number of rings

  return (
      <div className="h-screen relative">
        {/* Background Styles */}
        <style jsx global>
          {`
        body {
          background: url('/garden.png') center/cover;
          );
        }
        @media only screen and (max-width: 1000px) {
          body {
            background: url('/void.png') center/cover;
          }
        }
        @media only screen and (max-width: 767px) {
            .planet-heading {
              color: white;
              font-size: 24px;
              text-align: center;
              margin-bottom: 10px;
            }
      `}
        </style>
        <div className="bg-cover bg-center h-screen flex items-center justify-center relative">
          <div className="underline"></div>
          {/* {planetPosts?.length > 0 &&
          planetPosts.map((post) => (
            <CardForum key={post.id} {...post} />
          ))} */}

          {/* Rings */}
          {[...Array(ringCount)].map((_, index) => (
            <div
            key={index}
            className="absolute border-solid border-2 rounded-full"
            style={{
              width: `${
                ((planetSizeDesktop * ringSizeFactor * (index + 1)) / 100) *
                screenWidth
              }px`,
              height: `${
                ((planetSizeDesktop * ringSizeFactor * (index + 1)) / 100) *
                screenWidth
              }px`,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              border: `1px solid rgba(255, 255, 255, 0.5)`,
            }}
          >
            {index === 0 && (
              <img
                src="https://github.com/Signal-K/client/blob/CPW-8/public/assets/Inventory/Items/GoldenTelescopeLevel1noBg.png?raw=true"
                alt="Telescope Icon"
                className="w-12 h-12 absolute top-1 left-12 transform -translate-x-1/2 -translate-y-1/2"
              />
            )}
            {index === 1 && (
              <img
                src="https://github.com/Signal-K/client/blob/FCDB-21/public/assets/Inventory/Items/AeroCameraLevel1NoBg.png?raw=true"
                alt="Telescope Icon"
                className="w-12 h-12 absolute top-4 right-4 transform -translate-x-1/2 -translate-y-1/2"
              />
            )}
            {/* {index === 2 && (
              <img
                src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/69/Kepler22.png"
                alt="Telescope Icon"
                className="w-8 h-8 absolute bottom-12 left-8 transform"
              />
            )} */}
          </div>
          ))}

          <img
            src={avatar_url}
            alt="Planet Image"
            className={`w-2/12 h-2/12 sm:w-2/12 sm:h-2/12 object-contain z-20`}
            style={{
              zIndex: 20,
            }}
          />
        </div>
        {/* <p>{type}</p> */}
        {/* <div className="pt-10">
            <center><iframe title="Embedded cell output" src={deepnote} height="613.1875" width="80%"/></center>
        </div> */}
        {/* {hasPlanetInInventory && (
          <>
            <p>{inventoryPlanetId}</p>
            {/* <RoverGallerySingle inventoryPlanetId={inventoryPlanetId} />
            <PlanetSector sectors={sectors} /> */}
          {/* </>
        )} */}
      </div>
  );
};

export function IndividualBasePlanetDesktop({ id }: { id: string }) {
    const router = useRouter();
  
    const supabase = useSupabaseClient();
    const session = useSession();
  
    const [planetData, setPlanetData] = useState(null);
    const [planetPosts, setPlanetPosts] = useState([]);
    const { id: planetId } = router.query;
    const [hasPlanetInInventory, setHasPlanetInInventory] = useState(false);
    const [inventoryPlanetId, setInventoryPlanetId] = useState<string | null>(
      null
    );
    const [sectors, setSectors] = useState([]);
  
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
  
    useEffect(() => {
      if (planetId) {
        getPlanetData();
        fetchPostsForPlanet(id);
      //   fetchSectorsForPlanet();
        checkUserInventory();
      }
    }, [session]);
  
    const getPlanetData = async () => {
      try {
        const { data, error } = await supabase
          .from("basePlanets")
          .select("*")
          .eq("id", planetId)
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
          .select(
            "id, content, created_at, media, profiles(id, avatar_url, username)"
          )
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
    }
  
    const { content, avatar_url, type, deepnote, cover } = planetData;
  
    async function checkUserInventory() {
      if (!session || !planetId) {
        return;
      }
  
      const { data, error } = await supabase
        .from("inventoryPLANETS")
        .select()
        .eq("planet_id", planetId)
        .eq("owner_id", session?.user?.id);
  
      if (error) {
        console.error("Error checking user inventory:", error);
        return;
      }
  
      if (data.length > 0) {
        setHasPlanetInInventory(true);
        setInventoryPlanetId(data[0].id);
      }
    }
  
  //   async function fetchSectorsForPlanet() {
  //     try {
  //       const { data, error } = await supabase
  //         .from("basePlanetsSECTORS")
  //         .select("*");
  
  //       setSectors(data);
  
  //       if (error) {
  //         console.error("Error fetching sectors data:", error.message);
  //         return;
  //       }
  
  //       setSectors(data);
  //       console.log(data);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }
  
    const rings = [2, 3, 4];
    const planetSizeMobile = 8; // 8% of the screen size
    const planetSizeDesktop = 11;
    const ringSizeFactor = 1; // Start rings around 2 times the size of the planet image
    const ringCount = 3; // Number of rings
  
    return (
        <div className="h-screen relative">
          {/* Background Styles */}
          <style jsx global>
            {`
          body {
            background: url('/garden.png') center/cover;
            );
          }
          @media only screen and (max-width: 1000px) {
            body {
              background: url('/void.png') center/cover;
            }
          }
          @media only screen and (max-width: 767px) {
              .planet-heading {
                color: white;
                font-size: 24px;
                text-align: center;
                margin-bottom: 10px;
              }
        `}
          </style>
          <div className="bg-cover bg-center h-screen flex items-center justify-center relative">
            <div className="underline"></div>
            {/* {planetPosts?.length > 0 &&
            planetPosts.map((post) => (
              <CardForum key={post.id} {...post} />
            ))} */}
  
            {/* Rings */}
            {[...Array(ringCount)].map((_, index) => (
              <div
              key={index}
              className="absolute border-solid border-2 rounded-full"
              style={{
                width: `${
                  ((planetSizeDesktop * ringSizeFactor * (index + 1)) / 100) *
                  screenWidth
                }px`,
                height: `${
                  ((planetSizeDesktop * ringSizeFactor * (index + 1)) / 100) *
                  screenWidth
                }px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 10,
                border: `1px solid rgba(255, 255, 255, 0.5)`,
              }}
            >
              {index === 0 && (
                <img
                  src="https://github.com/Signal-K/client/blob/CPW-8/public/assets/Inventory/Items/GoldenTelescopeLevel1noBg.png?raw=true"
                  alt="Telescope Icon"
                  className="w-12 h-12 absolute top-1 left-12 transform -translate-x-1/2 -translate-y-1/2"
                />
              )}
              {index === 1 && (
                <img
                  src="https://github.com/Signal-K/client/blob/FCDB-21/public/assets/Inventory/Items/AeroCameraLevel1NoBg.png?raw=true"
                  alt="Telescope Icon"
                  className="w-12 h-12 absolute top-8 right-4 transform -translate-x-1/2 -translate-y-1/2"
                />
              )}
              {/* {index === 2 && (
                <img
                  src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/69/Kepler22.png"
                  alt="Telescope Icon"
                  className="w-8 h-8 absolute bottom-12 left-8 transform"
                />
              )} */}
            </div>
            ))}
  
            <img
              src={avatar_url}
              alt="Planet Image"
              className={`w-3/12 h-3/12 sm:w-4/13 sm:h-4/13 object-contain z-20`}
              style={{
                zIndex: 20,
              }}
            />
          </div>
          {/* <p>{type}</p> */}
          {/* <div className="pt-10">
              <center><iframe title="Embedded cell output" src={deepnote} height="613.1875" width="80%"/></center>
          </div> */}
          {/* {hasPlanetInInventory && (
            <>
              <p>{inventoryPlanetId}</p>
              {/* <RoverGallerySingle inventoryPlanetId={inventoryPlanetId} />
              <PlanetSector sectors={sectors} /> */}
            {/* </>
          )} */}
        </div>
    );
  };