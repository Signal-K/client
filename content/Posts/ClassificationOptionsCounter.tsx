'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { SciFiPanel } from '@/components/ui/styles/sci-fi/panel';

interface ClassificationOptionCounts {
  1: number;
  2: number;
  3: number;
  4: number;
}

export default function ClassificationOptionsCounter() {
  const [counts, setCounts] = useState<ClassificationOptionCounts>({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [totalClassifications, setTotalClassifications] = useState(0);
  const [rawConfigurations, setRawConfigurations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabaseClient();
  const session = useSession();

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user) return;

      setIsLoading(true);

      const { data, error } = await supabase
        .from("classifications")
        .select('classificationConfiguration')
        .eq('author', session.user.id)
        .eq('classificationtype', 'lidar-jovianVortexHunter');

      if (error) {
        console.error('Error fetching classifications:', error.message);
        setIsLoading(false);
        return;
      }

      const aggregatedCounts: ClassificationOptionCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
      const rawConfigs: any[] = [];

      data?.forEach((item) => {
        const config = item.classificationConfiguration;
        rawConfigs.push(config);

        if (config?.classificationOptions) {
          Object.values(config.classificationOptions).forEach((options) => {
            if (options && typeof options === 'object') {
              Object.keys(options).forEach((key) => {
                const optionNumber = parseInt(key, 10);
                // if (options[key] && aggregatedCounts[optionNumber] !== undefined) {
                //   aggregatedCounts[optionNumber]++;
                // }
              });
            }
          });
        }
      });

      setRawConfigurations(rawConfigs);
      setCounts(aggregatedCounts);
      setTotalClassifications(data?.length || 0);
      setIsLoading(false);
    };

    fetchData();
  }, [session, supabase]);

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