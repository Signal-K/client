"use client";

interface SatelliteBlockProps {
  visible: boolean;
  planetTargets: { id: number; name: string }[];
  activeSatelliteMessage: string | null;
  onSendSatellite: (classificationId: number) => Promise<void>;
  onCheckActiveSatellite: () => Promise<void>;
}

export default function SatelliteBlock({
  visible,
  planetTargets,
  activeSatelliteMessage,
  onSendSatellite,
  onCheckActiveSatellite,
}: SatelliteBlockProps) {
  if (!visible) return null;

  return (
    <div className="rounded-xl border bg-popover text-popover-foreground p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🛰️</span>
        <p className="font-medium text-foreground">Weather Satellites</p>
        {planetTargets.length === 0 && (
          <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full">
            Need planets first
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        Send satellites to planets you've discovered to study their atmospheres and find cloud formations.
      </p>
      
      {planetTargets.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Prerequisites:</strong> You need to classify at least one planet with radius measurements before deploying satellites.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            💡 Tip: Complete any unfinished planet classifications first!
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-foreground font-medium">
              Deploy satellite to planet:
            </label>
            <select
              className="text-sm font-medium rounded px-3 py-1 bg-primary text-primary-foreground hover:opacity-90 transition"
              defaultValue=""
              onChange={async (e) => {
                const selectedId = Number(e.target.value);
                if (!isNaN(selectedId)) {
                  await onSendSatellite(selectedId);
                  await onCheckActiveSatellite();
                }
              }}
            >
              <option value="" disabled>
                Select target planet
              </option>
              {planetTargets.map((planet) => (
                <option key={planet.id} value={planet.id}>
                  {planet.name}
                </option>
              ))}
            </select>
          </div>

          {activeSatelliteMessage ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                🛰️ Satellite Active!
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                {activeSatelliteMessage}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                ✓ Discovers clouds
              </span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                ✓ Atmospheric data
              </span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                ✓ Weekly missions
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
