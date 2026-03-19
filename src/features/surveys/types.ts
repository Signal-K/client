export type MicroSurveyQuestion = {
  id: string;
  prompt: string;
  options: readonly string[];
  required?: boolean;
};

export type MechanicMicroSurvey = {
  id: string;
  title: string;
  subtitle: string;
  triggerSurface: "game" | "ecosystem";
  questions: readonly [MicroSurveyQuestion, MicroSurveyQuestion?];
};

export type ProjectType =
  | "planet-hunters"
  | "asteroid-hunting"
  | "rover"
  | "cloudspotting"
  | "sunspots";

export type ProjectEngagementSurvey = MechanicMicroSurvey & {
  projectType: ProjectType;
  contributionThreshold: number;
};
