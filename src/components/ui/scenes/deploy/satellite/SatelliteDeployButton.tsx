import React from "react";
import { Button } from "../../../button";

export default function SatelliteDeployButton({
  onClick,
  disabled,
  loading,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex justify-center mt-8">
      <Button
        className="bg-[#78cce2] text-[#002439] hover:bg-[#e4eff0] font-bold text-lg px-8 py-3 rounded-xl shadow-lg border-2 border-[#005066]"
        onClick={onClick}
        disabled={disabled || loading}
      >
        {loading ? 'Deploying...' : children}
      </Button>
    </div>
  );
}
