export interface SurfaceAnomaly {
  id: string
  x: number
  y: number
  rover: string
};

export function filterAnomaliesByRover(anomalies: SurfaceAnomaly[], roverId: string): SurfaceAnomaly[] {
  return anomalies.filter((anomaly) => anomaly.rover === roverId)
};

export function filterAnomaliesByRegion(
  anomalies: SurfaceAnomaly[],
  regionX: number,
  regionY: number,
): SurfaceAnomaly[] {
  return anomalies.filter((anomaly) => {
    // Convert anomaly position to region coordinates
    const anomalyRegionX = Math.floor((anomaly.x - 50) / 20)
    const anomalyRegionY = Math.floor((anomaly.y - 50) / 20)

    return anomalyRegionX === regionX && anomalyRegionY === regionY
  });
};