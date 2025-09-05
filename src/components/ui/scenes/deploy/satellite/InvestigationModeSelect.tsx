import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/src/components/ui/select";

export default function InvestigationModeSelect({ value, onChange }: { value: 'weather' | 'planets'; onChange: (v: 'weather' | 'planets') => void }) {
  return (
    <Select value={value} onValueChange={v => onChange(v as 'weather' | 'planets')}>
      <SelectTrigger className="w-64">
        {value === 'weather' ? (
          <span>
            Weather Anomalies
            <span className="block text-xs text-slate-400">Clouds, storms, atmospheric phenomena</span>
          </span>
        ) : (
          <span>
            Physical Properties
            <span className="block text-xs text-slate-400">Radius, density, orbit, temperature</span>
          </span>
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="weather">
          Weather Anomalies
          <div className="text-xs text-slate-400">Clouds, storms, atmospheric phenomena</div>
        </SelectItem>
        <SelectItem value="planets">
          Physical Properties
          <div className="text-xs text-slate-400">Radius, density, orbit, temperature</div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
