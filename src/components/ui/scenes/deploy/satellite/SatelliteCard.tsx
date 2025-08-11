import React from "react";
import { Card } from "@/src/components/ui/card";

interface SatelliteCardProps {
  children: React.ReactNode;
}

const SatelliteCard: React.FC<SatelliteCardProps> = ({ children }) => (
  <Card className="relative w-full h-48 rounded-lg text-white bg-card border border-chart-4/30">
    {children}
  </Card>
);

export default SatelliteCard;
