"use client";

interface FutureStructuresProps {
  visibleStructures: {
    rovers: boolean;
    balloons: boolean;
  };
}

export default function FutureStructures({ visibleStructures }: FutureStructuresProps) {
  if (!visibleStructures.rovers && !visibleStructures.balloons) return null;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/30 p-4">
      <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
        <span className="text-xl">🚧</span>
        Coming Soon: Advanced Equipment
      </h4>
      <div className="grid md:grid-cols-2 gap-4">
        {visibleStructures.rovers && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <p className="font-medium text-sm">Planetary Rovers</p>
                <p className="text-xs text-muted-foreground">
                  Explore surface geology and mineral compositions
                </p>
              </div>
            </div>
          </div>
        )}
        {visibleStructures.balloons && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎈</span>
              <div>
                <p className="font-medium text-sm">Atmospheric Balloons</p>
                <p className="text-xs text-muted-foreground">
                  Study weather patterns and atmospheric layers
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
        Unlock these by advancing through the research tree and making more discoveries!
      </p>
    </div>
  );
}
