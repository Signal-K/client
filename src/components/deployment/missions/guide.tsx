import React, { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { CloudDrizzleIcon, LightbulbIcon, Telescope, ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabaseClient, useSession } from "@/src/lib/auth/session-context";
import JournalPage from "@/src/components/deployment/missions/structures/Stardust/Journal";
import MilestoneCard from "@/src/components/deployment/missions/structures/Milestones/MilestoneCard";

interface Mission {
  id: number;
  name: string;
  description: string;
  additionalDescription: string | React.ReactNode; 
  icon: React.ElementType;
  color: string;
  identifier: string;
};

const projects: Record<string, Mission[]> = {
  "Refracting Telescope": [
    { 
      id: 1, 
      name: "Planet Hunting", 
      description: "Click on the Telescope structure icon to rate different transit events and find planets.", 
      additionalDescription: "You'll work alongside other users to classify and verify planet candidates. Once they've been confirmed, you'll be able to visit them, determine their properties and start construction & exploration surveys.", 
      icon: Telescope, 
      color: "text-cyan-300", 
      identifier: "planet" 
    },
    { 
      id: 2, 
      name: "Asteroid Detection", 
      description: "Click on the Telescope structure icon to discover new asteroids in your telescope's data.", 
      additionalDescription: "Using the latest telescope data, you will identify potential asteroids that might pose a threat to the Earth or serve as future targets for exploration. Additionally, exo-asteroids can be discovered and tracked to identify their interactions with planets discovered in the Planet Hunters project", 
      icon: Telescope, 
      color: "text-green-300", 
      identifier: "asteroid" 
    },
    { 
      id: 3, 
      name: "Sunspot Observations", 
      description: "Click on the Telescope structure icon to keep track of our sun's health & electrical storms", 
      additionalDescription: "This mission requires monitoring sunspots and solar activity to understand how these phenomena affect space weather and our planet's magnetosphere. Sunspots can trigger electrical outages here on Earth (and on any planets in the firing line) - so we need to be prepared", 
      icon: Telescope, 
      color: "text-yellow-300", 
      identifier: "sunspot" 
    },
  ],
  Biodome: [
    { 
      id: 4, 
      name: "Wildwatch Burrowing Owls", 
      description: "Click on the Biodome structure icon to classify pictures of burrowing owls in captivity.", 
      additionalDescription: "Help track the health and behavior of burrowing owls by classifying pictures from the Biodome. You will analyze the owls' nesting and foraging behaviors.", 
      icon: LightbulbIcon, 
      color: "text-cyan-300", 
      identifier: "burrowingOwl" 
    },
    { 
      id: 5, 
      name: "Iguanas from Above", 
      description: "Count Galapagos Marine Iguanas from aerial photos that have been sent to your Biodome structure.", 
      additionalDescription: "Use aerial images to count and classify marine iguanas on the Galapagos Islands. This is important for conservation efforts to track their population.", 
      icon: LightbulbIcon, 
      color: "text-green-300", 
      identifier: "iguana" 
    },
  ],
  WeatherBalloon: [
    { 
      id: 6, 
      name: "Martian Cloud Survey", 
      description: "Use your Weather Balloon to identify clouds & cloud behaviour on Mars & Mars-like planets", 
      additionalDescription: "Analyze cloud patterns on Mars and other planets. This mission will involve classifying clouds based on their shape, size, and movement. We can use this information to understand more about the composition and climate cycle on these planets", 
      icon: CloudDrizzleIcon, 
      color: "text-blue-400", 
      identifier: "martianClouds" 
    },
    { 
      id: 7, 
      name: "Jovian Vortx Hunters", 
      description: "Classify storms & storm behaviour on gas giant planets using data collected in your Weather Balloon", 
      additionalDescription: "Study the massive storms on gas giants like Jupiter, tracking their movements and behaviors to understand their atmospheric dynamics, composition and climate.", 
      icon: CloudDrizzleIcon, 
      color: "text-yellow-400", 
      identifier: "jovianStorms" 
    },
  ],
};

const defaultMission: Mission = {
  id: 0,
  name: "Welcome to Star Sailors",
  description: "You've been given some basic structures to start your journey. Click on their icons to classify the data they've collected for you. New data & projects are being added weekly.",
  // additionalDescription: "You'll get to explore various missions, starting with basic tasks such as classifying objects in the sky and on Earth. Each task you complete unlocks new insights.", // <JournalPage />
  additionalDescription: <MilestoneCard />,
  icon: LightbulbIcon,
  color: "text-blue-400",
  identifier: "default-starting-mission",
};

const SimpleeMissionGuide = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <motion.div
      className="p-4 max-w-6xl mx-auto font-mono"
      initial={{ height: isMinimized ? "50px" : "auto" }}
      animate={{ height: isMinimized ? "50px" : "auto" }}
      transition={{ duration: 0.5 }}
    >
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            className="h-[calc(2*96px)] overflow-y-scroll space-y-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card key={defaultMission.id} className="cursor-pointer border mb-2 bg-gray-800">
              <CardContent className="p-4 flex items-center space-x-4">
                <defaultMission.icon className={`w-8 h-8 ${defaultMission.color}`} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-200">{defaultMission.name}</h3>
                  <p className="text-sm text-gray-400">{defaultMission.description}</p>
                  <Button className="mt-2" variant="outline" onClick={openModal}>
                    Weekly goals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal for additional description */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-[#2C4F64] p-4 h-[70%] w-[90%] max-w-screen-md rounded-lg">
            <h3 className="text-xl font-semibold mb-2">{defaultMission.name}</h3>
            <p>{defaultMission.additionalDescription}</p>
            <Button onClick={closeModal} className="mt-4">
              Close
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SimpleeMissionGuide;