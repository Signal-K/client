import React from "react";

export default function SatellitePlanetSVG({
  planet,
  mainColor,
  accentColor,
  shape,
  texture,
  patternDefs,
  children,
}: {
  planet: any;
  mainColor: string;
  accentColor: string;
  shape: string;
  texture: string | null;
  patternDefs: React.ReactNode;
  children?: React.ReactNode;
}) {
  let shapeSvg = null;
  if (shape === "circle") {
    shapeSvg = <circle cx="160" cy="160" r="130" fill={texture ? "url(#planetTexture)" : mainColor} />;
  } else if (shape === "ellipse") {
    shapeSvg = <ellipse cx="160" cy="170" rx="130" ry="100" fill={texture ? "url(#planetTexture)" : mainColor} />;
  } else if (shape === "hexagon") {
    shapeSvg = <polygon points="160,40 270,110 270,230 160,300 50,230 50,110" fill={texture ? "url(#planetTexture)" : mainColor} />;
  } else if (shape === "diamond") {
    shapeSvg = <polygon points="160,40 300,160 160,300 20,160" fill={texture ? "url(#planetTexture)" : mainColor} />;
  } else if (shape === "star") {
    shapeSvg = <polygon points="160,40 185,130 270,130 200,180 225,270 160,220 95,270 120,180 50,130 135,130" fill={texture ? "url(#planetTexture)" : mainColor} />;
  } else if (shape === "pentagon") {
    shapeSvg = <polygon points="160,40 270,120 220,260 100,260 50,120" fill={texture ? "url(#planetTexture)" : mainColor} />;
  }
  return (
    <div className="absolute left-1/2 top-1/2 z-10" style={{ transform: "translate(-50%, -50%)" }}>
      <svg width="320" height="320" viewBox="0 0 320 320" className="drop-shadow-2xl">
        <defs>{patternDefs}</defs>
        {shapeSvg}
        <ellipse cx="160" cy="220" rx="100" ry="24" fill={accentColor} fillOpacity="0.13" />
        <ellipse cx="160" cy="240" rx="80" ry="16" fill={mainColor} fillOpacity="0.09" />
      </svg>
      {children}
    </div>
  );
}
