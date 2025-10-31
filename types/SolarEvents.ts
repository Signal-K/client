export interface SolarEvent {
  id: string;
  week_start: string;
  week_end: string;
  was_defended: boolean;
  created_at: string;
  updated_at: string;
}

export interface DefensiveProbe {
  id: string;
  event_id: string;
  user_id: string;
  count: number;
  launched_at: string;
}

export interface CommunityProgress {
  totalClassifications: number;
  totalProbes: number;
  userClassifications: number;
  userProbes: number;
  threshold: number;
  percentComplete: number;
}

export interface SolarEventWithProgress extends SolarEvent {
  communityProgress: CommunityProgress;
}
