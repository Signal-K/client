import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { EarthViewLayout } from "@/components/(scenes)/planetScene/layout";
import Navbar from "@/components/Layout/Navbar";
import ProfileSetupForm from "@/components/Account/ProfileSetup";

interface MissionConfig {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  points: number;
  internalComponent?: React.ElementType;
  color: string;
  action?: () => void;
  completedCount?: number;
};

interface MissionShellProps {
  missions: MissionConfig[];
  experiencePoints: number;
  level: number;
  currentChapter: number;
  maxUnlockedChapter: number;
  onPreviousChapter: () => void;
  onNextChapter: () => void;
};

const MissionShell = ({
  missions,
  experiencePoints,
  level,
  currentChapter,
  maxUnlockedChapter,
  onPreviousChapter,
  onNextChapter,
}: MissionShellProps) => {
  const supabase = useSupabaseClient();
  const session = useSession();
  
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(false);

  const [selectedMission, setSelectedMission] = useState<MissionConfig | null>(null);

  useEffect(() => {
    let ignore = false;
    async function getProfile() {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select(`username, full_name, avatar_url`)
        .eq("id", session?.user.id)
        .single();
  
      if (!ignore) {
        if (error) {
          console.warn(error);
        } else if (data) {
          setUsername(data.username);
          setFirstName(data?.full_name);
          setAvatarPreview(data?.avatar_url || "");
        }
      }
      setLoading(false);
    }
  
    if (session?.user?.id) {
      getProfile();
    }
  
    return () => {
      ignore = true;
    };
  }, [session, refresh]);  

  const renderMission = (mission: MissionConfig) => {
    const completedCount = mission.completedCount ?? 0;

    return (
      <div
        key={mission.id}
        className={`flex items-center p-6 rounded-2xl cursor-pointer${
          mission.id > 2
            ? "bg-[#74859A]"
            : mission.id < 3
            ? "bg-gray-000"
            : completedCount > 0
            ? "bg-gray-700"
            : ""
        }`}
        onClick={() => setSelectedMission(mission)}
      >
        <mission.icon className={`w-10 h-10 ${mission.color}`} />
        <div className="ml-4">
          <h2 className={`text-lg font-bold ${mission.color}`}>{mission.title}</h2>
          <p className={`text-sm ${mission.color}`}>{mission.description}</p>
          <p className={`text-sm ${mission.color}`}>Points: {mission.points}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs">Completed: {completedCount}</p>
          <p className="text-xl font-bold">{completedCount}</p>
        </div>
      </div>
    );
  };

  const pointsForNextChapter = currentChapter * 9;

  if (!firstName) {
    return (
      <EarthViewLayout>
        <ProfileSetupForm onProfileUpdate={() => setRefresh((prev) => !prev)} />
        <div></div>
      </EarthViewLayout>
    );
  };

  return (
    <div className="flex flex-col items-center bg-[#1D2833] text-white rounded-2xl shadow-lg p-6 w-full max-w-4xl mx-auto">
      {!selectedMission && (
        <>
          <div className="flex justify-between items-center w-full mb-6">
            <h1 className="text-xl font-bold">Chapter {currentChapter}</h1>
            <div className="flex space-x-4">
              <Button onClick={onPreviousChapter} disabled={currentChapter === 1}>
                Previous
              </Button>
              <Button
                onClick={onNextChapter}
                disabled={currentChapter === maxUnlockedChapter || experiencePoints < pointsForNextChapter}
              >
                Next
              </Button>
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 mb-6">
            <div
              className="bg-[#5FCBC3] h-4 rounded-full"
              style={{ width: `${(experiencePoints % 9) * 10.5}%` }}
            ></div>
          </div>
          <p className="text-sm text-center mb-6">
            Level {level} ({experiencePoints} points)
          </p>
          {currentChapter === 1 ? (
            <>
              <div className="bg-gray-700 p-6 rounded-2xl w-full mb-6">
                <div className="grid grid-cols-2 gap-4 w-full">
                  {missions.slice(0, 2).map((mission) => renderMission(mission))}
                </div>
              </div>
              <div className="grid gap-4 w-full mt-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                {missions.slice(2).map((mission) => renderMission(mission))}
              </div>
            </>
          ) : (
            <div className="grid gap-4 w-full mt-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              {missions.map((mission) => renderMission(mission))}
            </div>
          )}
        </>
      )}
      <AnimatePresence>
        {selectedMission && (
          <motion.div
            className="flex flex-col bg-[#1D2833] rounded-2xl p-6 w-full max-w-4xl mx-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedMission.title}</h3>
              <Button onClick={() => setSelectedMission(null)}>Back</Button>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-150px)]">
              {selectedMission.internalComponent && <selectedMission.internalComponent />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MissionShell;