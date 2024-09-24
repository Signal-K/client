import { useActivePlanet } from "@/context/ActivePlanet";
import { useProfileContext } from "@/context/UserProfile";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mission } from "../components/(structures)/StructuresForMission";

interface UserProfile {
  username: string;
  full_name: string;
  location: number;
  id: string;
  avatar_url: string;
  faction: string;
};

interface User {
  id: string;
  username: string;
  full_name: string;
  location: number;
};

export function ProfileCard() {
  const supabase = useSupabaseClient();
  const session = useSession();
  const [profile, setProfile] = useState({
    id: '',
    username: '',
    full_name: '',
    avatar_url: '',
    location: '',
  });
  const [missions, setMissions] = useState<Mission[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url, location')
          .eq('id', session.user.id)
          .single();
        if (error) {
          console.error('Error fetching profile:', error.message);
        } else {
          setProfile(data || {});
        }
      }
    };

    const fetchMissions = async () => {
      const res = await fetch('/api/gameplay/missions');
      const data = await res.json();
      setMissions(data); 
    };

    fetchProfile();
    fetchMissions();
  }, [session]);

  const handleFieldChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Update the user's profile in the database
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', session?.user?.id);
      if (profileError) {
        throw profileError;
      }

      // Mark mission 2 as complete
      const missionId = 2;
      const mission = missions.find(m => m.id === missionId);
      if (mission) {
        const missionData = {
          user: session?.user?.id,
          time_of_completion: new Date().toISOString(),
          mission: missionId,
        };

        const { error: missionError } = await supabase
          .from('missions')
          .insert([missionData]);
        if (missionError) {
          throw missionError;
        }

        if (mission.rewards && mission.rewards.length > 0) {
          const inventoryData = {
            item: mission.rewards[0],
            owner: session?.user?.id,
            quantity: 1,
            notes: `Reward for completing mission ${missionId}`,
            parentItem: null,
            time_of_deploy: new Date().toISOString(),
            anomaly: null,
          };

          const { error: inventoryError } = await supabase
            .from('inventory')
            .insert([inventoryData]);
          if (inventoryError) {
            throw inventoryError;
          }
        } else {
          console.error(`No rewards found for mission ${missionId}`);
        }
      }

    } catch (error: any) {
      console.error('Error updating profile:', error.message);
    }
  };

  return (
    <div className="flex items-center h-screen w-full justify-center">
      <div className="max-w-xs">
        <div className="bg-white shadow-xl rounded-lg py-3">
          <div className="photo-wrapper p-2">
            <img className="w-32 h-32 rounded-full mx-auto" src={profile.avatar_url} alt={profile.username} />
          </div>
          <div className="p-2">
            <h3 className="text-center text-xl text-gray-900 font-medium leading-8">{profile.username}</h3>
            <div className="text-center text-gray-400 text-xs font-semibold">
              <p>{profile.full_name}</p>
            </div>
            <table className="text-xs my-3">
              <tbody>
                <tr>
                  <td className="px-2 py-2 text-gray-500 font-semibold">Location</td>
                  <td className="px-2 py-2">{profile.location}</td>
                </tr>
              </tbody>
            </table>
            <form onSubmit={saveProfile}>
              <label>
                Username:
                <input
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleFieldChange}
                />
              </label>
              <label>
                Full Name:
                <input
                  type="text"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleFieldChange}
                />
              </label>
              <label>
                Avatar URL:
                <input
                  type="text"
                  name="avatar_url"
                  value={profile.avatar_url}
                  onChange={handleFieldChange}
                />
              </label>
              <label>
                Location:
                <input
                  type="text"
                  name="location"
                  value={profile.location}
                  disabled // Location is not editable
                />
              </label>
              <button type="submit">Save</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};