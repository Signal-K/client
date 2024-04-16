import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { LayoutNoNav } from "../../components/_Core/Section/Layout";

export default function PlanetRingTestPage() { // This should actually be written as a component, not as a page, and then returned with the arguments when in mobile mode, but this doesn't really matter for the moment
    const supabase = useSupabaseClient();
    const session = useSession();

    const planetId = '2';
    const [planetData, setPlanetData] = useState<any>(null);
    const [screenWidth, setScreenWidth] = useState<number>(0); // State to store screenWidth

    useEffect(() => {
        if (planetId) {
            getPlanetData();
        }
    }, [session]);

    useEffect(() => {
        // This useEffect runs only on client side after the component mounts
        const handleResize = () => {
            setScreenWidth(window.innerWidth);
        };
        handleResize(); // Initial call to set the initial screenWidth
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []); // Empty dependency array ensures this effect runs only once after component mount

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
        } catch (error) {
            console.error(error.message);
        }
    };

    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });

    if (!planetData) {
        return <div>Loading...</div>;
    }

    const { avatar_url } = planetData;

    const planetSizeMobile = 8; // 8% of the screen size
    const planetSizeDesktop = 14; // 14% of the screen size
    const ringSizeFactor = 2.12; // Start rings around 2 times the size of the planet image
    const ringCount = 3; // Number of rings

    return (
        <LayoutNoNav>
            <div className="h-screen relative z-10">
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
                src="https://raw.githubusercontent.com/Signal-K/client/main/public/assets/Inventory/Items/AeroCameraLevel1NoBg.png"
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
      </div>
        </LayoutNoNav>
    );
};