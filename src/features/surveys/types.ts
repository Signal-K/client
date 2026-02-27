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
