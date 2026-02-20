"use client";

import { useEffect, useMemo, useState } from "react";
import SatelliteProgressBar from "./SatelliteProgressBar";
import SatelliteSpiderScan from "./satelliteSpiderScan";

interface Satellite {
  id: string;
  x: number;
  y: number;
  hasUnclassifiedAnomaly: boolean;
  anomalyId?: string;
  tile: string;
  unlocked: boolean;
  linkedAnomalyId: string;
  deployTime: Date;
  anomalySet?: string;
}

interface SatellitePositionProps {
  satellites: Satellite[];
  flashingIndicator?: boolean;
}

export default function SatellitePosition({ satellites, flashingIndicator }: SatellitePositionProps) {
  const [linkedRows, setLinkedRows] = useState<any[]>([]);
  const activeSatellites = useMemo(() => satellites.filter((s) => s.unlocked), [satellites]);

  useEffect(() => {
    async function loadLinkedRows() {
      const linkedRes = await fetch("/api/gameplay/linked-anomalies?automaton=WeatherSatellite");
      const linkedPayload = await linkedRes.json().catch(() => ({}));
      const linked = linkedRes.ok ? linkedPayload?.linkedAnomalies || [] : [];
      if (!linked.length) {
        setLinkedRows([]);
        return;
      }

      const ids = [...new Set(linked.map((x: any) => Number(x.anomaly_id)).filter((x: number) => Number.isFinite(x)))];
      const anomalyRes = await fetch(`/api/gameplay/anomalies?ids=${ids.join(",")}&limit=500`);
      const anomalyPayload = await anomalyRes.json().catch(() => ({}));
      const anomalyMap = new Map(
        (anomalyRes.ok ? anomalyPayload?.anomalies || [] : []).map((a: any) => [Number(a.id), a])
      );

      const merged = linked
        .map((row: any) => {
          const anomaly = anomalyMap.get(Number(row.anomaly_id));
          if (!anomaly) return null;
          return {
            ...anomaly,
            linked_anomaly_id: row.id,
            classification_id: row.classification_id,
            date: row.date,
          };
        })
        .filter(Boolean);
      setLinkedRows(merged);
    }
    void loadLinkedRows();
  }, []);

  if (activeSatellites.length === 0) {
    return <div className="text-sm text-white/70">No active satellites.</div>;
  }

  return (
    <div className="w-full h-full rounded-xl bg-[#111827] border border-white/10 p-4">
      <div className="mb-3 text-sm text-white/80">
        Active satellites: {activeSatellites.length}
        {flashingIndicator ? " • new data incoming" : ""}
      </div>

      {linkedRows.length > 0 ? (
        <div className="mb-4 h-[360px] rounded-lg overflow-hidden border border-white/10 bg-[#0b1220]">
          <SatelliteSpiderScan anomalies={linkedRows as any} />
        </div>
      ) : null}

      <div className="space-y-4">
        {activeSatellites.map((satellite) => (
          <div key={satellite.id} className="rounded-lg bg-white/5 border border-white/10 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-white">Satellite #{satellite.id}</div>
              <div className="text-xs text-white/70">
                x:{Math.round(satellite.x)} y:{Math.round(satellite.y)}
              </div>
            </div>
            <SatelliteProgressBar deployTime={satellite.deployTime} width="100%" />
          </div>
        ))}
      </div>
    </div>
  );
}

