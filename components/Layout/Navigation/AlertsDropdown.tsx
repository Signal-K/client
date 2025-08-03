interface LinkedAnomaly {
  id: string;
  anomaly: {
    id: number;
    anomalytype: string;
    content: string;
    classification_status: string;
  };
  date: string; // updated from created_at to date
  automaton?: string; // Added automaton field
}