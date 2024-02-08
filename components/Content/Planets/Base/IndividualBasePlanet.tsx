import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import ContentPlaceholder, { ActivateButton } from "../PlanetData/ContentPlaceholder";
import Link from "next/link";

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
        fetchSectorsForPlanet();
        checkUserInventory();
      };
    }, [session, planetId]);
  
    const getPlanetData = async () => {
      try {
        const { data, error } = await supabase
          .from("basePlanets")
          .select("*")
          .eq("id", planetId)
          .single();
  
        if (data) {
          setPlanetData(data);
        };
  
        if (error) {
          throw error;
        };
      } catch (error: any) {
        console.error(error.message);
      };
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
  
    const { content, avatar_url, type, deepnote, cover, ticId, temperatureEq, smaxis, mass } = planetData;
  
    async function checkUserInventory() {
      if (!session || !planetId) {
        return;
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
            async function fetchSectorsForPlanet() {
              try {
                const { data, error } = await supabase
                  .from('basePlanetSectors')
                  .select('*')
                  .eq('anomaly', planetId)
                  .eq('owner', session?.user?.id);// session?.user?.id);
          
                if (error) {
                  console.assert('Error fetching sectors data:', error.message);
                  return;
                }

                console.assert(session?.user?.id + 'Hello');
                console.log(data);
          
                setSectors(data);
              } catch (error) {
                console.error(error);
              }
            }

      return (
        <div className="flex-col justify-center">
              <style jsx global>
                {`
                  body {
                    background: url('https://cdn.cloud.scenario.com/assets/W-75HHaTTKCFP_P51OMQVA?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9XLTc1SEhhVFRLQ0ZQX1A1MU9NUVZBP3A9MTAwKiIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTcxMDQ2MDc5OX19fV19&Key-Pair-Id=K36FIAB9LE2OLR&Signature=uKevl4LFfDomkvnHRbSQEjUjm5GC4eeTxD4xq-gGmt55GtBDaWe2HmcOcPDhh-2j9HqRKjBQXSjEJJMikk5wnxTMiYobp0l9K-M9WSnj-t6RPQVUpLzfy7foMSMwoMhGbsZ-pDDbyX9IMu-Q0yJKSEWhGsKXCmxv26UyV4qIMevDZvSbr3b8cFg6z90oliOi3DwROTswg9BHbk-iMTGm3vNgck4UIA5jerWXvojzH7y~zSHCtD2A4bkLv-eDOGyB3I~8LrfIDnE6bDgxbEgl2f1QRQl0N2HpDD6liXhgAZHmHGYjGFZv1ill4bHFKr5Ti7qQELGR1hax3sm9-he9tQ__') center/cover;
                  }
                  
                  @media only screen and (max-width: 767px) {
                    .planet-heading {
                      color: white;
                      font-size: 24px;
                      text-align: center;
                      margin-bottom: 10px;
                    }
                  }
        
                  @media only screen and (max-width: 767px) {
                    .planet-heading {
                      color: white;
                      font-size: 24px;
                      text-align: center;
                      margin-bottom: 10px;
                    }

                    .planet-stats {
                      display: none;
                    }
        
                    /* Adjusted image size for mobile */
                    .topographic-image {
                      max-width: 90%;
                      height: auto;
                    }
                  }
                `}
              </style>
              <div className="relative text-white h-screen w-full overflow-hidden">
      <h1 className="planet-heading text-center text-slate-300 text-opacity-100 font-['Inter'] tracking-[3.48px] mt-2 mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white text-gray-400">
        {content}
      </h1>
      <div className="planet-stats">
      <div className="h-screen flex flex-col items-center justify-center absolute top-20 left-0 right-0">
        <div className="flex items-start gap-8 top-20">
          <div className="flex flex-col items-center justify-start gap-4">
            <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] tracking-[3.48px]">Mass</div>
            <div className="text-center text-white text-opacity-90 text-[27.17px] font-medium font-['Inter']">{mass} mE</div>
          </div>

          <div className="flex flex-col items-center justify-start gap-4">
            <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] uppercase tracking-[3.48px]">Semi-Major Axis</div>
            <div className="text-center text-white text-opacity-90 text-[27.17px] font-medium font-['Inter']">{smaxis} AU</div>
          </div>

          <div className="flex flex-col items-center justify-start gap-4">
            <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] uppercase tracking-[3.48px]">Anomaly type</div>
            <div className="text-center text-white text-opacity-90 text-[27.17px] font-medium font-['Inter']">{type}?</div>
          </div>

          <div className="flex flex-col items-center justify-start gap-4">
            <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] uppercase tracking-[3.48px]">Eq. Temperature</div>
            <div className="text-center text-white text-opacity-90 text-[27.17px] font-medium font-['Inter']">{temperatureEq}°C</div>
          </div>

          <div className="flex flex-col items-center justify-start gap-4">
            <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] uppercase tracking-[3.48px]">TIC ID</div>
            <div className="text-center text-white text-opacity-90 text-[27.17px] font-medium font-['Inter']">{ticId}</div>
          </div>
        </div>
      </div>
    </div></div>
    {/* <div>
      <h1>Sectors on Planet {planetId}</h1>
      <div className="grid grid-cols-4 gap-4">
        {sectorData.map((sector) => (
          <div key={sector.id}>
            <p>Sector ID: {sector.id}</p>
            <p>Owner: {sector.owner}</p>
          </div>
        ))}
      </div>
    </div> */}
                {/* <img
                  alt="Planet Mycelium"
                  className="object-cover h-full w-full"
                  height="1080"
                  src="/placeholder.svg"
                  style={{
                    aspectRatio: "1920/1080",
                    objectFit: "cover",
                  }}
                  width="1920"
                /> */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-4 p-40 my-12">
                  <button className="justify-self-start self-start">
                    {/* <img
                      alt="Structure 1"
                      className="w-12 h-12"
                      height="50"
                      src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/TOI%20700.png"
                      style={{
                        aspectRatio: "50/50",
                        objectFit: "cover",
                      }}
                      width="50"
                    /> */}
                  </button>
                  <button className="justify-self-center self-start">
                    <img
                      alt="Structure 2"
                      className="w-24 h-24"
                      height="50"
                      src="/assets/Inventory/Structures/Telescope2.png"
                      style={{
                        aspectRatio: "50/50",
                        objectFit: "cover",
                      }}
                      width="50"
                    />
                  </button>
                  <button className="justify-self-end self-start">
                    {/* <img
                      alt="Structure 3"
                      className="w-12 h-12"
                      height="50"
                      src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/TOI%20700.png"
                      style={{
                        aspectRatio: "50/50",
                        objectFit: "cover",
                      }}
                      width="50"
                    /> */}
                  </button>
                  <button className="justify-self-start self-center">
                    <img
                      alt="Structure 4"
                      className="w-32 h-32"
                      height="50"
                      src="/assets/Inventory/Structures/TelescopeReceiver.png"
                      style={{
                        aspectRatio: "50/50",
                        objectFit: "cover",
                      }}
                      width="50"
                    />
                  </button>
                  <button className="justify-self-center self-center">
                    <img
                      alt="Structure 5"
                      className="w-96 h-96 topographic-image"
                      height="50"
                      src="/Galaxy/Mars.png"
                      style={{
                        aspectRatio: "50/50",
                        objectFit: "cover",
                      }}
                      width="50"
                    />
                  </button>
                  <button className="justify-self-end self-center">
                    {/* <img
                      alt="Structure 6"
                      className="w-12 h-12"
                      height="50"
                      src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/TOI%20700.png"
                      style={{
                        aspectRatio: "50/50",
                        objectFit: "cover",
                      }}
                      width="50"
                    /> */}
                  </button>
                  <button className="justify-self-start self-end">
                    {/* <img
                      alt="Structure 7"
                      className="w-12 h-12"
                      height="50"
                      src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/TOI%20700.png"
                      style={{
                        aspectRatio: "50/50",
                        objectFit: "cover",
                      }}
                      width="50"
                    /> */}
                  </button>
                  <button className="justify-self-center self-end">
                    {/* <img
                      alt="Structure 8"
                      className="w-12 h-12"
                      height="50"
                      src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/TOI%20700.png"
                      style={{
                        aspectRatio: "50/50",
                        objectFit: "cover",
                      }}
                      width="50" 
                    /> */}
                  </button>
                  <button className="justify-self-end self-end">
                    {/* <img
                      alt="Structure 9"
                      className="w-12 h-12"
                      height="50"
                      src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/71/TOI%20700.png"
                      style={{
                        aspectRatio: "50/50",
                        objectFit: "cover",
                      }}
                      width="50"
                    /> */}
                  </button>
                  {/* <div className="h-screen flex flex-col items-center justify-center relative">
                    <h1 className="text-center text-slate-300 text-opacity-100 font-['Inter'] tracking-[3.48px] mt-2 mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white text-gray-400">
                      Test
                    </h1>
                    <div className="w-[1169.62px] h-[735.77px] left-[415px] top-[343px] absolute">
                      <div className="w-[608px] h-[576px] left-[405px] top-[108px] absolute justify-center items-center inline-flex" />
                      <img className="w-[147.59px] h-[150.77px] left-0 top-[285px] absolute" src="https://github.com/Signal-K/client/blob/main/public/assets/Inventory/Items/AeroCameraLevel1NoBg.png?raw=true" />
                      <img className="w-[150px] h-[150px] left-[927px] top-[229.63px] absolute origin-top-left rotate-[-86.76deg]" src="https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/69/Kepler22.png" />
                    </div>
                    <img
                      src='https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/planets/69/Kepler22.png'
                      alt="Planet Image"
                      className={`w-4/12 h-4/12 sm:w-4/11 sm:h-4/11 object-contain z-20`}
                      style={{
                        zIndex: 20,
                      }} 
                    />
                    <div className="flex items-start gap-8">
                      <div className="flex flex-col items-center justify-start gap-4">
                        <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] tracking-[3.48px]">Mass</div>
                        <div className="text-center text-white text-opacity-90 text-[27.17px] font-medium font-['Inter']"> mE</div>
                      </div>
        
                      <div className="flex flex-col items-center justify-start gap-4">
                        <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] uppercase tracking-[3.48px]">Semi-Major Axis</div>
                        <div className="text-center text-white text-opacity-90 text-[27.17px] font-medium font-['Inter']"> AU</div>
                      </div>
        
                      <div className="flex flex-col items-center justify-start gap-4">
                        <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] uppercase tracking-[3.48px]">Anomaly type</div>
                        <div className="text-center text-white text-opacity-90 text-[27.17px] font-medium font-['Inter']">?</div>
                      </div>
        
                      <div className="flex flex-col items-center justify-start gap-4">
                        <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] uppercase tracking-[3.48px]">Eq. Temperature</div>
                        <div className="text-center text-white text-opacity-90 text-[27.17px] font-medium font-['Inter']">°C</div>
                      </div>
        
                      <div className="flex flex-col items-center justify-start gap-4">
                        <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] uppercase tracking-[3.48px]">TIC ID</div>
                        <div className="text-center text-white text-opacity-90 text-[27.17px] font-medium font-['Inter']"></div>
                      </div>
                    </div>
                  </div> */}
                </div>
                <div className="grid-container mb-24">
  {sectors.map((sector) => (
    <Link legacyBehavior key={sector.id} href={`/planets/sector/${sector.id}`}>
      <a className="sector-link">
        <div className="sector-square">
          {sector.coverUrl && (
            <img src={sector.coverUrl} alt="Sector Cover" className="sector-cover" />
          )}
        </div>
      </a>
    </Link>
  ))}
</div>

      <style jsx>{`
        .grid-container {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          grid-auto-rows: 1fr;
          gap: 10px;
          margin-top: 20px;
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1;
        }

        .sector-square {
          width: 100px;
          height: 100px;
          border: 1px solid black;
        }
      `}</style>
                </div>
          );
};