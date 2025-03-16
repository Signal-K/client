export interface Mission {
  id: string
  name: string
  xpReward: number
  coinReward: number
  progress: number
  totalSteps: number
  isComplete: boolean
};

export interface Project {
  id: string
  name: string
  missions?: Mission[]
  totalProgress: number
};

export interface Category {
  id: string
  name: string
  projects: Project[]
  totalTally: number
};