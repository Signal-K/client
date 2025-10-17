import React from "react";
import Link from "next/link";

// Define props for WeatherMission - these will be passed from SatelliteProgressBar
interface WeatherMissionProps {
  isVertical: boolean;
  width: number | string;
  pxHeight: number;
  style?: React.CSSProperties;
  steps: any[];
  currentStepIdx: number;
  satPos: number;
  satSize: number;
  barEnd: number;
  barStart: number;
  segmentLength: number;
  clampedStepIdx: number;
  pxWidth: number;
  weatherDirection: "left" | "right";
  isWeatherScanning: boolean;
  hideCards: boolean;
  currentAnomaly: any;
  anomalyPause: boolean;
  stepProgress: number;
}

export default function WeatherMission({
  isVertical,
  width,
  pxHeight,
  style,
  steps,
  currentStepIdx,
  satPos,
  satSize,
  barEnd,
  barStart,
  segmentLength,
  clampedStepIdx,
  pxWidth,
  weatherDirection,
  isWeatherScanning,
  hideCards,
  currentAnomaly,
  anomalyPause,
  stepProgress,
}: WeatherMissionProps) {
  const getClaissfyUrl = (anomaly: any) => {
    if (!anomaly || !anomaly.anomaly || !anomaly.anomaly.anomalySet) return "/";
    const anomalyId = anomaly.anomaly_id;
    const anomalySet = anomaly.anomaly.anomalySet;

    switch (anomalySet) {
      case "lidar-jovianVortexHunter":
        return `/structures/balloon/jvh/an-${anomalyId}/classify`;
      case "cloudspottingOnMars":
        return `/structures/balloon/shapes/an-${anomalyId}/classify`; // Mars clouds use shapes project
      case "balloon-marsCloudShapes":
        return `/structures/balloon/shapes/an-${anomalyId}/classify`;
      default:
        return "/";
    }
  };

  return (
    <div
      style={{
        width: isVertical ? "100%" : width,
        minHeight: isVertical ? "320px" : pxHeight + 320,
        height: isVertical ? "100%" : undefined,
        position: isVertical ? "relative" : "relative",
        display: isVertical ? "flex" : undefined,
        flexDirection: isVertical ? "row" : undefined,
        alignItems: isVertical ? "center" : undefined,
        justifyContent: isVertical ? "center" : undefined,
        overflow: isVertical ? "visible" : undefined,
        ...style,
      }}
    >
      {isVertical ? (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              position: "relative",
              zIndex: 5,
              width: "100%",
              height: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            {/* Left column: steps with even index (0, 2, 4, ...) */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                position: "static",
                zIndex: 5,
              }}
            >
              {steps.map((step, i) => {
                if (i % 2 !== 0) return null;
                return (
                  <div
                    key={i}
                    style={{
                      minWidth: 140,
                      maxWidth: 220,
                      marginBottom: 32,
                      textAlign: "right",
                      position: "relative",
                      right: 0,
                    }}
                  >
                    <div
                      style={{
                        background: "#181e2a",
                        border: "1.5px solid #78cce2",
                        borderRadius: 10,
                        boxShadow: "0 2px 8px #0006",
                        padding: 12,
                        minHeight: 48,
                        maxWidth: 220,
                        marginBottom: 8,
                        marginRight: 12,
                      }}
                    >
                      <div
                        style={{
                          color: i <= currentStepIdx ? "#78cce2" : "#e4eff0",
                          fontWeight: 600,
                          fontSize: 15,
                          marginBottom: 4,
                        }}
                      >
                        {step.label}
                      </div>
                      <div
                        style={{
                          color: "#e4eff0",
                          fontSize: 13,
                          marginBottom: 4,
                        }}
                      >
                        {step.description}
                      </div>
                      {i === 2 && anomalyPause && (
                        <div style={{ marginTop: 12 }}>
                          <Link href={getClaissfyUrl(currentAnomaly)} passHref>
                            <a
                              style={{
                                background: "#f2c572",
                                color: "#181e2a",
                                padding: "8px 16px",
                                borderRadius: 8,
                                textDecoration: "none",
                                fontWeight: 600,
                                fontSize: 14,
                                display: "inline-block",
                              }}
                            >
                              Classify
                            </a>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Center: vertical progress bar and satellite */}
            <div
              style={{
                position: "relative",
                width: pxHeight + 16,
                minWidth: pxHeight + 16,
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: pxHeight / 2 - satSize / 2 + 8,
                  top: satPos - satSize / 2,
                  width: satSize,
                  height: satSize,
                  zIndex: 11,
                  transition: "top 0.5s cubic-bezier(.4,1.6,.4,1)",
                  pointerEvents: "none",
                }}
              >
                <svg
                  width={satSize}
                  height={satSize}
                  viewBox="0 0 40 40"
                  fill="none"
                >
                  <rect
                    x="16"
                    y="14"
                    width="8"
                    height="12"
                    rx="3"
                    fill="#78cce2"
                    stroke="#e4eff0"
                    strokeWidth="1.2"
                  />
                  <rect
                    x="6"
                    y="17"
                    width="8"
                    height="6"
                    rx="2"
                    fill="#232b3b"
                    stroke="#78cce2"
                    strokeWidth="1.1"
                  />
                  <rect
                    x="26"
                    y="17"
                    width="8"
                    height="6"
                    rx="2"
                    fill="#232b3b"
                    stroke="#78cce2"
                    strokeWidth="1.1"
                  />
                  <rect
                    x="19"
                    y="8"
                    width="2"
                    height="8"
                    rx="1"
                    fill="#e4eff0"
                  />
                  <circle
                    cx="20"
                    cy="7"
                    r="2"
                    fill="#f2c572"
                    stroke="#e4eff0"
                    strokeWidth="0.8"
                  />
                  <circle
                    cx="20"
                    cy="26"
                    r="2.2"
                    fill="#232b3b"
                    stroke="#e4eff0"
                    strokeWidth="0.7"
                  />
                </svg>
              </div>
              <svg
                width={pxHeight}
                height={barEnd}
                style={{
                  position: "relative",
                  left: 8,
                  top: 0,
                  zIndex: 1,
                  margin: "0 auto",
                  display: "block",
                }}
              >
                <rect
                  x={pxHeight / 2 - 4}
                  y={barStart}
                  width={8}
                  height={barEnd - barStart}
                  rx={4}
                  fill="#232b3b"
                />
                <rect
                  x={pxHeight / 2 - 4}
                  y={barStart}
                  width={8}
                  height={satPos - barStart}
                  rx={4}
                  fill="#78cce2"
                />
                {steps.map((step, i) => (
                  <circle
                    key={i}
                    cx={pxHeight / 2}
                    cy={barStart + i * segmentLength}
                    r={10}
                    fill={i <= currentStepIdx ? "#78cce2" : "#232b3b"}
                    stroke="#e4eff0"
                    strokeWidth={i === currentStepIdx ? 2.5 : 1.2}
                  />
                ))}
              </svg>
            </div>
            {/* Right column: steps with odd index (1, 3, ...) */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                position: "static",
                zIndex: 5,
              }}
            >
              {steps.map((step, i) => {
                if (i % 2 !== 1) return null;
                return (
                  <div
                    key={i}
                    style={{
                      minWidth: 140,
                      maxWidth: 220,
                      marginBottom: 32,
                      textAlign: "left",
                      position: "relative",
                      left: 0,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: -12,
                        top: 32,
                        width: 24,
                        height: 0,
                        borderTop: "2px solid #78cce2",
                        zIndex: 2,
                      }}
                    />
                    <div
                      style={{
                        background: "#181e2a",
                        border: "1.5px solid #78cce2",
                        borderRadius: 10,
                        boxShadow: "0 2px 8px #0006",
                        padding: 12,
                        minHeight: 48,
                        maxWidth: 220,
                        marginBottom: 8,
                        marginLeft: 12,
                      }}
                    >
                      <div
                        style={{
                          color: i <= currentStepIdx ? "#78cce2" : "#e4eff0",
                          fontWeight: 600,
                          fontSize: 15,
                          marginBottom: 4,
                        }}
                      >
                        {step.label}
                      </div>
                      <div
                        style={{
                          color: "#e4eff0",
                          fontSize: 13,
                          marginBottom: 4,
                        }}
                      >
                        {step.description}
                      </div>
                      {i === 2 && anomalyPause && (
                        <div style={{ marginTop: 12 }}>
                          <Link href={getClaissfyUrl(currentAnomaly)} passHref>
                            <a
                              style={{
                                background: "#f2c572",
                                color: "#181e2a",
                                padding: "8px 16px",
                                borderRadius: 8,
                                textDecoration: "none",
                                fontWeight: 600,
                                fontSize: 14,
                                display: "inline-block",
                              }}
                            >
                              Classify
                            </a>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            minHeight: 420,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "relative",
              width: pxWidth,
              minHeight: pxHeight + 340,
              margin: "0 auto",
            }}
          >
            {/* Satellite icon above the progress bar */}
            <div
              style={{
                position: "absolute",
                left: satPos - satSize / 2,
                top: 140,
                width: satSize,
                height: satSize,
                zIndex: 10,
                transition: "left 0.5s cubic-bezier(.4,1.6,.4,1)",
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width={satSize}
                height={satSize}
                viewBox="0 0 40 40"
                fill="none"
                style={{
                  transform:
                    weatherDirection === "left"
                      ? "scaleX(-1)"
                      : "none",
                  transition: "transform 0.4s cubic-bezier(.4,1.6,.4,1)",
                }}
              >
                {/* Satellite SVG */}
                <rect x="16" y="14" width="8" height="12" rx="3" fill="#78cce2" stroke="#e4eff0" strokeWidth="1.2" />
                <rect x="6" y="17" width="8" height="6" rx="2" fill="#232b3b" stroke="#78cce2" strokeWidth="1.1" />
                <rect x="26" y="17" width="8" height="6" rx="2" fill="#232b3b" stroke="#78cce2" strokeWidth="1.1" />
                <rect x="19" y="8" width="2" height="8" rx="1" fill="#e4eff0" />
                <circle cx="20" cy="7" r="2" fill="#f2c572" stroke="#e4eff0" strokeWidth="0.8" />
                <circle cx="20" cy="26" r="2.2" fill="#232b3b" stroke="#e4eff0" strokeWidth="0.7" />
              </svg>
              {isWeatherScanning && (
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "100%",
                    transform: "translate(-50%, 0)",
                    width: 0,
                    height: 0,
                    zIndex: 12,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    className="satellite-scan-animation"
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: "2px dashed #78cce2",
                      opacity: 0.7,
                      animation: "satellite-scan-pulse 1.2s infinite",
                    }}
                  />
                  <style>{`
                    @keyframes satellite-scan-pulse {
                      0% { transform: scale(0.7); opacity: 0.7; }
                      50% { transform: scale(1.2); opacity: 0.3; }
                      100% { transform: scale(0.7); opacity: 0.7; }
                    }
                  `}</style>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <svg
              width={pxWidth}
              height={pxHeight}
              style={{
                position: "relative",
                left: 0,
                top: 140,
                zIndex: 1,
                display: "block",
              }}
            >
              <rect x={barStart} y={pxHeight / 2 - 4} width={barEnd - barStart} height={8} rx={4} fill="#232b3b" />
              <rect x={barStart} y={pxHeight / 2 - 4} width={satPos - barStart} height={8} rx={4} fill="#78cce2" />
              {steps.map((_, i) => (
                <circle
                  key={i}
                  cx={barStart + i * segmentLength}
                  cy={pxHeight / 2}
                  r={10}
                  fill={i <= clampedStepIdx ? "#78cce2" : "#232b3b"}
                  stroke="#e4eff0"
                  strokeWidth={i === clampedStepIdx ? 2.5 : 1.2}
                />
              ))}
            </svg>

            {/* SVG connectors for all cards */}
            {!hideCards && (
              <svg
                width={pxWidth}
                height={240}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  pointerEvents: "none",
                  zIndex: 2,
                }}
              >
                {steps.map((_, i) => {
                  const isAbove = i % 2 === 1;
                  const markerX = barStart + i * segmentLength;
                  const barY = 140 + pxHeight / 2;
                  const cardY = isAbove ? 40 : 140 + pxHeight + 100;
                  return (
                    <line
                      key={i}
                      x1={markerX}
                      y1={barY}
                      x2={markerX}
                      y2={cardY}
                      stroke="#78cce2"
                      strokeWidth={2}
                    />
                  );
                })}
              </svg>
            )}

            {/* Step cards */}
            {!hideCards &&
              steps.map((step, i) => {
                const isAbove = i % 2 === 1;
                const cardY = isAbove ? 40 : 140 + pxHeight + 100;

                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: `calc(${barStart + i * segmentLength}px - 130px)`,
                      top: cardY,
                      width: 260,
                      textAlign: "center",
                      zIndex: 3,
                      transition: "top 0.5s cubic-bezier(.4,1.6,.4,1)",
                    }}
                  >
                    <div
                      style={{
                        background: "#181e2a",
                        border: "1.5px solid #78cce2",
                        borderRadius: 10,
                        boxShadow: "0 2px 8px #0006",
                        padding: 16,
                        margin: "0 auto",
                        minHeight: 48,
                        maxWidth: 260,
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          color: i <= clampedStepIdx ? "#78cce2" : "#e4eff0",
                          fontWeight: 600,
                          fontSize: 17,
                          marginBottom: 6,
                        }}
                      >
                        {step.label}
                      </div>
                      <div
                        style={{
                          color: "#e4eff0",
                          fontSize: 13,
                          marginBottom: 4,
                        }}
                      >
                        {step.description}
                      </div>
                      {i === 2 && anomalyPause && (
                        <div style={{ marginTop: 12 }}>
                          <Link href={getClaissfyUrl(currentAnomaly)} passHref legacyBehavior>
                            <a
                              style={{
                                background: "#f2c572",
                                color: "#181e2a",
                                padding: "8px 16px",
                                borderRadius: 8,
                                textDecoration: "none",
                                fontWeight: 600,
                                fontSize: 14,
                                display: "inline-block",
                              }}
                            >
                              Classify
                            </a>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};