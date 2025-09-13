-- Add anomalyConfiguration column to anomalies table
ALTER TABLE public.anomalies 
ADD COLUMN "anomalyConfiguration" jsonb;

-- Add comment to document the purpose of this column
COMMENT ON COLUMN public.anomalies."anomalyConfiguration" IS 'JSONB field for storing anomaly-specific configuration data';
