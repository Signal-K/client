export type CloudCategory =
  | "CloudyRegion"
  | "Ozone"
  | "CanyonCrater"
  | "Twilightzonecloud"
  | "Streakcloud"
  | "Diskcloud"
  | "Vortexcloud"
  | "Dottedcloud"
  | "Gravitywavecloud"
  | "Othercloudtype"

export interface CategoryConfig {
  name: string
  color: string
  description: string
  iconUrl?: string
}

export const CloudCategories: Record<CloudCategory, CategoryConfig> = {
  CloudyRegion: {
    name: "Cloudy Region",
    color: "#00BCD4",
    description: "A cloudy area without distinct or multiple cloud types",
  },
  Ozone: {
    name: "Ozone",
    description: "Pink region on the map",
    color: "#ff3398",
  },
  CanyonCrater: {
    name: "Canyon / Crater",
    color: "#1a13dc",
    description: "Depressed region on the map with a blue tint",
  },
  Twilightzonecloud: {
    name: "Twilight zone cloud",
    color: "#f20c26",
    description: "A cloud near the red terminator line",
  },
  Streakcloud: {
    name: "Streak cloud",
    color: "#770cf2",
    description: "Long, narrow and straight feature",
  },
  Diskcloud: {
    name: "Disk cloud",
    color: "#44ba25",
    description: "Small round circles that resemble disks or caps",
  },
  Vortexcloud: {
    name: "Vortex Cloud",
    color: "#dcc40e",
    description: "A cloud that turns in on itself, with a spiral shape",
  },
  Dottedcloud: {
    name: "Dotted cloud",
    color: "#7bb9d1",
    description: "Small patches of clouds without strict direction or structure",
  },
  Gravitywavecloud: {
    name: "Gravity wave cloud",
    description: "A rippled cloud pattern with a preferred direction where the cloud disappears and reappears",
    color: "#0c749d",
  },
  Othercloudtype: {
    name: "Other cloud type",
    color: "#340a65",
    description: "A cloud that doesn't fit into the other categories",
  },
}

// Helper function to convert hex color to THREE.js Vector3 RGB values (0-1)
export function hexToRgb(hex: string): [number, number, number] {
  // Remove the # if present
  hex = hex.replace("#", "")

  // Parse the hex values
  const r = Number.parseInt(hex.substring(0, 2), 16) / 255
  const g = Number.parseInt(hex.substring(2, 4), 16) / 255
  const b = Number.parseInt(hex.substring(4, 6), 16) / 255

  return [r, g, b]
}

