import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import ContentPlaceholder, { ActivateButton } from "../PlanetData/ContentPlaceholder";

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
      <div className="h-screen relative z-10">
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
            {index === 2 && (
              <img
                src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/69/Kepler22.png"
                alt="Telescope Icon"
                className="w-8 h-8 absolute bottom-20 left-8 transform"
              />
            )}
            {index === 2 && (
              <img
                src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/72/Trappist.png"
                alt="Telescope Icon"
                className="w-20 h-16 absolute bottom-1 right-2 transform -translate-x-1/2 -translate-y-1/2"
              />
            )}
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
    const ringSizeFactor = 1.4; // Start rings around 2 times the size of the planet image
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
                  className="w-12 h-12 absolute top-8 left-12 transform -translate-x-1/2 -translate-y-1/2"
                />
              )}
              {index === 1 && (
                <img
                  src="https://github.com/Signal-K/client/blob/FCDB-21/public/assets/Inventory/Items/AeroCameraLevel1NoBg.png?raw=true"
                  alt="Telescope Icon"
                  className="w-12 h-12 absolute bottom-14 right-4 transform -translate-x-1/2 -translate-y-1/2"
                />
              )}
              {index === 2 && (
                <img
                  src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/69/Kepler22.png"
                  alt="Telescope Icon"
                  className="w-12 h-12 absolute bottom-0.6 left-80 transform"
                />
              )}
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

export function BasePlanetData ({ planetId }) { // Repurpose/rename syntax for generic anomalies/non-base entities
  const supabase = useSupabaseClient();
  const session = useSession();

  const [basePlanetData, setBasePlanetData] = useState(null);

  useEffect(() => {
    const fetchPlanetData = async () => {
      if (!planetId || !planetId.id) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from('basePlanets')
          .select(
            // 'id, content, ticId, type, radius, mass, density, gravity, temperatureEq, temperature, smaxis, orbital_period, classification_status, avatar_url, deepnote' // Add starsystems value & moons, items down the line (including instances of planets)
            
          )
          .eq('id', planetId.id);

        if (error) {
          console.error('Error fetching planet data:', error.message);
          return;
        }

        setBasePlanetData(data[0]);
      } catch (error) {
        console.error('Error fetching planet data:', error.message);
      }
    };

    fetchPlanetData();
  }, [session, planetId]);

  // Scaffolding for mobile/desktop formats (in current interim state)

  if (!basePlanetData) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <p>ID: {basePlanetData.id}</p>
      <p>Temperature: {basePlanetData.temperature}</p>
      {/* <ActivateButton planetIdDeepnote={basePlanetData.deepnote} /> */}
      {/* <ContentPlaceholder planetIdDeepnote='https://embed.deepnote.com/f8de697b-ba49-4014-b2b2-fe5f4cc3c026/3c7a3d159d33438fae3b08ca3e5aa88e/9a872bcf31674fcf8f46c75daf205168?height=564.1875' /> */}
      <center><iframe src={basePlanetData.deepnote} height='659' width='80%' /></center>
    </div>
  )
}

export function EditableBasePlanetData({ planetId }) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [basePlanetData, setBasePlanetData] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchPlanetData = async () => {
      if (!planetId || !planetId.id) {
        return;
      }

      try {
        const { data, error } = await supabase
          .from('basePlanets')
          .select('*') // Fetch all columns
          .eq('id', planetId.id);

        if (error) {
          console.error('Error fetching planet data:', error.message);
          return;
        }

        setBasePlanetData(data[0]);
      } catch (error) {
        console.error('Error fetching planet data:', error.message);
      }
    };

    fetchPlanetData();
  }, [session, planetId]);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedData({ ...basePlanetData }); // Copy the original data for editing
  };

  const handleSaveClick = async () => {
    try {
      // Update the row in the 'basePlanets' table
      const { error } = await supabase
        .from('basePlanets')
        .update(editedData)
        .eq('id', planetId.id);

      if (error) {
        console.error('Error updating planet data:', error.message);
        return;
      }

      // Update local state and exit edit mode
      setBasePlanetData(editedData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating planet data:', error.message);
    }
  };

  const handleChange = (e) => {
    // Update the edited data when input values change
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  if (!basePlanetData) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {isEditing ? (
        <>
          {Object.keys(editedData).map((key) => (
            <div key={key}>
              <label>{key}:</label>
              <input
                type="text"
                name={key}
                value={editedData[key]}
                onChange={handleChange}
              />
            </div>
          ))}
          <button onClick={handleSaveClick}>Save</button>
        </>
      ) : (
        // View mode: Display current data and edit button
        <>
          <p>ID: {basePlanetData.id}</p>
          <p>Temperature: {basePlanetData.temperature}</p>
          <button onClick={handleEditClick}>Edit</button>
        </>
      )}
    </div>
  );
}