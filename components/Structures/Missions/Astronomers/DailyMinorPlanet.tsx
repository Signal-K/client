import { CheckIcon, RadioIcon, SpeakerIcon, TelescopeIcon } from "lucide-react";
import MissionShell from "../BasePlate";

const DailyMinorPlanetMissions = () => {
  const missions = [
    {
      id: 1,
      title: "Make an asteroid classification",
      description: "Use your telescope to look for an asteroid candidate.",
      icon: TelescopeIcon,
      points: 2,
      internalComponent: () => <div>Asteroid classification component here</div>, 
      color: "text-blue-500",
      action: () => {},
      completedCount: 10,
    },
    {
      id: 2,
      title: "Propose a Planet Type",
      description: "Make a comment proposing a planet type.",
      icon: RadioIcon,
      points: 1,
      internalComponent: () => <div>Planet type proposal component here</div>,
      color: "text-green-500",
      action: () => {},
      completedCount: 5,
    },
  ];

  return (
    <MissionShell
      missions={missions}
      experiencePoints={25}
      level={3}
      currentChapter={2}
    />
  );
};

export default DailyMinorPlanetMissions;