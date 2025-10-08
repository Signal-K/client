'use client'

import { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

export default function StardustDebug() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchStardustDebug = async () => {
      try {
        // Get all classifications
        const { data: allClassifications, error: classError } = await supabase
          .from("classifications")
          .select("id, classificationtype, created_at")
          .eq("author", session.user.id)
          .order("created_at", { ascending: false });

        if (classError) {
          console.error('Error fetching classifications:', classError);
          return;
        }

        // Get all researched items
        const { data: researched, error: researchError } = await supabase
          .from("researched")
          .select("id, tech_type, created_at")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (researchError) {
          console.error('Error fetching research:', researchError);
          return;
        }

        // Calculate stardust - new method (only paid upgrades)
        const basePoints = allClassifications?.length || 0;
        const paidUpgrades = researched?.filter(r => 
          ['probereceptors', 'satellitecount', 'probecount', 'proberange', 'rovercount'].includes(r.tech_type)
        ) || [];
        const newResearchPenalty = paidUpgrades.length * 10;
        const newAvailableStardust = Math.max(0, basePoints - newResearchPenalty);

        // Old calculation for comparison
        const oldResearchPenalty = (researched?.length || 0) * 10;
        const oldAvailableStardust = Math.max(0, basePoints - oldResearchPenalty);

        // Group classifications by type
        const classificationsByType = allClassifications?.reduce((acc: any, c) => {
          const type = c.classificationtype || 'unknown';
          if (!acc[type]) acc[type] = 0;
          acc[type]++;
          return acc;
        }, {});

        setDebugInfo({
          totalClassifications: basePoints,
          totalResearched: researched?.length || 0,
          paidUpgrades: paidUpgrades.length,
          newResearchPenalty,
          newAvailableStardust,
          oldResearchPenalty,
          oldAvailableStardust,
          newCalculation: `${basePoints} - ${newResearchPenalty} = ${newAvailableStardust}`,
          oldCalculation: `${basePoints} - ${oldResearchPenalty} = ${oldAvailableStardust}`,
          classificationsByType,
          paidUpgradeTypes: paidUpgrades.map(r => r.tech_type),
          researchedItems: researched?.map(r => ({
            type: r.tech_type,
            date: new Date(r.created_at).toLocaleDateString(),
            isPaid: ['probereceptors', 'satellitecount', 'probecount', 'proberange', 'rovercount'].includes(r.tech_type)
          })) || [],
          recentClassifications: allClassifications?.slice(0, 10).map(c => ({
            type: c.classificationtype,
            date: new Date(c.created_at).toLocaleDateString()
          })) || []
        });

      } catch (error) {
        console.error('Debug fetch error:', error);
      }
    };

    fetchStardustDebug();
  }, [session, supabase]);

  if (!debugInfo) {
    return <div className="p-4 bg-gray-100 rounded">Loading stardust debug info...</div>;
  }

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg text-sm font-mono max-w-4xl">
      <h3 className="text-lg font-bold mb-4 text-yellow-400">Stardust Calculation Debug</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-green-400 font-semibold mb-2">Stardust Calculation</h4>
          <div className="space-y-2">
            <p>📊 Total Classifications: <span className="text-cyan-400">{debugInfo.totalClassifications}</span></p>
            <p>🔬 Total Research Items: <span className="text-orange-400">{debugInfo.totalResearched}</span></p>
            <p>� Paid Upgrades Only: <span className="text-red-400">{debugInfo.paidUpgrades}</span></p>
            <div className="border-t border-gray-600 pt-2">
              <p className="text-red-400">❌ Old Method: <span className="text-red-300">-{debugInfo.oldResearchPenalty}</span> = <span className="text-red-300">{debugInfo.oldAvailableStardust}</span> stardust</p>
              <p className="text-green-400">✅ New Method: <span className="text-green-300">-{debugInfo.newResearchPenalty}</span> = <span className="text-yellow-400 text-lg font-bold">{debugInfo.newAvailableStardust}</span> stardust</p>
            </div>
            <p className="text-gray-400 text-xs">New Formula: {debugInfo.newCalculation}</p>
            <p className="text-gray-500 text-xs">Old Formula: {debugInfo.oldCalculation}</p>
          </div>

          <div className="mt-4">
            <h5 className="text-cyan-400 font-semibold mb-2">Paid Upgrade Types</h5>
            <div className="text-xs space-y-1">
              {debugInfo.paidUpgradeTypes.map((type: string, index: number) => (
                <div key={index} className="text-green-300">{type}</div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <h5 className="text-cyan-400 font-semibold mb-2">Classifications by Type</h5>
            <div className="text-xs space-y-1">
              {Object.entries(debugInfo.classificationsByType).map(([type, count]: [string, any]) => (
                <div key={type} className="flex justify-between">
                  <span>{type}:</span>
                  <span className="text-cyan-400">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-green-400 font-semibold mb-2">Research Items</h4>
          <div className="text-xs space-y-1 max-h-40 overflow-y-auto">
            {debugInfo.researchedItems.map((item: any, index: number) => (
              <div key={index} className="flex justify-between">
                <span className={item.isPaid ? "text-red-300" : "text-green-300"}>
                  {item.isPaid ? "💸" : "🎁"} {item.type}
                </span>
                <span className="text-gray-400">{item.date}</span>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            💸 = Costs stardust, 🎁 = Free unlock
          </div>

          <div className="mt-4">
            <h5 className="text-cyan-400 font-semibold mb-2">Recent Classifications</h5>
            <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
              {debugInfo.recentClassifications.map((item: any, index: number) => (
                <div key={index} className="flex justify-between">
                  <span className="text-cyan-300">{item.type}</span>
                  <span className="text-gray-400">{item.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-2 bg-blue-900/30 border border-blue-500 rounded">
        <div className="text-blue-400 font-semibold">Fixed Stardust System:</div>
        <div className="text-xs">
          • 1 stardust per classification made<br/>
          • -10 stardust only for purchased upgrades (probereceptors, satellitecount, etc.)<br/>
          • Free unlocks (like "active-asteroids") no longer cost stardust<br/>
          • Old penalty: -{debugInfo.oldResearchPenalty} | New penalty: -{debugInfo.newResearchPenalty}<br/>
          • Your available stardust: {debugInfo.newAvailableStardust} ⭐
        </div>
      </div>

      {debugInfo.newAvailableStardust > debugInfo.oldAvailableStardust && (
        <div className="mt-2 p-2 bg-green-900/30 border border-green-500 rounded">
          <div className="text-green-400 font-semibold">Problem Fixed! 🎉</div>
          <div className="text-xs">
            You gained {debugInfo.newAvailableStardust - debugInfo.oldAvailableStardust} stardust!<br/>
            Only {debugInfo.paidUpgrades} paid upgrades now count instead of {debugInfo.totalResearched} total research items.
          </div>
        </div>
      )}
    </div>
  );
}