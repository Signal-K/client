import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Login from "../../../pages/login";
// import { GardenSidebar } from "../../Section/Sidebar";

interface Planet {
  id: string;
  content: string;
  avatar_url: string;
}

interface Props {
  planet: Planet;
  position: { top: number; left: number };
}

export function PlanetGalleryCard({ planet, position }: Props) {
  const { id, content, avatar_url } = planet;

  return (
    <Link legacyBehavior href={`/planets/${id}`}>
      <a style={{ position: "absolute", top: position.top, left: position.left }}>
        <img src={avatar_url} className="w-1/2" />
      </a>
    </Link>
  );
}

function ArchivedPlanetGalleryCard({ planet, position }: Props) {
  // const { id, content, cover } = planet;
  const { id, content } = planet;

  return (
    <Link legacyBehavior href={`https://starprotocol-og3j6xuus-gizmotronn.vercel.app/tests/planets/${id}`}>
      <a style={{ position: "absolute", top: position.top, left: position.left }}>
        {/* <img src={cover} className="w-1/2" /> */}
      </a>
    </Link>
  );
}

export default function PlanetGallery() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [planets, setPlanets] = useState<Planet[]>([]);

  useEffect(() => {
    getPlanets();
  }, [session]);

  const getPlanets = async (): Promise<void> => {
    try {
      let query = supabase
        // .from("planetsss")
        .from("basePlanets")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200)
        // .gte("id", 67)
        // .lt("id", 75);

      const { data, error } = await query;

      if (data != null) {
        setPlanets(data);
        console.log(planets);
      }

      if (error) {
        throw error;
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getRandomPosition = (): { top: number; left: number } => {
    const top = Math.floor(Math.random() * window.innerHeight);
    const left = Math.floor(Math.random() * window.innerWidth);
    return { top, left };
  };

  const buttonStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    border: "none",
    color: "black",
    transition: "background-color 0.3s ease",
    cursor: "pointer",
    marginRight: "8px",
  };

  const activeButtonStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  };

  if (!session) {
    return <Login />;
  }

  return (
    <>
      {planets.map((planet, index) => (
        <PlanetGalleryCard key={planet.id} planet={planet} position={getRandomPosition()} />
      ))}
    </>
  );
}

export function ArchivedPlanetGallery() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [planets, setPlanets] = useState<Planet[]>([]);

  useEffect(() => {
    getPlanets();
  }, [session]);

  const getPlanets = async (): Promise<void> => {
    try {
      let query = supabase
        .from("planetsss")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200)
        .gte("id", 1)
        .lt("id", 75);

      const { data, error } = await query;

      if (data != null) {
        setPlanets(data);
      }

      if (error) {
        throw error;
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getRandomPosition = (): { top: number; left: number } => {
    const top = Math.floor(Math.random() * window.innerHeight);
    const left = Math.floor(Math.random() * window.innerWidth);
    return { top, left };
  };

  const buttonStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    border: "none",
    color: "black",
    transition: "background-color 0.3s ease",
    cursor: "pointer",
    marginRight: "8px",
  };

  const activeButtonStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  };

  if (!session) {
    return <Login />;
  }

  return (
    <>
      {planets.map((planet, index) => (
        <ArchivedPlanetGalleryCard key={planet.id} planet={planet} position={getRandomPosition()} />
      ))}
    </>
  );
}

export const Garden: React.FC = () => {
  return (
    <>
      <div style={{ backgroundImage: `url('/garden.png')` }} className="bg-cover bg-center h-screen flex items-center justify-center relative">
        {/* <GardenSidebar /> */}
        <PlanetGallery />
      </div>
    </>
  );
};

export const ArchivedGarden: React.FC = () => {
  return (
    <>
      <div style={{ backgroundImage: `url('/garden.png')` }} className="bg-cover bg-center h-screen flex items-center justify-center relative">
        {/* <GardenSidebar /> */}
        <ArchivedPlanetGallery />
      </div>
    </>
  );
};