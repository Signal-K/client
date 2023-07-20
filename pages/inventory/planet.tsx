import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import CoreLayout from "../../components/Core/Layout";
import Card from "../../components/Card";

export default function MyPlanetPage({ id }: { id: string }) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const router = useRouter();

  const { id: planetId } = router.query;
  const [planetData, setPlanetData] = useState(null);
  const [planetBaseData, setPlanetBaseData] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (planetId) {
      fetchPlanetData(planetId);
    }
  }, [planetId]);

  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    supabase
      .from("profiles")
      .select("*")
      .eq("id", session?.user?.id)
      .then((result) => {
        if (result.data.length) {
          setProfile(result.data[0]);
        }
      });
  }, [session?.user?.id]);

  const fetchPlanetData = async (planetId) => {
    try {
      const { data: planetInventoryData, error: planetInventoryError } = await supabase
        .from('inventoryPLANETS')
        .select('*')
        .eq('id', planetId)
        .single();

      if (planetInventoryError) {
        throw planetInventoryError;
      }

      setPlanetData(planetInventoryData);

      if (planetInventoryData) {
        const { data: planetBaseData, error: planetBaseError } = await supabase
          .from('planetsss')
          .select('*')
          .eq('id', planetInventoryData.planet_id)
          .single();

        if (planetBaseError) {
          throw planetBaseError;
        }

        setPlanetBaseData(planetBaseData);
      }
    } catch (error: any) {
      console.error(error.message);
    }
  };

  if (!session?.user?.id || !planetData) {
    return <CoreLayout>Not your planet</CoreLayout>;
  }

  if (session?.user?.id !== planetData.owner_id) {
    return <CoreLayout>Not your planet</CoreLayout>;
  }

  return (
    <CoreLayout>
      <p>{planetBaseData?.content}</p>
      <img src={planetBaseData?.cover} alt={`Planet ${planetData?.planet_id}`} />
      <p>{planetData?.planet_id}</p>
    </CoreLayout>
  );
}