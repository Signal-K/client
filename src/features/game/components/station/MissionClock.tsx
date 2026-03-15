"use client";

import { useState, useEffect } from "react";

export function MissionClock() {
  const [time, setTime] = useState<string>("--:--:--");

  useEffect(() => {
    const fmt = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, "0");
      const m = String(now.getUTCMinutes()).padStart(2, "0");
      const s = String(now.getUTCSeconds()).padStart(2, "0");
      return `${h}:${m}:${s}`;
    };
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-[10px] tracking-widest text-muted-foreground/50 tabular-nums">
      UTC {time}
    </span>
  );
}
