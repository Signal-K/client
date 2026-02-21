'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/src/lib/auth/session-context';
import { SciFiPanel } from '@/src/components/ui/styles/sci-fi/panel';

interface ClassificationOptionCounts {
  1: number;
  2: number;
  3: number;
  4: number;
}

export default function ClassificationOptionsCounter() {
  const [counts, setCounts] = useState<ClassificationOptionCounts>({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [totalClassifications, setTotalClassifications] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const session = useSession();

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;

      setIsLoading(true);

      const response = await fetch(
        "/api/gameplay/classifications/options-counter?classificationType=lidar-jovianVortexHunter",
        { cache: "no-store" }
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload) {
        console.error('Error fetching classifications:', payload?.error || response.statusText);
        setIsLoading(false);
        return;
      }

      setCounts(payload.counts || { 1: 0, 2: 0, 3: 0, 4: 0 });
      setTotalClassifications(Number(payload.totalClassifications || 0));
      setIsLoading(false);
    };

    fetchData();
  }, [session]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <SciFiPanel className="p-4">
      <h2 className="text-lg font-bold mb-4">Classification Options Counter</h2>
      <div className="text-xl font-semibold mb-4">
        Total Classifications: <span className="text-blue-500">{totalClassifications}</span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(counts).map(([key, value]) => (
          <div
            key={key}
            className="flex flex-col items-center justify-center border border-gray-300 p-4 rounded shadow bg-gray-100"
          >
            <span className="text-xl font-semibold">Option {key}</span>
            <span className="text-2xl text-blue-500">{value}</span>
          </div>
        ))}
      </div>
    </SciFiPanel>
  );
};
