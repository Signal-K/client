"use client";

import Link from "next/link";
import { SkillTreeSection } from "@/components/Research/SkillTree/skill-tree-section";

export default function ResearchProgressSection() {
  return (
    <div className="bg-background/20 backdrop-blur-sm rounded-lg border border-[#78cce2]/30 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-primary">Research & Development</h3>
          <p className="text-sm text-muted-foreground">
            Unlock new capabilities by advancing through the skill tree
          </p>
        </div>
        <Link 
          href="/research/tree"
          className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition"
        >
          View Full Tree
        </Link>
      </div>
      
      <div className="mb-4 p-4 bg-card/50 rounded-lg border">
        <p className="text-sm text-muted-foreground">
          <strong>How it works:</strong> Make classifications to unlock research skills. 
          Each skill provides new tools and capabilities for your space exploration journey.
        </p>
      </div>
      
      <SkillTreeSection isFullTree={false} />
    </div>
  );
}
