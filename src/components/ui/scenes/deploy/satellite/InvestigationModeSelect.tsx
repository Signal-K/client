import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/src/components/ui/select";

export default function InvestigationModeSelect({ value, onChange }: { value: 'weather' | 'planets'; onChange: (v: 'weather' | 'planets') => void }) {
  return (
    <Select value={value} onValueChange={v => onChange(v as 'weather' | 'planets')}>
      <SelectTrigger
        className="w-full min-h-[56px] px-4 py-3 rounded-lg border border-[#232b3b] bg-[#181e2a] text-[#e4eff0] font-medium text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-[#78cce2] transition-all text-left whitespace-normal"
        style={{ maxWidth: '100%', whiteSpace: 'normal', alignItems: 'flex-start', display: 'flex' }}
      >
        <div className="flex flex-col items-start w-full whitespace-normal">
          {value === 'weather' ? (
            <>
              <span className="text-[#e4eff0] text-sm font-medium leading-snug">Weather Investigation</span>
              <span className="text-xs text-[#78cce2] leading-tight">Clouds, storms, atmospheric phenomena</span>
            </>
          ) : (
            <>
              <span className="text-[#e4eff0] text-sm font-medium leading-snug">Planet Investigation</span>
              <span className="text-xs text-[#78cce2] leading-tight">Radius, density, orbit, temperature</span>
            </>
          )}
        </div>
      </SelectTrigger>
      <SelectContent className="bg-[#181e2a] border border-[#232b3b] text-[#e4eff0] w-full min-w-[260px]">
        <SelectItem value="weather" className="py-3 px-4">
          <div className="flex flex-col">
            <span className="text-[#e4eff0] font-semibold">Weather Investigation</span>
            <span className="text-xs text-[#78cce2]">Clouds, storms, atmospheric phenomena</span>
          </div>
        </SelectItem>
        <SelectItem value="planets" className="py-3 px-4">
          <div className="flex flex-col">
            <span className="text-[#e4eff0] font-semibold">Planet Investigation</span>
            <span className="text-xs text-[#78cce2]">Radius, density, orbit, temperature</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
