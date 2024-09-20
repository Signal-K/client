import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

function CreateSectorComponent({ planetId }) {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const createSector = async () => {
    if (!session?.user?.id) {
      return;
    }

    if (!planetId) {
      // User is not on a planet
      return;
    }

    // Generate random mineral deposits
    const depositCount = Math.floor(Math.random() * 5);
    const minerals = ['Gold', 'life', 'water', 'carbon', 'iron', 'hydrogen', 'energy', 'minerals'];
    const deposits = [];
    for (let i = 0; i < depositCount; i++) {
      const randomMineral = minerals[Math.floor(Math.random() * minerals.length)];
      deposits.push(randomMineral);
    }

    // Calculate cost (1 silfur for the first sector, and 1 additional silfur for each additional sector)
    const cost = 1 // + (1 * /* Replace with the number of sectors on the planet */);

    // Create the new sector
    setIsLoading(true);
    const { data, error } = await supabase.from('planetsssSECTORS').upsert([
      {
        ownerId: session.user.id,
        planetId: planetId,
        cost: cost,
        metadata: '',
        deposits: deposits,
        sectorImage: '', // Leave this blank for now
        images: {}, // Leave this blank for now
      },
    ]);

    setIsLoading(false);

    if (error) {
      console.error('Error creating sector:', error);
      // Handle the error here
    } else {
      console.log('Sector created:', data);
      // Handle success, e.g., show a success message
    }
  };

  return (
    <div>
      <button onClick={createSector} disabled={isLoading}>
        Create Sector
      </button>
    </div>
  );
}

export default CreateSectorComponent;