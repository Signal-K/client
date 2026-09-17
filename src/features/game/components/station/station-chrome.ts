export type StationChromeId =
  | "telescope"
  | "satellite"
  | "rover"
  | "solar"
  | "inventory";

export type StationChrome = {
  full: string;
  moduleId: string;
  accentRgb: string;
  borderColor: string;
  logLabel: string;
  skipLabel: string;
};

export const STATION_CHROME: Record<StationChromeId, StationChrome> = {
  telescope: {
    full: "Telescope Array",
    moduleId: "OBS-01",
    accentRgb: "136,192,208",
    borderColor: "rgba(136,192,208,0.25)",
    logLabel: "Log signal",
    skipLabel: "Skip this packet",
  },
  satellite: {
    full: "Satellite Control",
    moduleId: "COMMS-01",
    accentRgb: "56,189,248",
    borderColor: "rgba(56,189,248,0.25)",
    logLabel: "Log atmosphere",
    skipLabel: "Skip this downlink",
  },
  rover: {
    full: "Rover Operations",
    moduleId: "GND-01",
    accentRgb: "251,191,36",
    borderColor: "rgba(251,191,36,0.25)",
    logLabel: "Log terrain",
    skipLabel: "Skip this waypoint",
  },
  solar: {
    full: "Solar Watch",
    moduleId: "PWR-01",
    accentRgb: "251,146,60",
    borderColor: "rgba(251,146,60,0.25)",
    logLabel: "Log region",
    skipLabel: "Skip this capture",
  },
  inventory: {
    full: "Cargo Bay",
    moduleId: "AUX-02",
    accentRgb: "167,139,250",
    borderColor: "rgba(167,139,250,0.25)",
    logLabel: "Stow note",
    skipLabel: "Leave stowed",
  },
};

export function getStationChrome(stationId: string): StationChrome {
  return (
    STATION_CHROME[stationId as StationChromeId] ?? {
      full: stationId,
      moduleId: "MOD-??",
      accentRgb: "136,192,208",
      borderColor: "rgba(136,192,208,0.2)",
      logLabel: "Log observation",
      skipLabel: "Skip",
    }
  );
}
