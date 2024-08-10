"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ProfileCardModal from "@/app/(settings)/profile/form";
// import { useMission } from "@/context/MissionContext";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

interface Mission {
  id: number;
  name: string;
  description: string;
  rewards: number[];
}

interface OnboardingStepProps {
  title: string;
  description: string;
  step: number;
}

const OnboardingStep = ({ title, description, step }: OnboardingStepProps) => {
  const renderComponentForStep = () => {
    switch (step) {
      case 1:
        return <div>First step: Introduction content...</div>;
      case 2:
        return <ProfileCardModal />;
      case 3:
        return <div>Third step: Verify your email form...</div>;
      case 4:
        return <div>Fourth step: Invite your team form...</div>;
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

  // const { missions, fetchMissions } = useMission();
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<Mission[]>([]);
  const missionCheckedRef = useRef(false);  // Use ref to track mission check

  useEffect(() => {
    const fetchMissionsData = async () => {
      const response = await fetch("/api/gameplay/missions");
      const data: Mission[] = await response.json();

      const filteredSteps = data.filter((mission) =>
        mission.id.toString().startsWith("13701")
      );

      setSteps(filteredSteps);
    };

    fetchMissionsData();
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    const stepNumber = parseInt(stepId.toString().slice(-2), 10);
    setCurrentStep(stepNumber);
  };

  const currentMission = steps[currentStep - 1] || { id: 0, name: "", description: "" };
  const currentStepNumber = parseInt(currentMission.id.toString().slice(-2), 10) || 1;

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Panel */}
      <div className="md:w-1/3 w-full flex flex-col justify-center bg-gray-100 p-10">
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg cursor-pointer ${
                currentStepNumber === parseInt(step.id.toString().slice(-2), 10)
                  ? "bg-white shadow-md"
                  : "bg-gray-200"
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
      <div className="md:w-2/3 w-full flex flex-col justify-center p-10 bg-white">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <OnboardingStep
            title={currentMission.name}
            description={currentMission.description}
            step={currentStepNumber}
          />
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-4 py-2 bg-gray-300 rounded-lg"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === steps.length}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              {currentStep === steps.length ? "Finish" : "Next"}
            </button>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${(currentStepNumber / steps.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-right text-sm mt-2">
              Step {currentStepNumber} of {steps.length}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingWindow;