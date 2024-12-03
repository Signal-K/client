import { useState, useEffect } from 'react';
import { TopographicMap } from '../mining/topographic-map';
import { MineralDeposit } from '../mining/mineral-deposit-list';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/context/ActivePlanet';
import { TerrainMap } from '../mining/terrain-map';

type Landmark = {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  isOpen: boolean;
};

type Anomaly = {
    id: number;
    anomalytype: string;
    content: string | null;
    configuration: object | null;
};

export default function BigMap() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const [landmarks, setLandmarks] = useState<{ [anomalyId: string]: Landmark[] }>({});
  const [mineralDeposits, setMineralDeposits] = useState<MineralDeposit[]>([]);
  const [activeMap, setActiveMap] = useState<'2D' | '3D'>('2D');

  const [mentionedAnomalies, setMentionedAnomalies] = useState<Anomaly[]>([]);

  useEffect(() => {
    const fetchLandmarks = async () => {
      if (!session?.user?.id) return;
  
      try {
        // Fetch classifications for user to get anomalies they worked on
        const { data: classificationData, error: classificationError } = await supabase
          .from('classifications')
          .select('anomaly')
          .eq('author', session.user.id);
  
        if (classificationError) {
          console.error('Error fetching classifications:', classificationError);
          return;
        }
  
        const anomalyIds = classificationData?.map((c) => c.anomaly) || [];
        if (!anomalyIds.length) {
          console.log('No anomalies found for user.');
          setMentionedAnomalies([]);
          return;
        }
  
        // Fetch anomaly details
        const { data: anomaliesData, error: anomaliesError } = await supabase
          .from('anomalies')
          .select('*')
          .in('id', anomalyIds);
  
        if (anomaliesError) {
          console.error('Error fetching anomalies:', anomaliesError);
          return;
        }
        setMentionedAnomalies(anomaliesData || []);
  
        const landmarksByAnomaly: { [key: number]: Landmark[] } = {};
        for (const anomalyId of anomalyIds) {
          const { data: inventoryData, error: inventoryError } = await supabase
            .from('inventory')
            .select('id, item, quantity')
            .eq('owner', session.user.id)
            .eq('anomaly', anomalyId)
            .gt('quantity', 0);
  
          if (inventoryError) {
            console.error(`Error fetching inventory for anomaly ${anomalyId}:`, inventoryError);
            continue;
          }
  
          const res = await fetch('/api/gameplay/inventory');
          const items = await res.json();
  
          const structures = inventoryData
            ?.filter((inventoryItem) =>
              items.some(
                (item: { id: number; ItemCategory: string }) =>
                  item.id === inventoryItem.item && item.ItemCategory === 'Structure'
              )
            )
            .map((inventoryItem) => {
              const itemDetails = items.find((item: { id: number }) => item.id === inventoryItem.item);
              return {
                id: inventoryItem.id.toString(),
                name: itemDetails?.name || 'Unknown',
                description: itemDetails?.description || 'No description available',
                position: itemDetails?.position || { x: Math.random() * 100, y: Math.random() * 100 },
                isOpen: false,
              };
            });
  
          landmarksByAnomaly[anomalyId] = structures || [];
        }
  
        setLandmarks(landmarksByAnomaly);
      } catch (error) {
        console.error('Error fetching landmarks:', error);
      }
    };
  
    fetchLandmarks();
  }, [session, supabase]);  

  useEffect(() => {
    const fetchDepositsAndInventory = async () => {
      if (!session?.user?.id || !activePlanet?.id) {
        console.error("User or activePlanet is undefined.");
        return;
      };

      const { data: deposits, error: depositsError } = await supabase
        .from("mineralDeposits")
        .select("id, mineralconfiguration")
        .eq("owner", session?.user.id)
        .eq("anomaly", activePlanet?.id);
  
      if (depositsError) {
        console.error("Error fetching mineral deposits:", depositsError);
        return;
      }
  
      const formattedDeposits = deposits?.map((deposit, index) => ({
        id: `${deposit.id}-${index}`, // Ensure uniqueness
        name: deposit.mineralconfiguration.mineral || "Unknown",
        mineral: deposit.mineralconfiguration.mineral || "Unknown",
        amount: deposit.mineralconfiguration.quantity || 0,
        icon_url: deposit.mineralconfiguration.icon_url || "",
        level: deposit.mineralconfiguration.level || 1,
        uses: deposit.mineralconfiguration.uses || [],
        position: deposit.mineralconfiguration.position || { x: 50, y: 50 },
      }));
  
      setMineralDeposits(formattedDeposits || []);
  
      const { data: inventoryData, error: inventoryError } = await supabase
        .from("inventory")
        .select("id, item, quantity")
        .eq("owner", session?.user.id)
        .eq("anomaly", activePlanet?.id)
        .gt("quantity", 0);
  
      if (inventoryError) {
        console.error("Error fetching inventory:", inventoryError);
        return;
      }
  
      const res = await fetch('/api/gameplay/inventory');
      const items = await res.json();
  
      const structures = inventoryData
        ?.filter((inventoryItem) =>
          items.some(
            (item: { id: any; ItemCategory: string; }) =>
              item.id === inventoryItem.item &&
              item.ItemCategory === "Structure"
          )
        )
        .map((inventoryItem) => {
          const itemDetails = items.find(
            (item: { id: any; }) => item.id === inventoryItem.item
          );
          return {
            id: inventoryItem.id.toString(),
            name: itemDetails?.name || "Unknown",
            description: itemDetails?.description || "",
            amount: inventoryItem.quantity || 0,
            icon_url: itemDetails?.icon_url || "",
            locationType: itemDetails?.locationType || "Unknown",
          };
        });
    };
  
    fetchDepositsAndInventory();
  }, [session, activePlanet, supabase]);

  const [activeLandmark, setActiveLandmark] = useState<Landmark | null>(null);

  const handleLandmarkClick = (id: string) => {
    console.log("Landmark clicked:", id);
    const landmark = Object.values(landmarks).flat().find((l: Landmark) => l.id === id);
    if (landmark) {
      setActiveLandmark({ ...landmark, isOpen: true });
    }
  }; 

  const toggleMap = () => {
    setActiveMap((prev) => (prev === '2D' ? '3D' : '2D'));
    setLandmarks((prev) => ({ ...prev }));
    setActiveLandmark(null);
  };

  const closeModal = () => {
    if (activeLandmark) {
      setLandmarks((prevLandmarks) => {
        const updatedLandmarks = { ...prevLandmarks };
        if (activeLandmark) {
          updatedLandmarks[activeLandmark.id] = updatedLandmarks[activeLandmark.id]?.map((landmark) =>
            landmark.id === activeLandmark.id
              ? { ...landmark, isOpen: false }
              : landmark
          ) || [];
        }
        return updatedLandmarks;
      });      
      setActiveLandmark(null);
    }
  };  

  useEffect(() => {
    const fetchAnomaliesForUser = async () => {
      if (!session?.user?.id) {
        console.error("User is not authenticated.");
        return;
      }

      try {
        const { data: classificationData, error: classificationError } =
          await supabase
            .from("classifications")
            .select("anomaly")
            .eq("author", session.user.id);

        if (classificationError) {
          console.error("Error fetching classifications:", classificationError);
          return;
        }

        const anomalyIds = classificationData
          ?.map((classification) => classification.anomaly)
          .filter(Boolean); 

        if (!anomalyIds?.length) {
          console.log("No anomalies mentioned by the user.");
          setMentionedAnomalies([]);
          return;
        }

        // Fetch details for the mentioned anomalies
        const { data: anomaliesData, error: anomaliesError } = await supabase
          .from("anomalies")
          .select("*")
          .in("id", anomalyIds);

        if (anomaliesError) {
          console.error("Error fetching anomalies:", anomaliesError);
          return;
        }

        setMentionedAnomalies(anomaliesData || []);
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchAnomaliesForUser();
  }, [session, supabase]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="relative w-[90%] h-[90%] bg-gray-100 text-[#2C4F64] flex flex-col rounded-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-white shadow">
          <h2 className="text-2xl font-bold">Big Map</h2>
          <button
            onClick={toggleMap}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-200"
          >
            Switch to {activeMap === "2D" ? "3D" : "2D"} Map
          </button>
        </div>
        <div className="flex-grow grid grid-cols-3 gap-4 p-4 overflow-y-auto">
        {mentionedAnomalies.map((anomaly) => (
          <div
            key={anomaly.id}
            className="relative w-full h-60 bg-white rounded shadow-lg"
          >
            <p>{anomaly.id}</p>
            {activeMap === "2D" ? (
              <TopographicMap
                landmarks={landmarks[anomaly.id] || []}  // Pass the landmarks specific to this anomaly
                deposits={[]} // Replace with actual deposit data
                roverPosition={null}
                selectedDeposit={null}
                onLandmarkClick={() => {
                  console.log(`Clicked landmark on anomaly ${anomaly.id}`);
                }}
                onDepositSelect={() => {
                  console.log(`Selected deposit on anomaly ${anomaly.id}`);
                }}
              />
            ) : (
              <TerrainMap
                landmarks={landmarks[anomaly.id] || []}  // Pass the landmarks specific to this anomaly
                deposits={[]} // Replace with actual deposit data
                roverPosition={null}
                selectedDeposit={null}
                onLandmarkClick={() => {
                  console.log(`Clicked landmark on anomaly ${anomaly.id}`);
                }}
              />
            )}
          </div>
          ))}
        </div>
      </div>
    </div>
  );
};