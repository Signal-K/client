"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProfileCardModal from "@/app/(settings)/profile/form";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { TelescopeClassification } from "@/app/(structures)/Telescopes/Transiting";
import { useActivePlanet } from "@/context/ActivePlanet";
import ProgressBar from "../(missions)/ProgressBar";
import DeployRooversInitial from "../roovers/deployAndReturn";
import GeneratedStarterPlanet from "@/app/(anomalies)/(planets)/generated";
import { Header } from "@/app/components/sections/header";

interface Mission {
  id: number;
  name: string;
  description: string;
};

interface OnboardingStepProps {
  title: string;
  description: string;
  step: number;
};

const OnboardingStep = ({ title, description, step }: OnboardingStepProps) => {
  const { activePlanet } = useActivePlanet();
  const basePlanetIds = [1, 2, 3, 4, 5, 6];

  const getRandomPlanetId = () => {
    return basePlanetIds[Math.floor(Math.random() * basePlanetIds.length)];
  };

  const renderComponentForStep = () => {
    switch (step) {
      case 1370102:
        return (
          <div>
            <ProfileCardModal />
          </div>
        );
      case 1370103:
        return (
          <div>
            <TelescopeClassification anomalyid={activePlanet?.id || getRandomPlanetId()} />
          </div>
        );
      case 1370104:
        return (
          <div>
            <DeployRooversInitial />
          </div>
        );
      case 1370106:
        return (
          <div>
            <GeneratedStarterPlanet />
          </div>
        );
      default:
        return (
          <div>
            Star Sailors
          </div>
        );
    }
  };

  return (
    <div>
      <div className="block md:hidden">
        <h2 className="text-xl font-bold mb-2 md:mb-4 text-blue-500">{title}</h2>
        <p className="text-sm md:text-base text-blue-500 mb-4 md:mb-8">{description}</p>
      </div>
      {renderComponentForStep()}
    </div>
  );
};

const OnboardingWindow = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [currentStep, setCurrentStep] = useState<number | null>(null);
  const [steps, setSteps] = useState<Mission[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const missionIds = [1370102, 1370103, 1370104, 1370106]; // Exclude 1370105 from the missionIds

  useEffect(() => {
    const fetchMissionsData = async () => {
      const response = await fetch("/api/gameplay/missions");
      const data: Mission[] = await response.json();

      const filteredSteps = data.filter(
        (mission) => missionIds.includes(mission.id)
      );

      setSteps(filteredSteps);

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
          };
        };
      };
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
    <div className="relative flex flex-col md:flex-row min-h-screen p-4 md:p-8">
      {/* Left Panel - Desktop */}
      <div className="hidden md:flex rounded-xl md:w-1/3 w-full flex-col justify-center p-2 md:p-10 z-10 backdrop-blur-lg bg-white/30">
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`p-2 md:p-4 rounded-lg cursor-pointer ${
                currentStep === step.id ? "bg-white/50 shadow-md" : "bg-gray-200/50"
              }`}
              onClick={() => handleStepClick(step.id)}
            >
              <h2 className="text-sm md:text-base text-yellow-400 font-bold">{step.name}</h2>
              <p className="text-xs md:text-sm text-yellow-200">{step.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div
        className={`md:w-2/3 w-full flex flex-col justify-center md:p-4 h-screen md:overflow-y-auto overflow-hidden bg-gradient-to-b from-transparent via-transparent to-black/30`} 
      >
        {/* Header Component for Desktop */}
        <div className="hidden md:block mb-6">
          <Header />
        </div>

        <div className="flex-grow flex flex-col justify-between">
          {currentStep ? (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2 md:space-y-4 relative z-20"
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
                  className="px-2 py-1 md:px-4 md:py-2 bg-gray-300 rounded-lg"
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentStep === steps[steps.length - 1]?.id}
                  className="px-2 py-1 md:px-4 md:py-2 bg-cyan-50 text-white rounded-lg"
                >
                  {currentStep === steps[steps.length - 1]?.id ? "" : "Next"}
                </button>
              </div>
              <ProgressBar
                currentStepIndex={steps.findIndex((step) => step.id === currentStep)}
                totalSteps={steps.length}
              />
            </motion.div>
          ) : (
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4">Onboarding Completed</h2>
              <p className="text-sm md:text-base">You have completed all onboarding steps.</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View - Dropdown Menu */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-gray-100 p-2 z-30">
        <button
          className="w-full p-2 bg-gray-800 text-white"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {dropdownOpen ? "Close Menu" : "Select Mission"}
        </button>

        {dropdownOpen && (
          <div className="absolute top-12 left-0 w-full bg-gray-100 p-4 shadow-lg z-20 overflow-auto">
            <div className="space-y-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`p-2 rounded-lg cursor-pointer ${
                    currentStep === step.id ? "bg-white shadow-md" : "bg-gray-200"
                  }`}
                  onClick={() => handleStepClick(step.id)}
                >
                  <h2 className="text-sm font-bold">{step.name}</h2>
                  <p className="text-xs">{step.description}</p>
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