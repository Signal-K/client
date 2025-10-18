import React from "react";

interface PlanetMissionProps {
  isVertical: boolean;
  width: number | string;
  pxHeight: number;
  style?: React.CSSProperties;
  steps: any[];
  elapsed: number;
  currentStepIdx: number;
  firstImage?: string;
  planetStats: any;
  handleCalculate: () => void;
  inputs: { [key: number]: string };
  handleInputChange: (idx: number, value: string) => void;
  stellar: any;
  pxWidth: number;
  satPos: number;
  satSize: number;
  barEnd: number;
  barStart: number;
  segmentLength: number;
  clampedStepIdx: number;
  hideCards: boolean;
  creatingClassification: boolean;
  stepProgress: number;
}

export default function PlanetMission(props: PlanetMissionProps) {
  const {
    isVertical,
    steps,
    elapsed,
    firstImage,
    planetStats,
    handleCalculate,
    inputs,
    handleInputChange,
    stellar,
    pxWidth,
    satPos,
    satSize,
    barEnd,
    barStart,
    segmentLength,
    clampedStepIdx,
    creatingClassification,
    style,
  } = props;
  
  // MOBILE
  if (isVertical) {
    return (
      <div style={{ width: "100%", ...style }}>
        <div style={{ padding: "20px 16px 200px" }}>
          {steps.map((step, i) => {
            if (i === 0 && elapsed < 0) return null;
            if (i === 2 && elapsed < 20 * 60 * 1000) return null;
            if (i === 4 && elapsed < 40 * 60 * 1000) return null;

            const isActive = i === clampedStepIdx;

            return (
              <div
                key={i}
                style={{
                  marginBottom: 20,
                  background: "#1a2332",
                  border: `2px solid ${isActive ? "#78cce2" : "#3a4a5e"}`,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div style={{ color: isActive ? "#78cce2" : "#e4eff0", fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
                  {i + 1}. {step.label}
                </div>
                <div style={{ color: "#b8c5d0", fontSize: 14, marginBottom: 12, lineHeight: 1.5 }}>
                  {step.description}
                </div>

                {i === 0 && firstImage && (
                  <div style={{ textAlign: "center" }}>
                    <img
                      src={firstImage}
                      alt="Lightcurve"
                      style={{ width: "100%", maxWidth: 280, borderRadius: 8, border: "2px solid #78cce2", cursor: "pointer" }}
                      onClick={() => window.open(firstImage, "_blank")}
                    />
                    <div style={{ marginTop: 8, fontSize: 13, color: "#78cce2" }}>Tap to enlarge</div>
                  </div>
                )}

                {i === 1 && stellar && (
                  <div style={{ color: "#e4eff0", fontSize: 14 }}>
                    <div>Temp: {stellar.temp} K</div>
                    <div>Radius: {stellar.radius} R☉</div>
                    <div>Mass: {stellar.mass} M☉</div>
                  </div>
                )}

                {i === 2 && elapsed >= 20 * 60 * 1000 && (
                  <>
                    <div style={{ fontSize: 13, color: "#9eb3c2", marginBottom: 10, padding: 10, background: "rgba(120, 204, 226, 0.1)", borderRadius: 6 }}>
                      💡 Measure time between dips (days)
                    </div>
                    <input
                      type="number"
                      value={inputs[2] || ""}
                      onChange={(e) => handleInputChange(2, e.target.value)}
                      placeholder="Orbital period (days)"
                      style={{ width: "100%", padding: 12, fontSize: 15, borderRadius: 8, border: "2px solid #78cce2", background: "#0f1419", color: "#e4eff0", boxSizing: "border-box" }}
                    />
                  </>
                )}

                {i === 3 && (
                  <>
                    <div style={{ fontSize: 13, color: "#9eb3c2", marginBottom: 10, padding: 10, background: "rgba(120, 204, 226, 0.1)", borderRadius: 6 }}>
                      💡 Measure depth of dips (0.001-0.1)
                    </div>
                    <input
                      type="number"
                      step="any"
                      value={inputs[3] || ""}
                      onChange={(e) => handleInputChange(3, e.target.value)}
                      placeholder="e.g. 0.01"
                      style={{ width: "100%", padding: 12, fontSize: 15, borderRadius: 8, border: "2px solid #78cce2", background: "#0f1419", color: "#e4eff0", boxSizing: "border-box" }}
                    />
                  </>
                )}

                {i === 4 && (
                  <>
                    {planetStats ? (
                      <div style={{ color: "#e4eff0", fontSize: 14 }}>
                        <div>Mass: {planetStats.mass.toFixed(2)} M⊕</div>
                        <div>Radius: {planetStats.radius.toFixed(2)} R⊕</div>
                        <div>Density: {planetStats.density.toFixed(2)} g/cm³</div>
                        <div>Temp: {planetStats.temp.toFixed(0)} K</div>
                        <div>Type: {planetStats.type}</div>
                      </div>
                    ) : (
                      <button
                        onClick={handleCalculate}
                        disabled={creatingClassification}
                        style={{ width: "100%", padding: 14, fontSize: 16, fontWeight: 700, background: creatingClassification ? "#4a5b6e" : "#78cce2", color: "#0a0e14", border: "none", borderRadius: 8, cursor: creatingClassification ? "not-allowed" : "pointer" }}
                      >
                        {creatingClassification ? "Calculating..." : "Calculate Stats"}
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // DESKTOP
  return (
    <div style={{ width: "100%", position: "relative", ...style }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 0", position: "relative" }}>
        <svg width={pxWidth} height={60}>
          <rect x={barStart} y={25} width={barEnd - barStart} height={10} rx={5} fill="#1a2332" />
          <rect x={barStart} y={25} width={satPos - barStart} height={10} rx={5} fill="#78cce2" />
          {steps.map((_, i) => (
            <circle key={i} cx={barStart + i * segmentLength} cy={30} r={10} fill={i <= clampedStepIdx ? "#78cce2" : "#1a2332"} stroke="#e4eff0" strokeWidth={2} />
          ))}
        </svg>
        <div style={{ position: "absolute", left: satPos + 20, top: "50%", transform: "translateY(-50%)", width: satSize, height: satSize, transition: "left 0.5s ease", filter: "drop-shadow(0 4px 12px rgba(120, 204, 226, 0.6))" }}>
          <svg width={satSize} height={satSize} viewBox="0 0 40 40" fill="none">
            <rect x="16" y="14" width="8" height="12" rx="3" fill="#78cce2" stroke="#e4eff0" strokeWidth="1.2" />
            <rect x="6" y="17" width="8" height="6" rx="2" fill="#232b3b" stroke="#78cce2" strokeWidth="1.1" />
            <rect x="26" y="17" width="8" height="6" rx="2" fill="#232b3b" stroke="#78cce2" strokeWidth="1.1" />
            <rect x="19" y="8" width="2" height="8" rx="1" fill="#e4eff0" />
            <circle cx="20" cy="7" r="2" fill="#f2c572" stroke="#e4eff0" strokeWidth="0.8" />
          </svg>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, padding: "0 40px 40px", maxWidth: 1400, margin: "0 auto" }}>
        {steps.map((step, i) => {
          if (i === 0 && elapsed < 0) return null;
          if (i === 2 && elapsed < 20 * 60 * 1000) return null;
          if (i === 4 && elapsed < 40 * 60 * 1000) return null;

          const isActive = i === clampedStepIdx;

          return (
            <div key={i} style={{ background: "#1a2332", border: `2px solid ${isActive ? "#78cce2" : "#3a4a5e"}`, borderRadius: 12, padding: 24, boxShadow: isActive ? "0 8px 24px rgba(120, 204, 226, 0.3)" : "0 4px 12px rgba(0,0,0,0.3)" }}>
              <div style={{ color: isActive ? "#78cce2" : "#e4eff0", fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
                {i + 1}. {step.label}
              </div>
              <div style={{ color: "#b8c5d0", fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
                {step.description}
              </div>

              {i === 0 && firstImage && (
                <div style={{ textAlign: "center" }}>
                  <img src={firstImage} alt="Lightcurve" style={{ width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 8, border: "2px solid #78cce2", cursor: "pointer" }} onClick={() => window.open(firstImage, "_blank")} />
                  <div style={{ marginTop: 10, fontSize: 13, color: "#78cce2", fontWeight: 600 }}>📊 Click to enlarge</div>
                </div>
              )}

              {i === 1 && stellar && (
                <div style={{ background: "rgba(120, 204, 226, 0.1)", padding: 16, borderRadius: 8, color: "#e4eff0", fontSize: 15 }}>
                  <div style={{ marginBottom: 6 }}><strong>Temp:</strong> {stellar.temp} K</div>
                  <div style={{ marginBottom: 6 }}><strong>Radius:</strong> {stellar.radius} R☉</div>
                  <div><strong>Mass:</strong> {stellar.mass} M☉</div>
                </div>
              )}

              {i === 2 && elapsed >= 20 * 60 * 1000 && (
                <>
                  <div style={{ fontSize: 13, color: "#9eb3c2", marginBottom: 12, padding: 12, background: "rgba(120, 204, 226, 0.1)", borderRadius: 8, borderLeft: "4px solid #78cce2" }}>
                    <strong style={{ color: "#78cce2" }}>How to find:</strong><br />Measure time between dips (days)
                  </div>
                  <input type="number" value={inputs[2] || ""} onChange={(e) => handleInputChange(2, e.target.value)} placeholder="Enter period (days)" style={{ width: "100%", padding: 12, fontSize: 15, borderRadius: 8, border: "2px solid #78cce2", background: "#0f1419", color: "#e4eff0", boxSizing: "border-box" }} />
                </>
              )}

              {i === 3 && (
                <>
                  <div style={{ fontSize: 13, color: "#9eb3c2", marginBottom: 12, padding: 12, background: "rgba(120, 204, 226, 0.1)", borderRadius: 8, borderLeft: "4px solid #78cce2" }}>
                    <strong style={{ color: "#78cce2" }}>How to find:</strong><br />Measure depth (0.001-0.1)
                  </div>
                  <input type="number" step="any" value={inputs[3] || ""} onChange={(e) => handleInputChange(3, e.target.value)} placeholder="e.g. 0.01" style={{ width: "100%", padding: 12, fontSize: 15, borderRadius: 8, border: "2px solid #78cce2", background: "#0f1419", color: "#e4eff0", boxSizing: "border-box" }} />
                </>
              )}

              {i === 4 && (
                <>
                  {planetStats ? (
                    <div style={{ background: "rgba(120, 204, 226, 0.1)", padding: 16, borderRadius: 8, color: "#e4eff0", fontSize: 15 }}>
                      <div style={{ marginBottom: 6 }}><strong>Mass:</strong> {planetStats.mass.toFixed(2)} M⊕</div>
                      <div style={{ marginBottom: 6 }}><strong>Radius:</strong> {planetStats.radius.toFixed(2)} R⊕</div>
                      <div style={{ marginBottom: 6 }}><strong>Density:</strong> {planetStats.density.toFixed(2)} g/cm³</div>
                      <div style={{ marginBottom: 6 }}><strong>Temp:</strong> {planetStats.temp.toFixed(0)} K</div>
                      <div><strong>Type:</strong> {planetStats.type}</div>
                    </div>
                  ) : (
                    <button onClick={handleCalculate} disabled={creatingClassification} style={{ width: "100%", padding: 14, fontSize: 16, fontWeight: 700, background: creatingClassification ? "#4a5b6e" : "#78cce2", color: "#0a0e14", border: "none", borderRadius: 8, cursor: creatingClassification ? "not-allowed" : "pointer" }}>
                      {creatingClassification ? "Calculating..." : "Calculate Planet Stats"}
                    </button>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
