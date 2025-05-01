"use client";

import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

export default function MyLocationIds() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [locationIds, setLocationIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLocationIds() {
      if (!session) return;
      const { data, error } = await supabase
        .from("classifications")
        .select("id")
        .eq("author", session.user.id)
        .in("classificationtype", ["planet", "telescope-minorPlanet"]);

      if (!error && data) {
        setLocationIds(data.map((item) => item.id));
      }
      setLoading(false);
    }

    fetchLocationIds();
  }, [session]);

  if (loading) return <p>Loading IDs...</p>;
  if (locationIds.length === 0) return <p>No locations found.</p>;

  return <p>{locationIds.join(", ")}</p>;
};