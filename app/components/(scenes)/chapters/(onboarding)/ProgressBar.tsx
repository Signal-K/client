import React from "react";

interface ProgressBarProps {
  currentStepIndex: number;
  totalSteps: number;
};

const ProgressBar = ({ currentStepIndex, totalSteps }: ProgressBarProps) => {
  const progressPercentage = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <div className="mt-4">
      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <p className="text-right text-sm mt-2">
        Step {currentStepIndex + 1} of {totalSteps}
      </p>
    </div>
  );
};

export default ProgressBar;