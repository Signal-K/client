import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Sparkles, Lock } from "lucide-react"

export function SkillLegend() {
  return (
    <Card className="bg-[#005066]/90 border border-[#78cce2]/30 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#e4eff0] text-sm font-mono">LEGEND</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <CheckCircle className="h-4 w-4 text-[#78cce2]" />
          <span className="text-[#78cce2]">Unlocked</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Sparkles className="h-4 w-4 text-[#4e7988]" />
          <span className="text-[#4e7988]">Ready to Unlock</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Lock className="h-4 w-4 text-[#78cce2]" />
          <span className="text-[#78cce2]/60">Locked</span>
        </div>
      </CardContent>
    </Card>
  );
};