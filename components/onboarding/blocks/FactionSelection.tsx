import { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

const FactionSelect: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);

  // Define faction options and their corresponding image URLs
  const factions = [
    { name: 'Cartographer', icon: 'https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/media/factions/cartographer.png' },
    { name: 'Guardian', icon: 'https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/media/factions/guardian.png' },
    { name: 'Navigator', icon: 'https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/media/factions/navigator.png' },
  ];

  useEffect(() => {
    // Fetch the user's current faction from the database and set it in the state
    async function fetchFaction() {
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('faction')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user faction:', error);
        }

        if (data) {
          setSelectedFaction(data.faction);
        }
      }
    }

    fetchFaction();
  }, [session]);

  const handleFactionSelect = async (factionName: string) => {
    if (session?.user) {
      // Update the user's faction in the database
      const { error } = await supabase
        .from('profiles')
        .update({ faction: factionName })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating user faction:', error);
      } else {
        setSelectedFaction(factionName);
      }
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 text-center">
      {factions.map((faction) => (
        <div key={faction.name}>
          <img src={faction.icon} alt={faction.name} className="w-24 h-24 mx-auto" />
          <p className="text-xl mt-2">{faction.name}</p>
          <button
            onClick={() => handleFactionSelect(faction.name)}
            disabled={selectedFaction === faction.name}
            className={`bg-blue-500 text-white px-4 py-2 rounded ${
              selectedFaction === faction.name ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {selectedFaction === faction.name ? 'Selected' : 'Select'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default FactionSelect;