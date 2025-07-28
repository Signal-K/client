"use client";

import TipsPanel from "@/components/Structures/Missions/Milestones/NextStepsTips";

interface LegacyTipsPanelProps {
  showTipsPanel: boolean;
  onToggleTipsPanel: () => void;
}

export default function LegacyTipsPanel({ 
  showTipsPanel, 
  onToggleTipsPanel 
}: LegacyTipsPanelProps) {
  return (
    <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-primary">💡 Tips & Next Actions</h3>
        <button
          onClick={onToggleTipsPanel}
          className="text-sm font-medium px-3 py-1 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition"
        >
          {showTipsPanel ? 'Hide Tips' : 'Show Tips'}
        </button>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="text-center p-4 bg-card/50 rounded-lg">
          <div className="text-2xl mb-2">📊</div>
          <h4 className="font-semibold text-sm mb-1">Track Progress</h4>
          <p className="text-xs text-muted-foreground">
            Monitor your discoveries and research advancement in real-time
          </p>
        </div>
        <div className="text-center p-4 bg-card/50 rounded-lg">
          <div className="text-2xl mb-2">🏆</div>
          <h4 className="font-semibold text-sm mb-1">Complete Milestones</h4>
          <p className="text-xs text-muted-foreground">
            Achieve goals to unlock new features and capabilities
          </p>
        </div>
        <div className="text-center p-4 bg-card/50 rounded-lg">
          <div className="text-2xl mb-2">🌌</div>
          <h4 className="font-semibold text-sm mb-1">Explore Deeper</h4>
          <p className="text-xs text-muted-foreground">
            Visit the full experience for advanced projects and features
          </p>
        </div>
      </div>

      {showTipsPanel && (
        <div className="border-t border-border pt-4">
          <TipsPanel />
        </div>
      )}
    </div>
  );
}
