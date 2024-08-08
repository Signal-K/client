"use client";

import { useState } from "react";
import { motion } from "framer-motion"; 
import ProfileCardModal from "@/app/(settings)/profile/form";

const steps = [
  { id: 1, title: "Your details", description: "Provide an email and password" },
  { id: 2, title: "Verify your email", description: "Enter your verification code" },
  { id: 3, title: "Invite your team", description: "Start collaborating with your team" },
  { id: 4, title: "Welcome to Star Sailors!", description: "Get up and running in 3 minutes" },
];

const OnboardingStep = ({ step }: { step: number }) => {
  switch (step) {
    case 1:
      return (
        <div>
          <ProfileCardModal />
        </div>
      );
    case 2:
      return <div>Verify your email form...</div>;
    case 3:
      return <div>Invite your team form...</div>;
    case 4:
      return <div>Welcome message...</div>;
    default:
      return null;
  }
};

const OnboardingWindow = () => {
  const [currentStep, setCurrentStep] = useState(1);

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
    setCurrentStep(stepId);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Panel */}
      <div className="md:w-1/3 w-full flex flex-col justify-center bg-gray-100 p-10">
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg cursor-pointer ${currentStep === step.id ? 'bg-white shadow-md' : 'bg-gray-200'}`}
              onClick={() => handleStepClick(step.id)}
            >
              <h2 className="font-bold">{step.title}</h2>
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
          <OnboardingStep step={currentStep} />
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
              {currentStep === steps.length ? 'Finish' : 'Next'}
            </button>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-right text-sm mt-2">
              Step {currentStep} of {steps.length}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingWindow;