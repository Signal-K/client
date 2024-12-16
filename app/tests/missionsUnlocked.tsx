import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

interface InventoryItem {
  id: number;
  configuration: {
    "missions unlocked"?: string[];
    [key: string]: any; // Allow other properties in configuration
  };
}

const UserMissions = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [missions, setMissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    const fetchUserMissions = async () => {
      setLoading(true);
      setError(null);

      try {
        // Query inventory for items owned by the user and containing missions unlocked
        const { data, error } = await supabase
          .from("inventory")
          .select("id, configuration")
          .eq("owner", session.user.id)
          .not("configuration->missions unlocked", "is", null); // Ensure "missions unlocked" exists

        if (error) throw error;

        // Extract and deduplicate all "missions unlocked"
        const unlockedMissions = data
          ?.flatMap((item: InventoryItem) => item.configuration["missions unlocked"] || [])
          .filter((mission: string) => mission); // Filter out empty values

        const uniqueMissions = Array.from(new Set(unlockedMissions));

        setMissions(uniqueMissions);
      } catch (err) {
        console.error("Error fetching user missions:", err);
        setError("Failed to fetch missions. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserMissions();
  }, [session?.user, supabase]);

  if (!session?.user) return <p className="text-gray-400">Please log in to see your missions.</p>;

  if (loading) return <p className="text-gray-400">Loading missions...</p>;

  if (error) return <p className="text-red-500">{error}</p>;

  if (missions.length === 0) {
    return <p className="text-gray-400">No missions unlocked yet.</p>;
  }

  return (
    <div className="bg-gray-800 text-white rounded-lg p-6">
      <h1 className="text-xl font-bold mb-4">Missions Unlocked</h1>
      <ul className="list-disc pl-6">
        {missions.map((mission, index) => (
          <li key={index} className="mb-2">
            {mission}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserMissions;