import type { Anomaly, ViewMode } from "@/types/Structures/telescope"
import { generateSectorName, generateStars, filterAnomaliesBySector, seededRandom } from "@/src/components/classification/telescope/utils/sector-utils"

export interface DatabaseAnomaly {
  id: number
  content: string | null
  anomalytype: string | null
  avatar_url: string | null
  created_at: string
  configuration: any
  parentAnomaly: number | null
  anomalyConfiguration?: string | null;
  anomalySet: string | null
};

export interface DatabaseClassification {
  id: number
  created_at: string
  content: string | null
  author: string | null
  anomaly: number | null
  media: any
  classificationtype: string | null
  classificationConfiguration: any
};