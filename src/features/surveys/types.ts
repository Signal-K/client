export type MicroSurveyQuestion = {
  id: string;
  prompt: string;
  options: readonly string[];
  required?: boolean;
};

export type MechanicId =
  | "telescope"
  | "satellite"
  | "rover"
  | "solar"
  | "inventory";

export type MechanicCoverageTag =
  | "comprehension"
  | "clarity"
  | "confidence"
  | "pace"
  | "intent";

export type MechanicQuestion = {
  id: string;
  mechanicId: MechanicId;
  prompt: string;
  options: readonly [string, string, string];
  coverage: MechanicCoverageTag;
};

export type MechanicMicroSurvey = {
  id: string;
  title: string;
  subtitle: string;
  triggerSurface: "game" | "ecosystem";
  questions: readonly [MicroSurveyQuestion, MicroSurveyQuestion?];
  /** Minimum number of relevant classifications before this survey is shown. */
  minClassificationsRequired?: number;
  /** Which classification types count toward minClassificationsRequired. */
  relevantClassificationTypes?: readonly string[];
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

export type PlaythroughSurveyPlan = {
  id: string;
  quota: number;
  questionIds: string[];
  answeredIds: string[];
  skippedIds: string[];
};
