import React from "react";
import InvestigationModeSelect from "./InvestigationModeSelect";

type SatelliteSidebarProps = {
  planetAnomalies: any[];
  focusedPlanetIdx: number;
  setFocusedPlanetIdx: (i: number) => void;
  investigationMode: 'weather' | 'planets';
  setInvestigationMode: (mode: 'weather' | 'planets') => void;
  cloudAnomalies: any[];
  handleAnomalyClick: (a: any) => void;
  anomalyContent: { content: string; type: string } | null;
  setAnomalyContent: (v: null) => void;
  userPlanetCount: number;
  communityPlanetCount: number;
};

export default function SatelliteSidebar({
  planetAnomalies,
  focusedPlanetIdx,
  setFocusedPlanetIdx,
  investigationMode,
  setInvestigationMode,
  cloudAnomalies,
  handleAnomalyClick,
  anomalyContent,
  setAnomalyContent,
  userPlanetCount,
  communityPlanetCount,
}: SatelliteSidebarProps) {
  return (
  <div className="hidden md:flex flex-col w-[400px] min-w-[340px] max-w-[480px] h-full bg-gradient-to-br from-[#181e2a] to-[#10141c] border-l border-[#232b3b] z-20 p-0 overflow-y-auto shadow-2xl">
      {/* Mode toggle in sidebar */}
      <div className="px-6 pt-6 pb-2 border-b border-[#232b3b] bg-[#181e2a]/90 sticky top-0 z-10">
        <div className="flex flex-col gap-2">
          <span className="text-[#78cce2] text-lg font-bold">Investigation Mode</span>
          <InvestigationModeSelect value={investigationMode} onChange={setInvestigationMode} />
        </div>
      </div>
      <div className="flex-1 px-6 py-4 flex flex-col gap-6">
        {/* Satellite section */}
        <div>
          <div className="text-[#78cce2] text-base font-bold mb-2 flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#78cce2" fillOpacity="0.18"/><rect x="10" y="4" width="4" height="8" rx="2" fill="#78cce2"/><rect x="6" y="16" width="12" height="2" rx="1" fill="#f2c572"/></svg>
            Satellite 1
          </div>
          <div className="text-xs text-[#e4eff0]/80 mb-2">Active Weather Satellite</div>
        </div>
        {/* Planets section */}
        <div>
          <div className="text-[#f2c572] text-base font-bold mb-2">Planets</div>
          <div className="space-y-2">
            {planetAnomalies.length > 0 ? planetAnomalies.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition border border-transparent ${i === focusedPlanetIdx ? (investigationMode === 'planets' ? 'bg-[#f2c572]/20 border-[#f2c572]' : 'bg-[#78cce2]/20 border-[#78cce2]') : 'hover:bg-[#232b3b]'}`}
                onClick={() => setFocusedPlanetIdx(i)}
              >
                <span className={`w-2 h-2 rounded-full inline-block ${investigationMode === 'planets' ? 'bg-[#f2c572]' : 'bg-[#78cce2]'}`}></span>
                <span className="text-[#e4eff0] font-mono text-sm">TIC {p.content || p.id}</span>
                {i === focusedPlanetIdx && <span className={`text-xs ${investigationMode === 'planets' ? 'text-[#f2c572]' : 'text-[#78cce2]'}`}>Focused</span>}
              </div>
            )) : (
              <div className={investigationMode === 'planets' ? 'text-[#f2c572] text-xs' : 'text-[#78cce2] text-xs'}>
                No planets discovered yet.
              </div>
            )}
          </div>
        </div>
        {/* Weather anomalies section (only in weather mode) */}
        {investigationMode === 'weather' && (
          <div>
            <div className="text-[#78cce2] text-base font-bold mb-2">Weather Anomalies</div>
            <div className="space-y-2">
              {cloudAnomalies.length > 0 ? cloudAnomalies.map((a, i) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-[#232b3b] border border-[#78cce2]/30"
                  onClick={() => handleAnomalyClick(a)}
                >
                  <span className="w-2 h-2 rounded-full bg-[#78cce2] inline-block"></span>
                  <span className="text-[#e4eff0] font-mono text-sm">{a.content || `Cloud #${a.id}`}</span>
                </div>
              )) : <div className="text-[#78cce2] text-xs">No weather anomalies for this planet.</div>}
            </div>
          </div>
        )}
        {/* Anomaly details (if open) */}
        {anomalyContent && (
          <div className="mt-8 p-4 bg-[#232b3b] rounded-lg border border-[#78cce2]/30">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg text-[#e4eff0]">Anomaly Details</span>
              <button onClick={() => setAnomalyContent(null)} className="text-[#78cce2] hover:underline">Close</button>
            </div>
            <div className="mb-2 text-xs text-[#78cce2]">Type: <span className="font-semibold">{anomalyContent.type}</span></div>
            <div className="whitespace-pre-line text-sm mb-4 text-[#e4eff0]">{anomalyContent.content}</div>
          </div>
        )}
      </div>
    </div>
  );
}
