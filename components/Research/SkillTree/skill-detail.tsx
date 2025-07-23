'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Rocket, Gem } from "lucide-react"
import type { SkillDetailProps } from "@/types/Reseearch/skill-tree"

export function SkillDetail({ skill, onUnlockSkill, isUnlockable }: SkillDetailProps) {
  const IconComponent = skill.icon;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unlocked":
        return "text-chart-1"
      case "available":
        return "text-chart-2"
      case "locked":
        return "text-muted-foreground"
      default:
        return "text-foreground"
    };
  };

  return (
    <Card className="bg-card border-chart-4/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-chart-4 text-lg flex items-center gap-2">
          <IconComponent className={`w-6 h-6 ${getStatusColor(skill.status)}`} />
          <span className={getStatusColor(skill.status)}>{skill.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">{skill.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-semibold text-foreground mb-1">Status</h5>
            <p className={`capitalize ${getStatusColor(skill.status)}`}>{skill.status}</p>
          </div>
          {skill.unlockCost !== undefined && (
            <div>
              <h5 className="font-semibold text-foreground mb-1">Unlock Cost</h5>
              <p className="flex items-center gap-1 text-chart-3">
                <Gem className="w-4 h-4" /> {skill.unlockCost} Stardust
              </p>
            </div>
          )}
        </div>

        {skill.prerequisites.length > 0 && (
          <div>
            <h5 className="font-semibold text-foreground mb-1">Prerequisites</h5>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {skill.prerequisites.map((prereq, index) => (
                <li key={index}>{prereq.type === "skill" ? `Unlock: ${prereq.value}` : `${prereq.value}`}</li>
              ))}
            </ul>
          </div>
        )}

        {skill.details && skill.details.length > 0 && (
          <div>
            <h5 className="font-semibold text-foreground mb-1">Effects</h5>
            <ul className="list-disc list-inside text-sm text-chart-1">
              {skill.details.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-4 border-t border-border mt-4">
          {skill.status === "available" && isUnlockable && (
            <Button
              className="w-full bg-chart-2 hover:bg-chart-2/90 text-primary-foreground"
              onClick={() => onUnlockSkill(skill.id)}
            >
              <Rocket className="w-4 h-4 mr-2" /> Unlock Skill
            </Button>
          )}
          {skill.status === "unlocked" && (
            <Button className="w-full bg-chart-1 hover:bg-chart-1/90 text-primary-foreground" disabled>
              Skill Unlocked
            </Button>
          )}
          {skill.status === "locked" && (
            <Button className="w-full bg-muted-foreground hover:bg-muted-foreground/90 text-background" disabled>
              Locked
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};