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
};

const PlanetGalleryWithSectors: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getPlanets();
  }, [session]);

  const getPlanets = async (): Promise<void> => {
    try {
      let query = supabase
        .from('basePlanets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      const { data, error } = await query;

      if (data != null) {
        setPlanets(data);
      }

      if (error) {
        throw error;
      }

      setLoading(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (!session) {
    return <Login />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {planets.map((planet) => (
        <Link legacyBehavior key={planet.id} href={`/planets/${planet.id}`}>
          <a className="sector-link">
            <div className="sector-square" style={{ backgroundImage: `url(${planet.avatar_url})` }} />
          </a>
        </Link>
      ))}
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
          border: 1px solid white;
          background-size: cover;
          background-position: center;
        }
      `}</style>
    </div>
  );
};


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

interface GardenProps {
  onClose: () => void;
}

export const Garden: React.FC<GardenProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Open the overlay when it mounts
  useEffect(() => {
    setIsOpen(true);
  }, []);

  // Close the overlay when the close button is clicked
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => onClose(), 300); // Call onClose after the animation completes (300ms)
  };

  return (
    <div className={`fixed inset-x-0 bottom-0 flex justify-center transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="bg-cover bg-center w-full sm:max-w-screen-lg sm:w-full max-h-96vh overflow-y-auto shadow-lg relative rounded-t-3xl">
        <div style={{ backgroundImage: `url('/garden.png')` }} className="bg-cover bg-center h-96vh flex items-center justify-center relative rounded-t-3xl">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 px-4 py-2 bg-gray-200 text-gray-800 rounded"
          >
            Close
          </button>
          <PlanetGalleryWithSectors />
        </div>
      </div>
    </div>
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