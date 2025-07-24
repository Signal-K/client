'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/src/core/context/ActivePlanet';
import { Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button"; 
import { Dialog, DialogContent, DialogTrigger } from "@/src/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

interface InventoryItem {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  ItemCategory: string;
  locationType?: string;
}

export function UnownedSurfaceStructures() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { activePlanet } = useActivePlanet();

  const [unownedStructures, setUnownedStructures] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<InventoryItem | null>(null);

  const fetchStructures = useCallback(async () => {
    if (!session || !activePlanet) return;

    try {
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('item')
        .eq('owner', session.user.id)
        .eq('anomaly', activePlanet.id);

      if (inventoryError) throw inventoryError;

      const ownedIds = inventory.map(i => i.item);

      const res = await fetch('/api/gameplay/inventory');
      const allItems: InventoryItem[] = await res.json();

      const unowned = allItems.filter(item =>
        item.ItemCategory === 'Structure' &&
        (item.locationType === 'Surface' || item.locationType === 'Atmosphere') &&
        !ownedIds.includes(item.id)
      );

      setUnownedStructures(unowned);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Unable to load structures.');
    } finally {
      setLoading(false);
    }
  }, [session, activePlanet, supabase]);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  const addToInventory = async (structure: InventoryItem) => {
    if (!session || !activePlanet) return;

    try {
      const { error } = await supabase.from('inventory').insert([
        {
          owner: session.user.id,
          anomaly: activePlanet.id,
          item: structure.id,
          quantity: 1,
          configuration: { Uses: 1 },
        }
      ]);
      if (error) throw error;
      alert(`${structure.name} added to inventory.`);
      setOpen(false);
    } catch (err) {
      console.error('Insert error:', err);
      setError('Could not add structure.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (unownedStructures.length === 0) return null;

  return (
    <div className="relative">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="rounded-full p-4 bg-[#e5e9f0] text-[#2e3440] hover:bg-[#d8dee9] shadow-md">
            <Plus size={32} />
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-[95vw] sm:max-w-[90vw] max-h-[90vh] p-0 bg-[#eceff4] rounded-xl overflow-hidden">
          <AnimatePresence>
            {selectedStructure ? (
              <motion.div
                key="details"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 flex flex-col items-center text-center text-[#3b4252]"
              >
                <img src={selectedStructure.icon_url} alt={selectedStructure.name} className="w-64 h-64 mb-4 rounded-xl shadow" />
                <h2 className="text-2xl font-bold mb-2">{selectedStructure.name}</h2>
                <p className="text-md mb-6">{selectedStructure.description}</p>
                <Button
                  onClick={() => addToInventory(selectedStructure)}
                  className="bg-[#81a1c1] text-white hover:bg-[#88c0d0] px-6 py-2 rounded-md"
                >
                  Build
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-6 overflow-y-auto text-[#3b4252]"
              >
                {unownedStructures.map(structure => (
                  <button
                    key={structure.id}
                    onClick={() => setSelectedStructure(structure)}
                    className="bg-[#d8dee9] hover:bg-[#e5e9f0] p-4 rounded-lg shadow transition transform hover:scale-105 text-left"
                  >
                    <img src={structure.icon_url} alt={structure.name} className="w-20 h-20 mx-auto mb-2 rounded-md" />
                    <h3 className="font-semibold text-center mb-1">{structure.name}</h3>
                    <p className="text-sm text-center text-[#4c566a]">{structure.description}</p>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// import React, { useEffect, useState, useCallback } from 'react';
// import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
// import { useActivePlanet } from '@/context/ActivePlanet';
// import { Plus } from "lucide-react";
// import { Button } from "@/src/components/ui/button"; 
// import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
// import { motion, AnimatePresence } from "framer-motion";

// interface InventoryItem {
//     id: number;
//     name: string;
//     description: string;
//     icon_url: string;
//     ItemCategory: string;
//     locationType?: string;
// };

// export function UnownedSurfaceStructures() {
//     const supabase = useSupabaseClient();
//     const session = useSession();
//     const { activePlanet } = useActivePlanet();

//     const [unownedStructures, setUnownedStructures] = useState<InventoryItem[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [open, setOpen] = useState(false);
//     const [selectedStructure, setSelectedStructure] = useState<InventoryItem | null>(null);
//     const [fetchTrigger, setFetchTrigger] = useState(0); // Track changes for re-fetching

//     const fetchStructures = useCallback(async () => {
//         if (!session || !activePlanet) {
//             setLoading(false);
//             return;
//         };

//         try {
//             // const { data: researchedStructures, error: researchError } = await supabase
//             //     .from('researched')
//             //     .select('tech_type')
//             //     .eq('user_id', session.user.id);
            
//             // if (researchError) throw researchError;

//             // const researchedIds = researchedStructures.map((item: { tech_type: string }) => Number(item.tech_type));

//             const { data: userInventory, error: inventoryError } = await supabase
//                 .from('inventory')
//                 .select('item')
//                 .eq('owner', session.user.id)
//                 .eq('anomaly', activePlanet.id);

//             if (inventoryError) throw inventoryError;

//             const ownedItems = userInventory.map((item: { item: number }) => item.item);

//             const response = await fetch('/api/gameplay/inventory');
//             const inventoryItems: InventoryItem[] = await response.json();

//             const surfaceStructures = inventoryItems.filter(item =>
//                 item.ItemCategory === 'Structure' && item.locationType === 'Surface' // && researchedIds.includes(item.id)
//             );

//             const unowned = surfaceStructures.filter(structure => !ownedItems.includes(structure.id));

//             setUnownedStructures(unowned);
//         } catch (error) {
//             console.error('Error fetching structures:', error);
//             setError('Failed to load structures.');
//         } finally {
//             setLoading(false);
//         };
//     }, [session, activePlanet, supabase]);

//     useEffect(() => {
//         fetchStructures();
//     }, [fetchTrigger, fetchStructures]); // Re-fetch when fetchTrigger changes 

//     const addResearchStation = async () => {
//         if (!session || !activePlanet) return;

//         try {
//             const { error } = await supabase
//                 .from('inventory')
//                 .insert([
//                     {
//                         owner: session.user.id,
//                         anomaly: activePlanet.id,
//                         item: 3106,
//                         quantity: 1,
//                         configuration: { Uses: 1 },
//                     },
//                 ]);

//             if (error) throw error;

//             alert("You now have a Research Station in your inventory!");
//             setFetchTrigger(fetchTrigger + 1); // Trigger a re-fetch
//         } catch (error) {
//             console.error('Error adding research station: ', error);
//             setError('Failed to add the Research Station.');
//         };
//     };

//     const addToInventory = async (structure: InventoryItem) => {
//         if (!session || !activePlanet) return;

//         try {
//             const { error } = await supabase
//                 .from('inventory')
//                 .insert([
//                     {
//                         owner: session.user.id,
//                         anomaly: activePlanet.id,
//                         item: structure.id,
//                         quantity: 1,
//                         configuration: { Uses: 1 },
//                     },
//                 ]);

//             if (error) throw error;

//             alert(`${structure.name} has been added to the inventory.`);
//             setOpen(false);
//             setFetchTrigger(fetchTrigger + 1); // Trigger a re-fetch
//         } catch (error) {
//             console.error('Error adding to inventory:', error);
//             setError('Failed to add the structure to your inventory.');
//         };
//     };

//     if (loading) return <p>Loading...</p>;

//     if (unownedStructures.length === 0) {
//         return (
//             <div className="relative">
//                 <Dialog open={open} onOpenChange={setOpen}>
//                     <DialogTrigger asChild>
//                         <Button size="lg" className="rounded-full p-4 bg-[#1a1b26] text-[#a9b1d6] hover:bg-[#24283b] shadow-lg">
//                             <Plus size={36} />
//                         </Button>
//                     </DialogTrigger>
//                     <DialogContent className="max-w-full w-[18%] h-[18%] p-4 bg-[#1a1b26] text-[#a9b1d6] rounded-3xl shadow-lg">
//                         <DialogTitle></DialogTitle>
//                         <p className="text-center">Use the Research Station to research more structures.</p>
//                         <Button onClick={addResearchStation}>Add Research Station</Button>
//                     </DialogContent>
//                 </Dialog>
//             </div>
//         );
//     }

//     return (
//         <div className="relative">
//             <Dialog open={open} onOpenChange={setOpen}>
//                 <DialogTrigger asChild>
//                     <Button size="lg" className="rounded-full p-4 bg-[#1a1b26] text-[#a9b1d6] hover:bg-[#24283b] shadow-lg">
//                         <Plus size={36} />
//                     </Button>
//                 </DialogTrigger>
//                 <DialogContent className="max-w-full max-h-[90vh] w-full sm:w-[90vw] h-full sm:h-[90vh] p-0 bg-gradient-to-br from-[#1a1b26] via-[#292e42] to-[#565f89] rounded-3xl overflow-hidden">
//                     <AnimatePresence>
//                         {selectedStructure ? (
//                             <motion.div
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 className="relative h-full flex flex-col items-center justify-between p-8"
//                             >
//                                 <div className="text-center">
//                                     <img
//                                         src={selectedStructure.icon_url}
//                                         alt={selectedStructure.name}
//                                         className="w-64 h-64 mx-auto mb-6 rounded-lg shadow-lg"
//                                     />
//                                     <h2 className="text-3xl font-semibold mb-2 text-[#c0caf5]">{selectedStructure.name}</h2>
//                                     <p className="text-lg text-[#a9b1d6] mb-8">{selectedStructure.description}</p>
//                                 </div>
//                                 <Button
//                                     size="lg"
//                                     className="w-full max-w-md bg-[#7aa2f7] text-[#1a1b26] hover:bg-[#89b4fa]"
//                                     onClick={() => addToInventory(selectedStructure)}
//                                 >
//                                     Place
//                                 </Button>
//                             </motion.div>
//                         ) : (
//                             <motion.div
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 className="relative grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 h-full overflow-y-auto"
//                             >
//                                 {unownedStructures.map((structure) => (
//                                     <Button
//                                         key={structure.id}
//                                         variant="ghost"
//                                         className="h-auto p-4 bg-[#24283b]/70 hover:bg-[#414868]/80 rounded-2xl flex flex-col items-center text-center transition-all duration-300 ease-in-out transform hover:scale-105"
//                                         onClick={() => setSelectedStructure(structure)}
//                                     >
//                                         <img src={structure.icon_url} alt={structure.name} className="w-24 h-24 mb-2 rounded-lg shadow-md" />
//                                         <h3 className="text-lg font-semibold mb-1 text-[#c0caf5]">{structure.name}</h3>
//                                         <p className="text-xs text-[#a9b1d6]">{structure.description}</p>
//                                     </Button>
//                                 ))}
//                             </motion.div>
//                         )}
//                     </AnimatePresence>
//                 </DialogContent>
//             </Dialog>
//         </div>
//     );
// };