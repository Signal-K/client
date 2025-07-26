"use client"

import { Globe, Eye, AsteriskIcon as Asteroid, Activity, Star, Radar, Search, Target, Atom } from "lucide-react";

export const SkillIcons = {
  "planet-hunting": <Globe className="h-6 w-6" />,
  "planetary-analysis": <Search className="h-6 w-6" />,
  "planet-exploration": <Target className="h-6 w-6" />,
  "planet-visualization": <Eye className="h-6 w-6" />,
  "asteroid-hunting": <Asteroid className="h-6 w-6" />,
  "active-asteroids": <Activity className="h-6 w-6" />,
  "stellar-analysis": <Star className="h-6 w-6" />,
  "deep-space-survey": <Radar className="h-6 w-6" />,
};

export function getSkillIcon(skillId: string) {
  return SkillIcons[skillId as keyof typeof SkillIcons] || <Atom className="h-6 w-6" />
};