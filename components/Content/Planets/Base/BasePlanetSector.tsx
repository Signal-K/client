import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Card from "../../../Card";
import RoverImageGallery, { RoverImage, RoverImageNoHandle } from "../PlanetData/RandomRoverImage";
import axios from "axios";
import { RoverContentPostForm } from "../../CreatePostForm";
import StructureComponent, { PlacedStructures } from "../Activities/StructureCreate";
import SectorItems from "../Sectors/SectorStructures";
import { SectorStructureOwned } from "../../Inventory/UserOwnedItems";
// import SectorStructures from "../Sectors/SectorStructures";

const AddResourceToInventory = ({ resource }) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddResource = async () => {
    setIsAdding(true);
    try {
      // Check if the user already has this resource in their inventory
      // const { data: existingResource, error } = await supabase
      //   .from('inventoryUSERS')
      //   .select('*')
      //   .eq('owner', session?.user?.id)
      //   .eq('item', resource)
      //   .single();

      // if (error) {
      //   throw error;
      // }

      let quantity = 1;

      // If the user already has this resource, increment the quantity
      // if (existingResource) {
      //   quantity = existingResource.quantity + 1;
      // }

      // Add the resource to the user's inventory
      const { error: insertError } = await supabase
        .from('inventoryUSERS')
        .upsert({
          owner: session?.user?.id,
          item: resource,//.id,
          quantity,
        });

      if (insertError) {
        throw insertError;
      }

      // Resource added successfully
      alert(`${resource.name} added to your inventory!`);
    } catch (error) {
      console.error('Error adding resource to inventory:', error.message);
      // Show error message or handle error appropriately
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddResource}
      disabled={isAdding}
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${isAdding ? 'cursor-not-allowed' : ''}`}
    >
      {isAdding ? 'Adding...' : 'Add to Inventory'}
    </button>
  );
};

export default function BasePlanetSector({ sectorid }: { sectorid: string }) {
  const router = useRouter();
  const { id: sectorId } = router.query;

  const supabase = useSupabaseClient();

  const [planetData, setPlanetData] = useState(null);
  const [sectorData, setSectorData] = useState(null);

  // Rover image data
    // useEffect(() => {
    //     // const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos?sol=${date}&api_key=${apiKey}`;
    //     const apiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/opportunity/photos?sol=181&api_key=${apiKey}`;

    //     axios.get(apiUrl)
    //         .then((response) => {
    //             if (response.data.photos && response.data.photos.length > 0) {
    //                 const firstImageMetadata = response.data.photos[0];
    //                 // setImageUrl(firstImageMetadata.img_src || '');
    //                 const firstImage = response.data.photos[0].img_src;
    //                 setImageUrl(firstImage);
    //                 const metadataText = JSON.stringify(firstImageMetadata, null, 2);
    //                 setImageMetadata(metadataText);
    //                 setMetadata(metadataText)
    //             } else {
    //                 setImageUrl('No images found for the given date & rover.');
    //                 setImageMetadata('No images found for the given date & rover' + JSON.stringify(response));
    //             }
    //         })
    //         .catch((error) => {
    //             setImageUrl('An error occurred while fetching the image');
    //             setImageMetadata('Error fetching image');
    //             console.error(error);
    //         });
    // }, [session]);

  const getPlanetData = async () => {
    if (!sectorData) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("basePlanets")
        .select("*")
        .eq("id", sectorData.id)
        .single();

      if (data) {
        setPlanetData(data);
      };

      console.log(data);

      if (error) {
        throw error;
      };
    } catch (error) {
      console.error(error.message);
    };
  };

  const getSectorData = async () => {
    try {
      const { data, error } = await supabase
        .from("basePlanetSectors")
        .select("*")
        .eq("id", sectorId)
        .single();

      if (data) {
        setSectorData(data);
      }

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (sectorId) {
        await getSectorData();
      };
    };

    fetchData();
  }, [sectorId]);

  if (!sectorData) {
    return (
        <div>Loading...</div>
    );
  };

  const {
    id,
    created_at,
    anomaly,
    owner,
    deposit,
    coverUrl,
    exploration_start_data,
    explored,
  } = sectorData;
  const { content } = planetData || {};

    // const [imageUrl, setImageUrl] = useState('');
    // const [metadata, setMetadata] = useState('');

    // const handleMetadataChange = (newMetadata: React.SetStateAction<string>, newImageUrl: React.SetStateAction<string>) => {
    //     setMetadata(newMetadata);
    //     setImageUrl(newImageUrl);
    // };

  // I think that sectors will have posts attributed to them via contentPLANETSECTORS -> following the IndividualBasePlanet.tsx fetch functions

  return (
    <>
      <Card noPadding={false}>
        <div
          className="flex-col justify-center mt-[-80px] bg-cover bg-center rounded-15"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1545243424-0ce743321e11?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")',
          }}
        >
          <div className="h-[80vh] flex flex-col items-center justify-center relative">
            <h1 className="text-center text-slate-300 text-opacity-100 font-['Inter'] tracking-[3.48px] mt-[-50px] mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white text-gray-400">
              Planet {sectorData?.anomaly}, Sector {id}
            </h1>
            <div className="w-full flex items-center justify-center">
              <img
                src={coverUrl}
                alt="Rover sector image"
                className="w-3/12 h-3/12 sm:w-4/11 sm:h-4/11 object-contain z-20 p-10 mb-2"
                style={{ zIndex: 20 }}
              />
            </div>
            <div className="flex items-start gap-8 mt-20">
              <div className="flex flex-col items-center justify-start gap-4">
                <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] tracking-[3.48px]">
                  Planet
                </div>
                <div className="text-center text-white text-opacity-90 text-[27.17px] font-medium font-['Inter']">
                  {planetData?.content || "Unknown"}, Sector {id}
                </div>
              </div>

              <div className="flex flex-col items-center justify-start gap-4">
                <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] uppercase tracking-[3.48px]">
                  Mineral deposit
                </div>
                <div className="text-center text-white text-opacity-90 text-[27.17px] font-medium font-['Inter']">
                  {deposit}
                </div>
              </div>

              <div className="flex flex-col items-center justify-start gap-4">
                <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] uppercase tracking-[3.48px]">
                  Exploration status
                </div>
                <div className="text-center text-white text-opacity-90 text-[27.17px] font-medium font-['Inter']">
                  {explored ? "Explored" : "Not Explored"}
                </div>
              </div>

              <div className="flex flex-col items-center justify-start gap-4">
                <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] uppercase tracking-[3.48px]">
                  Init date
                </div>
                <div className="text-center text-white text-opacity-90 text-[27.17px] font-medium font-['Inter']">
                  {created_at &&
                    new Date(created_at).toLocaleDateString("en-GB")}
                </div>
              </div>
            </div>
          </div>
          {/* {deposit && typeof deposit === "string" ? (
                <div>{deposit}</div>
            ) : (
                <div>{JSON.stringify(deposit)}</div>
            )} */}
        </div>
      </Card>
      <div>
        <Card noPadding={false}>
          <PlacedStructures sectorId={Number(sectorid)} />
          <AddResourceToInventory resource={deposit} />
          {/* <SectorItems planetSectorId={sectorid} /> */}
          <SectorStructureOwned sectorid={sectorid} />
          <p>{deposit}</p>
          <RoverImageNoHandle date='853' rover='opportunity' sectorNo={id} />
          <StructureComponent sectorId={sectorid} />
          {/* {imageUrl ? (
            <>
                <img src={imageUrl} alt="Rover image" />
                <RoverContentPostForm metadata={metadata} imageLink={imageUrl} sector={id} />
            </>
          ) : (
            <p>Loading...</p>
          )} */}
        </Card>
      </div>
    </>
  );
};