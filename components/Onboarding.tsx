import { useActivePlanet } from "@/context/ActivePlanet";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useEffect, useState } from "react";
import { PlanetCard } from "./Content/Anomalies/PlanetData";

type Planet = {
  id: string;
  type: string;
  avatar_url: string;
  content: string;
};

type PickYourPlanetProps = {
  onPlanetSelect: (planetId: string) => void;
};

export default function PickYourPlanet({ onPlanetSelect }: PickYourPlanetProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet, setActivePlanet, updatePlanetLocation } = useActivePlanet();
  const [planetList, setPlanetList] = useState<Planet[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchPlanets() {
    try {
      setLoading(true);
      const { data: planetsData, error: planetsError } = await supabase
        .from("anomalies")
        .select("*")
        .order("id", { ascending: false })
        .eq("anomalytype", "planet");

      if (planetsData) {
        setPlanetList(planetsData);
      }

      if (planetsError) {
        console.error("Error fetching planets: ", planetsError);
      }
    } catch (error: any) {
      console.log("Error fetching planets data: ", error);
    } finally {
      setLoading(false);
    }
  }

  const handlePlanetSelect = async (planetId: string) => {
    try {
      await updatePlanetLocation(Number(planetId));

      const missionData = {
        user: session?.user?.id,
        time_of_completion: new Date().toISOString(),
        mission: 1,
        configuration: null,
        rewarded_items: null,
      };

      const { data: newMission, error: missionError } = await supabase
        .from("missions")
        .insert([missionData]);

      if (missionError) {
        throw missionError;
      }

      const inventoryData = {
        item: 29,
        owner: session?.user?.id,
        quantity: 1,
        notes: "Created upon the completion of mission 1",
        parentItem: null,
        time_of_deploy: new Date().toISOString(),
        anomaly: activePlanet?.id,
      };

      const { data: newInventoryEntry, error: inventoryError } = await supabase
        .from("inventory")
        .insert([inventoryData]);

      if (inventoryError) {
        throw inventoryError;
      }

      onPlanetSelect(planetId);
    } catch (error: any) {
      console.error("Error handling planet selection:", error.message);
    }
  };

  useEffect(() => {
    fetchPlanets();
  }, [session]);

  return (
    <section className="py-5 flex justify-center">
      <div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8">Step 1: Pick Your Planet</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            planetList.map((planet) => (
              <PlanetCard key={planet.id} planet={planet} onSelect={() => handlePlanetSelect(planet.id)} />
            ))
          )}
        </div>
      </div>
    </section>
  );
};

interface Anomaly {
  id: number;
  anomalytype: string;
  avatar_url: string;
}

export const PlanetGrid: React.FC = () => {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet, setActivePlanet, updatePlanetLocation } = useActivePlanet();

  const handlePlanetSelect = async (planetId: number) => {
    try {
      // Fetch the full details of the selected planet
      const { data: planetData, error: planetError } = await supabase
        .from('anomalies')
        .select('*')
        .eq('id', planetId)
        .single();

      if (planetError) {
        throw planetError;
      }

      if (!planetData) {
        throw new Error('Planet data not found');
      }

      await updatePlanetLocation(planetData);

      const missionData = {
        user: session?.user?.id,
        time_of_completion: new Date().toISOString(),
        mission: 1,
        configuration: null,
        rewarded_items: null,
      };

      const { data: newMission, error: missionError } = await supabase
        .from("missions")
        .insert([missionData]);

      if (missionError) {
        throw missionError;
      }

      const inventoryData = {
        item: 29,
        owner: session?.user?.id,
        quantity: 1,
        notes: "Created upon the completion of mission 1",
        parentItem: null,
        time_of_deploy: new Date().toISOString(),
        anomaly: planetData.id,
      };

      const { data: newInventoryEntry, error: inventoryError } = await supabase
        .from("inventory")
        .insert([inventoryData]);

      if (inventoryError) {
        throw inventoryError;
      }

      setActivePlanet(planetData); // Update the active planet in the context

    } catch (error: any) {
      console.error("Error handling planet selection:", error.message);
    }
  };

  useEffect(() => {
    const fetchAnomalies = async () => {
      const { data, error } = await supabase
        .from('anomalies')
        .select('id, anomalytype, avatar_url')
        .in('id', [1, 2, 3, 4, 5, 6])
        .eq('anomalytype', 'planet');

      if (error) {
        console.error(error);
      } else {
        setAnomalies(data);
      }
      setLoading(false);
    };

    fetchAnomalies();
  }, [supabase]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2">
      {anomalies.map((anomaly) => (
        <div
          key={anomaly.id}
          className="flex justify-center items-center p-1 cursor-pointer"
          onClick={() => handlePlanetSelect(anomaly.id)}
        >
          <img src={anomaly.avatar_url} alt={`Planet ${anomaly.id}`} className="w-24 h-24 object-cover" />
        </div>
      ))}
    </div>
  );
};

