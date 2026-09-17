import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "./Progress"
import type { Milestone } from "@/types/milestone"
import { Trophy, Target, Globe } from "lucide-react"

const iconMap = {
  animals: Trophy,
  stations: Target,
  biomes: Globe,
}

interface MilestonesProps {
  milestones: Milestone[]
}

export function Milestones({ milestones }: MilestonesProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-blue-400">Research Milestones</h2>
      <div className="grid gap-4">
        {milestones.map((milestone) => {
          const Icon = iconMap[milestone.type]

          return (
            <Card key={milestone.id} className="bg-black/40 border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg text-white">
                  <Icon className="w-5 h-5 text-blue-400" />
                  {milestone.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-400 mb-2">{milestone.description}</p>
                <div className="space-y-1">
                  <Progress value={milestone.current} max={milestone.target} />
                  <p className="text-sm text-blue-400">
                    Progress: {milestone.current} / {milestone.target}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