// Get cloud pattern function based on cloud type
export function getCloudPattern(cloudType: CloudCategory): string {
  switch (cloudType) {
    case "Streakcloud":
      return `
    // Streak cloud pattern - long, narrow and straight with higher contrast
    float streakPattern(vec2 uv, float time) {
      float angle = 0.7; // Angle of the streaks
      float frequency = 15.0; // Increased frequency of the streaks
      float streaks = sin(uv.x * cos(angle) + uv.y * sin(angle) * frequency + time * 0.3);
      return smoothstep(0.2, 0.8, streaks * 0.5 + 0.5) * 1.5; // Increased intensity
    }
  `
    case "Diskcloud":
      return `
    // Disk cloud pattern - small round circles with higher contrast
    float diskPattern(vec2 uv, float time) {
      vec2 center = vec2(0.5, 0.5);
      float disks = 0.0;
      
      // Create multiple disks
      for (int i = 0; i < 5; i++) {
        vec2 diskCenter = center + vec2(
          sin(float(i) * 1.5 + time * 0.1) * 0.3,
          cos(float(i) * 2.3 + time * 0.05) * 0.3
        );
        float dist = distance(uv, diskCenter);
        disks += smoothstep(0.15, 0.05, dist) * 1.5; // Increased size and intensity
      }
      
      return min(disks, 1.5); // Allow for higher intensity
    }
  `
    case "Vortexcloud":
      return `
    // Vortex cloud pattern - spiral shape with enhanced contrast
    float vortexPattern(vec2 uv, float time) {
      vec2 center = vec2(0.5, 0.5);
      vec2 tc = uv - center;
      float dist = length(tc);
      float angle = atan(tc.y, tc.x) + dist * 8.0 + time * 0.3;
      float spiral = smoothstep(0.3, 0.7, sin(angle) * 0.5 + 0.5);
      float edge = smoothstep(0.6, 0.0, dist);
      return spiral * edge * 1.5; // Increased intensity
    }
  `
    case "Dottedcloud":
      return `
        // Dotted cloud pattern - small patches without structure
        float dottedPattern(vec2 uv, float time) {
          float dots = 0.0;
          
          // Create multiple dots
          for (int i = 0; i < 20; i++) {
            vec2 dotCenter = vec2(
              fract(sin(float(i) * 78.233 + time * 0.1) * 43758.5453),
              fract(cos(float(i) * 12.9898 + time * 0.1) * 43758.5453)
            );
            float dist = distance(uv, dotCenter);
            dots += smoothstep(0.05, 0.02, dist);
          }
          
          return min(dots, 1.0);
        }
      `
    case "Gravitywavecloud":
      return `
        // Gravity wave cloud pattern - rippled with preferred direction
        float gravityWavePattern(vec2 uv, float time) {
          float waves = sin(uv.x * 20.0 + time * 0.3) * sin(uv.y * 5.0 + time * 0.2);
          return smoothstep(0.0, 0.2, waves * 0.5 + 0.5);
        }
      `
    case "CloudyRegion":
      return `
        // General cloudy region pattern
        float cloudyRegionPattern(vec2 uv, float time) {
          float noise = sin(uv.x * 10.0 + time * 0.1) * cos(uv.y * 8.0 + time * 0.2);
          return smoothstep(0.2, 0.8, noise * 0.5 + 0.5);
        }
      `
    case "Twilightzonecloud":
      return `
        // Twilight zone cloud pattern - near terminator line
        float twilightPattern(vec2 uv, float time) {
          float edge = smoothstep(0.4, 0.6, uv.x) * (1.0 - smoothstep(0.6, 0.8, uv.x));
          float waves = sin(uv.y * 15.0 + time * 0.2) * 0.5 + 0.5;
          return edge * waves;
        }
      `
    case "Ozone":
      return `
        // Ozone pattern - thin layer
        float ozonePattern(vec2 uv, float time) {
          float band = smoothstep(0.45, 0.55, uv.y) * (1.0 - smoothstep(0.55, 0.65, uv.y));
          float variation = sin(uv.x * 20.0 + time * 0.1) * 0.1 + 0.9;
          return band * variation;
        }
      `
    case "CanyonCrater":
      return `
        // Canyon/Crater pattern - depressed region
        float canyonPattern(vec2 uv, float time) {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(uv, center);
          float crater = smoothstep(0.3, 0.0, dist);
          float rim = smoothstep(0.3, 0.25, dist) * (1.0 - smoothstep(0.25, 0.2, dist));
          return crater + rim;
        }
      `
    default:
      return `
        // Default cloud pattern
        float defaultPattern(vec2 uv, float time) {
          float noise = sin(uv.x * 10.0 + time * 0.1) * cos(uv.y * 8.0 + time * 0.2);
          return smoothstep(0.2, 0.8, noise * 0.5 + 0.5);
        }
      `
  };
};

// Get the pattern function name for a cloud type
export function getPatternFunctionName(cloudType: CloudCategory): string {
  switch (cloudType) {
    case "Streakcloud":
      return "streakPattern"
    case "Diskcloud":
      return "diskPattern"
    case "Vortexcloud":
      return "vortexPattern"
    case "Dottedcloud":
      return "dottedPattern"
    case "Gravitywavecloud":
      return "gravityWavePattern"
    case "CloudyRegion":
      return "cloudyRegionPattern"
    case "Twilightzonecloud":
      return "twilightPattern"
    case "Ozone":
      return "ozonePattern"
    case "CanyonCrater":
      return "canyonPattern"
    default:
      return "defaultPattern"
  };
};