interface SectionProps {
  background: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ background, children }) => (
  <div
    className="flex items-center justify-center h-full w-full"
    style={{
      backgroundImage: background,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '100%',
      width: '100%',
    }}
  >
    {children}
  </div>
);

interface ResponsiveLayoutProps {
  leftContent: React.ReactNode;
  middleContent: React.ReactNode;
  rightContent: React.ReactNode;
};

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ leftContent, middleContent, rightContent }) => {
  return (
    <div className="min-h-screen h-screen w-screen">
      {/* Desktop Layout */}
      <div className="hidden md:flex md:flex-row h-full w-full">
        <div className="w-1/3 h-full">
          <Section background="url('https://images.unsplash.com/photo-1554050857-c84a8abdb5e2?q=80&w=3027&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')">
            {leftContent}
          </Section>
        </div>
        <div className="w-2/3 h-full">
          <Section background="url('https://cdn.cloud.scenario.com/assets/asset_un7QCUWx8HnH4bKqtjYs9XFs?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF91bjdRQ1VXeDhIbkg0YktxdGpZczlYRnM~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzIwMzk2Nzk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=rN0zru~9DMAHya9Vmw~NySElneuz43yi~~X1g-rYjusvuAv98fAZc78cL11SCtWZuVYfTg1es0h4LCvnGA8fWlug~UTKboDT4grVIMRL~o0UhVkDY3ZYEji8dzjSaUjewSHCOfMpJ3gSwXBxGOYV2EnBCan0z8sZPETQCNAqV-n6y2GndbkL~VOx2iSdDKQFO27sh-XQ7xsOZ8XFoD6iuOHILnLBNuFqng8Ak8pzPyQeU2Y51uA2WJbnUCRwv2vSJ4F~g1ATsthjhWs3OWiyr0x8EDxA483QYcTcOvB5Wdc8u0pyuewjqUtf9qNgn1Qn1GWCD3HfHLe~-adEZFok9Q__')">
            {middleContent}
          </Section>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="grid grid-cols-1 gap-4 md:hidden relative min-h-screen">
        <Section background="url('https://images.unsplash.com/photo-1554050857-c84a8abdb5e2?q=80&w=3027&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')">
          {leftContent}
        </Section>
        <Section background="url('https://cdn.cloud.scenario.com/assets/asset_g3k2hJwrN9TZGwzvA9tMwnSi?p=100&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9jZG4uY2xvdWQuc2NlbmFyaW8uY29tL2Fzc2V0cy9hc3NldF9nM2syaEp3ck45VFpHd3p2QTl0TXduU2k~cD0xMDAqIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzIwMzk2Nzk5fX19XX0_&Key-Pair-Id=K36FIAB9LE2OLR&Signature=Him5jIqdVzqb8Hua3qLfpxBg9PPuTx9lfyqSHP7C2xzaGpe2psRTYZqpW8noslbKZ8ghlhFi4ETYpGcLLnHuY71LDSZTOcvQWOWd-F4ePaj4bekU3H-ai08rwGPVeEAxJZzkFuEeY8BjR9UPt3yReXDRU19JMfP0KfMTmsputxPs5aq1aftz8aQhLfQVkHobgTOkCZ7lSf3YkoF4zKSDYFEKHthO5AwvwYQcvHZebhmzfQwnESX7LrroPoV1AKYw5yNq~jkItS3ic5KdjHMVepJFDYMgyGRWFli~zhKLoCmiOgwnOcEcjq87WAhH1lq9zMwiYr09WuUCuvi6Y5gKLw__')">
          {middleContent}
        </Section>
        <Section background="url('/path/to/right-image.jpg')">
          {rightContent}
        </Section>
      </div>
    </div>
  );
};