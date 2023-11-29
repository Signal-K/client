import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function BasePlanetSector({ sectorid }: { sectorid: string }) {
    const router = useRouter();
    const { id: sectorId } = router.query;
  
    const supabase = useSupabaseClient();
    const session = useSession();
  
    const [sectorData, setSectorData] = useState(null);
    const [planetData, setPlanetData] = useState(null);

    const getPlanetData = async () => {
        if (!sectorData) { return null };
        try {
            const { data, error } = await supabase
                .from("basePlanets")
                .select("*")
                .eq('id', sectorData.id)
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
          .from('basePlanetSectors')
          .select('*')
          .eq('id', sectorId)
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
          await getPlanetData();
        }
      };
  
      fetchData();
    }, [sectorId]);
  
    if (!sectorData) {
      return <div>Loading...</div>;
    };
  
    const { id, anomaly, owner, deposit, coverUrl } = sectorData;
    const { content } = planetData || {};

    // I think that sectors will have posts attributed to them via contentPLANETSECTORS -> following the IndividualBasePlanet.tsx fetch functions

    return (
        <div className="flex-col justify-center p-5">
            <style jsx global> 
            {`
          body {
            background: url('https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?q=80&w=3027&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D') center/cover;
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
            <div className="h-screen flex flex-col items-center justify-center relative">
                <h1 className="text-center text-slate-300 text-opacity-100 font-['Inter'] tracking-[3.48px] mt-2 mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white text-gray-400">
                    Planet {planetData?.content}, Sector {id}
                </h1>
                <img
                    src={coverUrl}
                    alt="Rover sector image"
                    className={`w-4/12 h-4/12 sm:w-4/11 sm:h-4/11 object-contain z-20`}
                    style={{ zIndex: 20 }}
                />
                <div className="flex items-start gap-8 py-10">
  <div className="flex flex-col items-center justify-start gap-4">
    <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] tracking-[3.48px]">Mass</div>
    <div className="text-center text-white text-opacity-90 text-[27.17px] font-medium font-['Inter']">mE</div>
  </div>

  <div className="flex flex-col items-center justify-start gap-4">
    <div className="text-center text-slate-300 text-opacity-70 text-[21.73px] font-medium font-['Inter'] uppercase tracking-[3.48px]">Semi-Major Axis</div>
    <div className="text-center text-white text-opacity-90 text-[27.17px] font-medium font-['Inter']">AU</div>
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
    <div className="text-center text-white text-opacity-90 text-[27.17px] font-medium font-['Inter']">T</div>
  </div>
</div>
            </div>
            {deposit && typeof deposit === 'string' ? (
                <div>{deposit}</div>
            ) : (
                <div>{JSON.stringify(deposit)}</div>
            )}
        </div>
    );
};