import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { EarthViewLayout } from "@/src/components/ui/scenes/planetScene/layout";
import Navbar from "@/src/components/layout/Navbar";
import Link from "next/link";
import ProfileSetupForm from "@/src/components/profile/setup/ProfileSetup";

interface MissionConfig {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  points?: number;
  slug?: string;
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
  tutorialMission?: MissionConfig;
};

const MissionShell = ({
  missions,
  experiencePoints,
  level,
  currentChapter,
  maxUnlockedChapter,
  onPreviousChapter,
  onNextChapter,
  tutorialMission,
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

  const getCardSpanClass = (index: number, total: number) => {
    if (total === 1) return "col-span-2 md:col-span-2 lg:col-span-4";
    if (total === 2) return "col-span-2 md:col-span-1 lg:col-span-2";
    if (total === 3 && index === 0) return "col-span-2 md:col-span-2 lg:col-span-2";
    return "";
  };

const renderMission = (mission: MissionConfig, index: number, total: number) => {
  const completedCount = mission.completedCount ?? 0;

  const cardContent = (
    <div
      key={mission.id}
      className={`bg-gradient-to-br from-[#E5EEF4] to-[#D8E5EC] shadow-md rounded-xl cursor-pointer p-4 aspect-square w-full max-w-full flex flex-col justify-between ${getCardSpanClass(index, total)}`}
    >
      <div className="flex items-start space-x-4">
        <mission.icon className={`w-10 h-10 ${mission.color}`} />
        <div>
          <h2 className="text-lg font-bold text-[#2E3440]">{mission.title}</h2>
          <p className="text-sm text-[#4C566A]">{mission.description}</p>
          {mission.points && (
            <p className="text-sm text-[#4C566A]">Points: {mission.points}</p>
          )}
        </div>
      </div>
      <div className="mt-4 text-right text-[#2E3440]">
        <p className="text-xs">Completed: {completedCount}</p>
        <p className="text-xl font-bold">{completedCount}</p>
      </div>
    </div>
  );

  // If it has a slug, make it a link
  if (mission.slug) {
    return (
      <Link key={mission.id} href={mission.slug}>
        {cardContent}
      </Link>
    );
  }

  // Otherwise, set as internal mission
  return (
    <div key={mission.id} onClick={() => setSelectedMission(mission)}>
      {cardContent}
    </div>
  );
}

  const renderTutorialMission = (mission: MissionConfig) => {
    return (
      <div
        key={mission.id}
        className={`bg-gradient-to-br from-[#E5EEF4] to-[#D8E5EC] shadow-md rounded-xl cursor-pointer p-4 aspect-square w-full max-w-[180px] flex flex-col justify-between`}
        onClick={() => setSelectedMission(mission)}
      >
        <div className="flex items-start space-x-4">
          <mission.icon className={`w-10 h-10 ${mission.color}`} />
          <div>
            <h2 className="text-lg font-bold text-[#2E3440]">{mission.title}</h2>
            <p className="text-sm text-[#4C566A]">{mission.description}</p>
          </div>
        </div>
      </div>
    );
  };

  const pointsForNextChapter = currentChapter * 9;

  if (!firstName) {
    return (
      <EarthViewLayout>
        <ProfileSetupForm onProfileUpdate={() => setRefresh((prev) => !prev)} />
          <></>
      </EarthViewLayout>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 text-white overflow-x-hidden">
      {!selectedMission && (
        <div className="flex flex-col w-full max-w-6xl">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-[#2E3440]">Chapter {currentChapter}</h1>
            <div className="flex space-x-4">
              <Button onClick={onPreviousChapter} disabled={currentChapter === 1}>
                Previous
              </Button>
              <Button
                onClick={onNextChapter}
                disabled={
                  currentChapter === maxUnlockedChapter ||
                  experiencePoints < pointsForNextChapter
                }
              >
                Next
              </Button>
            </div>
          </div>

          <div className="w-full bg-gray-300 rounded-full h-4 mb-2">
            <div
              className="bg-[#5FCBC3] h-4 rounded-full"
              style={{ width: `${(experiencePoints % 9) * 10.5}%` }}
            ></div>
          </div>

          <p className="text-sm text-center text-[#4C566A] mb-6">
            Level {level} ({experiencePoints} points)
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {missions.map((mission, idx) =>
              renderMission(mission, idx, missions.length)
            )}
          </div>

          {currentChapter === 1 && tutorialMission && (
            <div className="mt-6">{renderTutorialMission(tutorialMission)}</div>
          )}
        </div>
      )}

      <AnimatePresence>
        {selectedMission && (
          <motion.div
            className="flex flex-col rounded-2xl p-6 w-full max-w-5xl mx-auto h-full"
            style={{
              background: "linear-gradient(135deg, #E5EEF4, #D8E5EC)",
              color: "#2E3440",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedMission.title}</h3>
              <Button onClick={() => setSelectedMission(null)}>Back</Button>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-150px)]">
              {selectedMission.internalComponent && (
                <selectedMission.internalComponent />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MissionShell;