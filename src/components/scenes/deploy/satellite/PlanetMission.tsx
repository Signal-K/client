import React from "react";

// Define props for PlanetMission - these will be passed from SatelliteProgressBar
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

export default function PlanetMission({
  isVertical,
  width,
  pxHeight,
  style,
  steps,
  elapsed,
  currentStepIdx,
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
  hideCards,
  creatingClassification,
  stepProgress,
}: PlanetMissionProps) {
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
                if (i === 0 && elapsed < 0) return null;
                if (i === 2 && elapsed < 20 * 60 * 1000) return null;
                if (i === 4 && elapsed < 40 * 60 * 1000) return null;
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
                      {/* 1st card: show image from classification if available */}
                      {i === 0 && firstImage && (
                        <div style={{ margin: "8px 0" }}>
                          <img
                            src={firstImage}
                            alt="Deployment"
                            style={{
                              maxWidth: 120,
                              borderRadius: 8,
                              border: "1.5px solid #78cce2",
                            }}
                          />
                        </div>
                      )}
                      {/* 5th card: planet stats UI */}
                      {i === 4 && (
                        <div
                          style={{
                            marginTop: 10,
                            minHeight: 32,
                            color: "#e4eff0",
                            fontSize: 15,
                            fontStyle: "italic",
                            opacity: 0.9,
                          }}
                        >
                          {planetStats ? (
                            <>
                              <div>
                                Mass: <b>{planetStats.mass.toFixed(2)} M⊕</b>
                              </div>
                              <div>
                                Radius: <b>{planetStats.radius.toFixed(2)} R⊕</b>
                              </div>
                              <div>
                                Density: <b>{planetStats.density.toFixed(2)} g/cm³</b>
                              </div>
                              <div>
                                Temperature: <b>{planetStats.temp.toFixed(0)} K</b>
                              </div>
                              <div>
                                Type: <b>{planetStats.type}</b>
                              </div>
                            </>
                          ) : (
                            <button
                              style={{
                                marginTop: 8,
                                padding: "8px 18px",
                                background: "#78cce2",
                                color: "#181e2a",
                                borderRadius: 6,
                                fontWeight: 600,
                                fontSize: 15,
                                border: "1.5px solid #78cce2",
                                cursor: "pointer",
                              }}
                              onClick={handleCalculate}
                            >
                              Calculate
                            </button>
                          )}
                        </div>
                      )}
                      {/* 3rd card: input for orbital period */}
                      {i === 2 &&
                        elapsed >= 20 * 60 * 1000 && (
                          <div style={{ marginTop: 8 }}>
                            <input
                              type="number"
                              value={inputs[2] || ""}
                              onChange={e => handleInputChange(2, e.target.value)}
                              placeholder="Enter orbital period (days)"
                              style={{
                                width: "90%",
                                padding: 8,
                                borderRadius: 6,
                                border: "1.5px solid #78cce2",
                                background: "#232b3b",
                                color: "#e4eff0",
                                fontSize: 15,
                              }}
                            />
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
                if (i === 1 && elapsed < 10 * 60 * 1000) return null;
                if (i === 3 && elapsed < 30 * 60 * 1000) return null;
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
                      {/* 2nd card: show random stellar values */}
                      {i === 1 && stellar && (
                        <div
                          style={{
                            color: "#e4eff0",
                            fontSize: 15,
                            margin: "8px 0",
                          }}
                        >
                          <div>
                            Stellar Temp: <b>{stellar.temp} K</b>
                          </div>
                          <div>
                            Stellar Radius: <b>{stellar.radius} R☉</b>
                          </div>
                          <div>
                            Stellar Mass: <b>{stellar.mass} M☉</b>
                          </div>
                        </div>
                      )}
                      {/* 4th card: input for flux value */}
                      {i === 3 && (
                        <div
                          style={{
                            color: "#e4eff0",
                            fontSize: 15,
                            margin: "8px 0",
                          }}
                        >
                          <label
                            htmlFor="flux-input-mobile"
                            style={{ marginRight: 8 }}
                          >
                            Planetary Flux (Transit Depth):
                          </label>
                          <input
                            id="flux-input-mobile"
                            type="number"
                            step="any"
                            value={inputs[3] || ""}
                            onChange={e => handleInputChange(3, e.target.value)}
                            placeholder="Enter flux (e.g. 0.01)"
                            style={{
                              width: 90,
                              padding: 6,
                              borderRadius: 6,
                              border: "1.5px solid #78cce2",
                              background: "#232b3b",
                              color: "#e4eff0",
                              fontSize: 15,
                            }}
                          />
                          {inputs[3] && (
                            <span style={{ marginLeft: 8 }}>S⊕</span>
                          )}
                        </div>
                      )}
                      {/* Default: show description if not replaced above */}
                      {i !== 1 && i !== 3 && (
                        <div
                          style={{
                            color: "#e4eff0",
                            fontSize: 13,
                            marginBottom: 4,
                          }}
                        >
                          {step.description}
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

                      {/* 1st card: show image from classification if available (planet mode) */}
                      {i === 0 && firstImage && (
                        <div style={{ margin: "8px 0" }}>
                          <img
                            src={firstImage}
                            alt="Deployment"
                            style={{
                              maxWidth: 180,
                              borderRadius: 8,
                              border: "1.5px solid #78cce2",
                            }}
                          />
                        </div>
                      )}

                      {/* 2nd card: show stellar values */}
                      {i === 1 && stellar && (
                        <div style={{ color: "#e4eff0", fontSize: 15, margin: "8px 0" }}>
                          <div>Stellar Temp: <b>{stellar.temp} K</b></div>
                          <div>Stellar Radius: <b>{stellar.radius} R☉</b></div>
                          <div>Stellar Mass: <b>{stellar.mass} M☉</b></div>
                        </div>
                      )}

                      {/* 3rd card: input for orbital period */}
                      {i === 2 && elapsed >= 20 * 60 * 1000 && (
                        <div style={{ marginTop: 8 }}>
                          <input
                            type="number"
                            value={inputs[2] || ""}
                            onChange={e => handleInputChange(2, e.target.value)}
                            placeholder="Enter orbital period (days)"
                            style={{
                              width: "90%",
                              padding: 8,
                              borderRadius: 6,
                              border: "1.5px solid #78cce2",
                              background: "#232b3b",
                              color: "#e4eff0",
                              fontSize: 15,
                            }}
                          />
                        </div>
                      )}

                      {/* 4th card: input for flux value */}
                      {i === 3 && (
                        <div style={{ color: "#e4eff0", fontSize: 15, margin: "8px 0" }}>
                          <label htmlFor="flux-input-desktop" style={{ marginRight: 8 }}>
                            Planetary Flux (Transit Depth):
                          </label>
                          <input
                            id="flux-input-desktop"
                            type="number"
                            step="any"
                            value={inputs[3] || ""}
                            onChange={e => handleInputChange(3, e.target.value)}
                            placeholder="Enter flux (e.g. 0.01)"
                            style={{
                              width: 90,
                              padding: 6,
                              borderRadius: 6,
                              border: "1.5px solid #78cce2",
                              background: "#232b3b",
                              color: "#e4eff0",
                              fontSize: 15,
                            }}
                          />
                          {inputs[3] && <span style={{ marginLeft: 8 }}>S⊕</span>}
                        </div>
                      )}

                      {/* 5th card: calculate and show planet stats */}
                      {i === 4 && (
                        <div
                          style={{
                            marginTop: 10,
                            minHeight: 32,
                            color: "#e4eff0",
                            fontSize: 15,
                            fontStyle: "italic",
                            opacity: 0.9,
                          }}
                        >
                          {planetStats ? (
                            <>
                              <div>Mass: <b>{planetStats.mass.toFixed(2)} M⊕</b></div>
                              <div>Radius: <b>{planetStats.radius.toFixed(2)} R⊕</b></div>
                              <div>Density: <b>{planetStats.density.toFixed(2)} g/cm³</b></div>
                              <div>Temperature: <b>{planetStats.temp.toFixed(0)} K</b></div>
                              <button
                                style={{
                                  marginTop: 16,
                                  padding: "8px 22px",
                                  borderRadius: 6,
                                  border: "1.5px solid #78cce2",
                                  background: creatingClassification ? "#78cce2" : "#232b3b",
                                  color: creatingClassification ? "#232b3b" : "#e4eff0",
                                  fontSize: 16,
                                  fontWeight: 600,
                                  cursor: creatingClassification ? "not-allowed" : "pointer",
                                  opacity: creatingClassification ? 0.7 : 1,
                                }}
                                disabled={creatingClassification}
                                onClick={handleCalculate}
                              >
                                {creatingClassification
                                  ? "Saving..."
                                  : "Save Classification & Reset Weather Satellite"}
                              </button>
                            </>
                          ) : (
                            <button
                              style={{
                                marginTop: 8,
                                padding: "6px 18px",
                                borderRadius: 6,
                                border: "1.5px solid #78cce2",
                                background: "#232b3b",
                                color: "#e4eff0",
                                fontSize: 15,
                                cursor: "pointer",
                              }}
                              onClick={handleCalculate}
                            >
                              Calculate Planet Stats
                            </button>
                          )}
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
}
