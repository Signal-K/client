export interface SharedSatelliteProps {
  deployTime: Date | string;
  now?: Date;
  height?: number | string;
  width?: number | string;
  classification?: {
    id?: number | string;
    media?: any;
  };
  classificationId?: number | string;
  style?: React.CSSProperties;
  parentWidth?: number;
}

// Optional: if you want to define structure for weather anomalies
export interface WeatherAnomalyEntry {
  id: number;
  anomaly_id: number;
  author: string;
  automaton: string;
  date: string;
  classification_id?: string;
  [key: string]: any;
}

export interface PlanetStats {
  mass: number;
  radius: number;
  density: number;
  temp: number;
  type?: string;
}

export type SatelliteDirection = "left" | "right";