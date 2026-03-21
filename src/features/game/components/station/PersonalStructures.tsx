"use client";

// Subtle background animations for the user's deployed structures.
// Satellite orbits, rover crawls, telescope sweeps — all CSS, ~15% opacity.

interface PersonalStructuresProps {
  deployed: {
    telescope: boolean;
    satellite: boolean;
    rover: boolean;
    solar: boolean;
  };
}

export function PersonalStructures({ deployed }: PersonalStructuresProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Satellite — orbits a fixed point in upper-right */}
      {deployed.satellite && (
        <div
          className="absolute"
          style={{ top: "15%", right: "20%", opacity: 0.15, willChange: "transform" }}
        >
          <span
            className="block text-2xl"
            style={{ animation: "orbit 20s linear infinite", "--orbit-radius": "28px" } as any}
          >
            🛰️
          </span>
        </div>
      )}

      {/* Rover — crawls slowly across a terrain strip near bottom */}
      {deployed.rover && (
        <div
          className="absolute bottom-[12%] left-0"
          style={{ opacity: 0.15, animation: "vehicle-fly 45s linear -10s infinite", willChange: "transform" }}
        >
          <span className="text-xl">🚗</span>
        </div>
      )}

      {/* Telescope — slow sweep rotation in lower-left */}
      {deployed.telescope && (
        <div
          className="absolute bottom-[20%] left-[8%]"
          style={{ opacity: 0.12, animation: "radar-sweep 12s linear infinite", willChange: "transform", transformOrigin: "bottom center" }}
        >
          <span className="text-2xl">🔭</span>
        </div>
      )}
    </div>
  );
}
