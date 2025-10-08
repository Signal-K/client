'use client'

import { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

export default function DeploymentDebug() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchDebugInfo = async () => {
      try {
        // Check telescope-related anomaly sets
        const { data: allAnomalies, error: anomaliesError } = await supabase
          .from('anomalies')
          .select('id, content, anomalySet, anomalytype')
          .in('anomalySet', ['telescope-tess', 'telescope-minorPlanet', 'active-asteroids', 'diskDetective']);

        if (anomaliesError) {
          console.error('Error fetching anomalies:', anomaliesError);
          return;
        }

        // Check user's recent linked anomalies
        const { data: recentLinked, error: linkedError } = await supabase
          .from('linked_anomalies')
          .select('id, anomaly_id, automaton, date')
          .eq('author', session.user.id)
          .eq('automaton', 'Telescope')
          .order('date', { ascending: false })
          .limit(10);

        if (linkedError) {
          console.error('Error fetching linked anomalies:', linkedError);
          return;
        }

        // Check user's research status
        const { data: researched, error: researchError } = await supabase
          .from('researched')
          .select('tech_type')
          .eq('user_id', session.user.id);

        if (researchError) {
          console.error('Error fetching research:', researchError);
          return;
        }

        const bySet = allAnomalies?.reduce((acc: any, anomaly) => {
          const set = anomaly.anomalySet || 'unknown';
          if (!acc[set]) acc[set] = [];
          acc[set].push(anomaly);
          return acc;
        }, {});

        setDebugInfo({
          totalAnomaliesInSets: allAnomalies?.length || 0,
          anomaliesBySet: Object.keys(bySet || {}).map(set => ({
            set,
            count: bySet[set].length,
            samples: bySet[set].slice(0, 3).map((a: any) => ({ id: a.id, content: a.content }))
          })),
          recentLinkedCount: recentLinked?.length || 0,
          recentLinked: recentLinked?.map(l => ({ id: l.id, anomaly_id: l.anomaly_id, date: l.date })) || [],
          researchedTech: researched?.map(r => r.tech_type) || [],
          hasTelescopeUpgrade: researched?.some(r => r.tech_type === 'probereceptors') || false
        });

      } catch (error) {
        console.error('Debug fetch error:', error);
      }
    };

    fetchDebugInfo();
  }, [session, supabase]);

  if (!debugInfo) {
    return <div className="p-4 bg-gray-100 rounded">Loading debug info...</div>;
  }

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg text-sm font-mono max-w-4xl">
      <h3 className="text-lg font-bold mb-4 text-yellow-400">Telescope Deployment Debug</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-green-400 font-semibold mb-2">Database Anomalies</h4>
          <p>Total in telescope sets: {debugInfo.totalAnomaliesInSets}</p>
          
          <div className="mt-2">
            {debugInfo.anomaliesBySet.map((set: any) => (
              <div key={set.set} className="mb-2 p-2 bg-gray-800 rounded">
                <div className="text-cyan-400">{set.set}: {set.count} anomalies</div>
                <div className="text-xs text-gray-400 mt-1">
                  Samples: {set.samples.map((s: any) => `#${s.id}(${s.content || 'no-content'})`).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-green-400 font-semibold mb-2">User Status</h4>
          <p>Recent linked anomalies: {debugInfo.recentLinkedCount}</p>
          <p>Has telescope upgrade: {debugInfo.hasTelescopeUpgrade ? 'YES (6 anomalies)' : 'NO (4 anomalies)'}</p>
          
          <div className="mt-2">
            <div className="text-cyan-400 mb-1">Researched tech:</div>
            <div className="text-xs text-gray-400">
              {debugInfo.researchedTech.length > 0 ? debugInfo.researchedTech.join(', ') : 'None'}
            </div>
          </div>

          <div className="mt-2">
            <div className="text-cyan-400 mb-1">Recent deployments:</div>
            <div className="text-xs text-gray-400">
              {debugInfo.recentLinked.slice(0, 5).map((l: any) => 
                `#${l.anomaly_id} (${new Date(l.date).toLocaleDateString()})`
              ).join(', ') || 'None'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-2 bg-red-900/30 border border-red-500 rounded">
        <div className="text-red-400 font-semibold">Expected Behavior:</div>
        <div className="text-xs">
          • Should deploy {debugInfo.hasTelescopeUpgrade ? '6' : '4'} anomalies maximum<br/>
          • Should only create linked_anomalies entries for selected anomalies<br/>
          • If you're seeing 88 deployments, there's likely a data issue or bug
        </div>
      </div>
    </div>
  );
}