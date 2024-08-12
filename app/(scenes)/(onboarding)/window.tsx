"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProfileCardModal from "@/app/(settings)/profile/form";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { TelescopeClassification } from "@/app/(structures)/Telescopes/Transiting";

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
  const renderComponentForStep = () => {
    switch (step) {
      case 1370102:
        return <ProfileCardModal />;
      case 1370103:
        return (
          <TelescopeClassification />
        )
      case 1370104:
        return <div>Initial animal classification content...</div>;
      case 1370105:
        return <div>Initial rover photos classification content...</div>;
      case 1370106:
        return <div>Generated planet content...</div>;
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
  };

  const currentMission = steps.find((step) => step.id === currentStep) || {
    id: 0,
    name: "",
    description: "",
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Panel */}
      <div className="md:w-1/3 w-full flex flex-col justify-center bg-gray-100 p-10">
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
      <div className="md:w-2/3 w-full flex flex-col justify-center p-10 bg-white">
        {currentStep ? (
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
            <div className="mt-4">
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{
                    width: `${((steps.findIndex(
                      (step) => step.id === currentStep
                    ) +
                      1) /
                      steps.length) *
                      100}%`,
                  }}
                ></div>
              </div>
              <p className="text-right text-sm mt-2">
                Step {steps.findIndex((step) => step.id === currentStep) + 1} of{" "}
                {steps.length}
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Onboarding Completed</h2>
            <p className="text-base">You have completed all onboarding steps.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingWindow;