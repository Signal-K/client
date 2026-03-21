export interface CommentVote {
  type: "comment" | "vote";
  created_at: string;
  content?: string;
  vote_type?: string;
  classification_id: number;
}

export interface Classification {
  id: number;
  classificationtype: string | null;
  content: string | null;
  created_at: string;
  anomaly: {
    content: string | null;
  } | null;
  classificationConfiguration?: {
    annotationOptions?: string[];
    [key: string]: any;
  };
}

export interface LinkedAnomaly {
  id: number;
  anomaly_id: number;
  date: string;
  automaton?: string;
  unlocked?: boolean;
  anomaly: {
    id: number | null;
    content: string | null;
    anomalytype: string | null;
    anomalySet: string | null;
  } | null;
}

export interface OtherClassification {
  id: number;
  classificationtype: string | null;
  content: string | null;
  author: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  classificationPoints: number | null;
}

export interface VisibleStructures {
  telescope: boolean;
  satellites: boolean;
  rovers: boolean;
  balloons: boolean;
}
