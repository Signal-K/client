import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

export default function BasePlanetSector({ id }: { id: string }) {
    const router = useRouter();
    const { id: sectorId } = router.query;
  
    const supabase = useSupabaseClient();
    const session = useSession();
  
    const [sectorData, setSectorData] = useState(null);
  
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
        }
      };
  
      fetchData();
    }, [sectorId]);
  
    if (!sectorData) {
      return <div>Loading...</div>;
    }
  
    const { anomaly, owner, deposit, coverUrl } = sectorData;

    // I think that sectors will have posts attributed to them via contentPLANETSECTORS -> following the IndividualBasePlanet.tsx fetch functions

    return (
        <div className="flex-col justify-center p-5">
            {deposit}
        </div>
    );
};