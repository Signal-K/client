"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProfileCardModal from "@/app/(settings)/profile/form";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { TelescopeClassification } from "@/app/(structures)/Telescopes/Transiting";
import { useActivePlanet } from "@/context/ActivePlanet";
import ProgressBar from "../(missions)/ProgressBar";
import DeployRooversInitial from "../roovers/deployAndReturn";
import Compass from "@/Classifications/RoverContent/RoverData";

interface Mission {
  id: number;
  name: string;
  description: string;
}

interface OnboardingStepProps {
  title: string;
  description: string;
  step: number;
}

const OnboardingStep = ({ title, description, step }: OnboardingStepProps) => {
  const { activePlanet } = useActivePlanet();
  const basePlanetIds = [1, 2, 3, 4, 5, 6];

  const getRandomPlanetId = () => {
    return basePlanetIds[Math.floor(Math.random() * basePlanetIds.length)];
  };

  const renderComponentForStep = () => {
    switch (step) {
      case 1370102:
        return <ProfileCardModal />;
      case 1370103:
        return (
          <TelescopeClassification anomalyid={activePlanet?.id || getRandomPlanetId()} />
        );
      case 1370104:
        return (
          <center>
            <DeployRooversInitial />
          </center>
        );
      case 1370105:
        return <div>Initial rover photos classification content...</div>;
      case 1370106:
        return (
          <Compass windspeed={50} direction={50} />
        );
      default:
        return <div>Welcome message...</div>;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-base mb-8">{description}</p>
      {renderComponentForStep()}
    </div>
  );
};

const OnboardingWindow = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [steps, setSteps] = useState<Mission[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false); // New state for dropdown

  const missionIds = [1370102, 1370103, 1370104, 1370105, 1370106];

  useEffect(() => {
    const fetchMissionsData = async () => {
      const response = await fetch("/api/gameplay/missions");
      const data: Mission[] = await response.json();

      // Filter out the relevant missions
      const filteredSteps = data.filter((mission) =>
        missionIds.includes(mission.id)
      );

      setSteps(filteredSteps);

      // Check the user's progress and set the correct step
      const { data: existingMissions, error } = await supabase
        .from("missions")
        .select("mission")
        .eq("user", session?.user?.id);

      if (error) {
        console.error("Error fetching missions:", error);
        return;
      }

      const completedMissions = existingMissions.map((m: any) => m.mission);

      if (completedMissions.includes(1370106)) {
        setCurrentStep(null);
      } else {
        for (let i = 0; i < missionIds.length; i++) {
          if (!completedMissions.includes(missionIds[i])) {
            setCurrentStep(missionIds[i]);
            break;
          }
        }
      }
    };

    fetchMissionsData();
  }, [session?.user?.id, supabase]);

  const handleNext = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex((step) => step.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    setDropdownOpen(false); // Close dropdown on step click
  };

  const currentMission = steps.find((step) => step.id === currentStep) || {
    id: 0,
    name: "",
    description: "",
  };

  return (
    <div className="relative flex flex-col md:flex-row min-h-screen">
      {/* Left Panel - Desktop */}
      <div className="hidden md:flex md:w-1/3 w-full flex-col justify-center bg-gray-100 p-10 shadow-4xl z-10">
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg cursor-pointer ${
                currentStep === step.id ? "bg-white shadow-md" : "bg-gray-200"
              }`}
              onClick={() => handleStepClick(step.id)}
            >
              <h2 className="font-bold">{step.name}</h2>
              <p className="text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div
        className={`md:w-2/3 w-full flex flex-col justify-center p-10  overflow-hidden`} // // bg-[url('https://images.unsplash.com/photo-1462726625343-6a2ab0b9f020?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-repeat bg-cover bg-center
        style={{ backgroundPosition: "center" }}
      >
        <div className="flex-grow flex flex-col justify-between">
          {currentStep ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 relative z-20"
            >
              <OnboardingStep
                title={currentMission.name}
                description={currentMission.description}
                step={currentStep}
              />
              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  disabled={currentStep === steps[0]?.id}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentStep === steps[steps.length - 1]?.id}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  {currentStep === steps[steps.length - 1]?.id ? "Finish" : "Next"}
                </button>
              </div>
              <ProgressBar
                currentStepIndex={steps.findIndex((step) => step.id === currentStep)}
                totalSteps={steps.length}
              />
            </motion.div>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Onboarding Completed</h2>
              <p className="text-base">You have completed all onboarding steps.</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View - Dropdown Menu */}
      <div className="md:hidden">
        <button
          className="w-full p-4 bg-gray-800 text-white"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {dropdownOpen ? "Close Menu" : "Select Mission"}
        </button>

        {dropdownOpen && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-100 p-4 shadow-lg z-20 overflow-auto">
            <div className="space-y-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg cursor-pointer ${
                    currentStep === step.id ? "bg-white shadow-md" : "bg-gray-200"
                  }`}
                  onClick={() => handleStepClick(step.id)}
                >
                  <h2 className="font-bold">{step.name}</h2>
                  <p className="text-sm">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingWindow;