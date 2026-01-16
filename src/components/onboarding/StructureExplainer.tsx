"use client";

import { useState } from "react";
import { cn } from "@/src/shared/utils";
import { Button } from "@/src/components/ui/button";
import {
  Telescope,
  Satellite,
  Car,
  Sun,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Pickaxe,
  Sparkles,
  X,
} from "lucide-react";

interface StructureInfo {
  id: "telescope" | "satellite" | "rover" | "solar";
  name: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  whatIsIt: string;
  whatCanYouDo: string[];
  funFact: string;
  mineralConnection?: string;
}

const STRUCTURES: StructureInfo[] = [
  {
    id: "telescope",
    name: "Telescope Observatory",
    icon: <Telescope className="w-8 h-8" />,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20 border-purple-500/30",
    whatIsIt:
      "Your telescope is connected to real space observatories like NASA's TESS (Transiting Exoplanet Survey Satellite). It lets you analyze actual data from space missions!",
    whatCanYouDo: [
      "Hunt for exoplanets by spotting tiny dips in starlight when planets pass in front of their stars",
      "Track asteroids and minor planets as they move across the sky",
      "Study distant galaxies and help classify cosmic phenomena",
      "Contribute to real scientific papers and discoveries",
    ],
    funFact:
      "Citizen scientists have discovered over 100 new exoplanets using telescope data - including some in the habitable zone!",
  },
  {
    id: "satellite",
    name: "Orbital Satellite",
    icon: <Satellite className="w-8 h-8" />,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20 border-cyan-500/30",
    whatIsIt:
      "Your satellites orbit planets you've discovered. They take high-resolution images of planetary surfaces and atmospheres using data from missions like Mars Reconnaissance Orbiter.",
    whatCanYouDo: [
      "Track cloud formations and massive storms on planets",
      "Study seasonal changes like ice melting on Mars",
      "Identify interesting terrain features for rover exploration",
      "Monitor atmospheric changes over time",
    ],
    funFact:
      "The 'fans' and 'blotches' you identify on Mars are caused by CO₂ geysers erupting from beneath the ice as it sublimates in spring!",
  },
  {
    id: "rover",
    name: "Surface Rover",
    icon: <Car className="w-8 h-8" />,
    color: "text-green-400",
    bgColor: "bg-green-500/20 border-green-500/30",
    whatIsIt:
      "Your rovers explore planetary surfaces, just like NASA's Perseverance and Curiosity on Mars. They analyze rocks, take photos, and search for resources.",
    whatCanYouDo: [
      "Train AI to help real rovers navigate autonomously",
      "Classify terrain types: sand, rocks, soil, and bedrock",
      "Discover mineral deposits valuable for future space mining",
      "Help plan safe routes for actual Mars rovers",
    ],
    funFact:
      "Real NASA rover drivers use terrain classifications like yours to plan each day's drive path - your work literally guides robots on Mars!",
    mineralConnection:
      "When you classify terrain, you might discover mineral deposits! Minerals come from analyzing rover images and satellite data to identify resource-rich areas. Future space mining operations will depend on discoveries like yours.",
  },
  {
    id: "solar",
    name: "Solar Observatory",
    icon: <Sun className="w-8 h-8" />,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20 border-yellow-500/30",
    whatIsIt:
      "Your solar observatory monitors our Sun using data from NASA's Solar Dynamics Observatory. The Sun's activity affects Earth and the entire solar system!",
    whatCanYouDo: [
      "Count and classify sunspots on the solar surface",
      "Track solar flares and predict space weather",
      "Monitor the Sun's magnetic activity cycle",
      "Help protect satellites and power grids from solar storms",
    ],
    funFact:
      "A massive solar storm in 1859 (the Carrington Event) was so powerful that telegraph operators got electric shocks! Monitoring sunspots helps us prepare for the next big one.",
  },
];

interface StructureExplainerProps {
  structureId?: "telescope" | "satellite" | "rover" | "solar";
  onClose?: () => void;
  onComplete?: () => void;
  showAll?: boolean;
  compact?: boolean;
}

export default function StructureExplainer({
  structureId,
  onClose,
  onComplete,
  showAll = false,
  compact = false,
}: StructureExplainerProps) {
  const [currentIndex, setCurrentIndex] = useState(
    structureId ? STRUCTURES.findIndex((s) => s.id === structureId) : 0
  );
  const [hasSeenAll, setHasSeenAll] = useState(false);

  const structures = showAll ? STRUCTURES : [STRUCTURES.find((s) => s.id === structureId)!];
  const structure = structures[currentIndex];

  const goNext = () => {
    if (currentIndex < structures.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      if (currentIndex === structures.length - 2) {
        setHasSeenAll(true);
      }
    } else if (onComplete) {
      onComplete();
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!structure) return null;

  if (compact) {
    return (
      <div className={cn("rounded-xl border-2 p-4", structure.bgColor)}>
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              structure.bgColor
            )}
          >
            <span className={structure.color}>{structure.icon}</span>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{structure.name}</h4>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{structure.whatIsIt}</p>
      </div>
    );
  }

  return (
    <div className="relative bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className={cn("p-6 border-b", structure.bgColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center bg-background/50"
              )}
            >
              <span className={structure.color}>{structure.icon}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{structure.name}</h2>
              {showAll && (
                <p className="text-sm text-muted-foreground mt-1">
                  {currentIndex + 1} of {structures.length} structures
                </p>
              )}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-background/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* What is it */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            What is this?
          </h3>
          <p className="text-muted-foreground leading-relaxed">{structure.whatIsIt}</p>
        </div>

        {/* What can you do */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-primary" />
            What can you do here?
          </h3>
          <ul className="space-y-2">
            {structure.whatCanYouDo.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-muted-foreground"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mineral connection (if exists) */}
        {structure.mineralConnection && (
          <div className={cn("rounded-xl p-4 border-2", "bg-amber-500/10 border-amber-500/30")}>
            <h3 className="font-semibold text-amber-400 mb-2 flex items-center gap-2">
              <Pickaxe className="w-4 h-4" />
              Where do minerals come from?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {structure.mineralConnection}
            </p>
          </div>
        )}

        {/* Fun fact */}
        <div className="bg-muted/30 rounded-xl p-4">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Fun fact: </span>
            {structure.funFact}
          </p>
        </div>
      </div>

      {/* Navigation (for showAll mode) */}
      {showAll && (
        <div className="px-6 pb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          {/* Dots indicator */}
          <div className="flex items-center gap-2">
            {structures.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentIndex ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          <Button onClick={goNext} className="gap-2">
            {currentIndex === structures.length - 1 ? (
              <>
                Get Started
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      )}

      {/* Single structure close button */}
      {!showAll && onClose && (
        <div className="px-6 pb-6">
          <Button onClick={onClose} className="w-full">
            Got it!
          </Button>
        </div>
      )}
    </div>
  );
}

// Export structures for use in other components
export { STRUCTURES };
export type { StructureInfo };
