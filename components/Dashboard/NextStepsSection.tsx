"use client";

interface Classification {
  id: number;
  classificationtype: string | null;
  content: string | null;
  created_at: string;
  anomaly: {
    content: string | null;
  } | null;
}

interface NextStepsSectionProps {
  incompletePlanet: Classification | null;
}

export default function NextStepsSection({ incompletePlanet }: NextStepsSectionProps) {
  return (
    <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
        <h3 className="text-xl font-semibold text-primary">Your Next Steps</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Classification Progress */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔬</span>
            <div>
              <h4 className="font-semibold text-foreground">Make More Discoveries</h4>
              <p className="text-sm text-muted-foreground">
                Classify more planets and asteroids to unlock advanced research
              </p>
            </div>
          </div>
          
          {incompletePlanet && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                🌍 Complete your planet analysis!
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                You have an unfinished planet classification. Add radius measurements to complete it.
              </p>
            </div>
          )}
        </div>

        {/* Structure Deployment */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🚀</span>
            <div>
              <h4 className="font-semibold text-foreground">Deploy Structures</h4>
              <p className="text-sm text-muted-foreground">
                Build telescopes and satellites to enhance your research capabilities
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
