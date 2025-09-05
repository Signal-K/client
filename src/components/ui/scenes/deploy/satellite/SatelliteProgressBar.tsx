import React from "react";

interface SatelliteProgressBarProps {
  deployTime: Date | string;
  now?: Date;
  height?: number | string;
  width?: number | string;
  investigationType?: 'planet' | 'weather';
  classification?: {
    id?: number | string;
    media?: any;
  };
  classificationId?: number | string;

  style?: React.CSSProperties;
  parentWidth?: number;
};

export default function SatelliteProgressBar(props: SatelliteProgressBarProps) {
  // Hide cards if on root URL
  const [hideCards, setHideCards] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setHideCards(window.location.pathname === '/');
    }
  }, []);
  // Use much smaller defaults for compact display in small sections
  const {
    deployTime,
    now,
    height = props.height ?? 16, // default: 16px tall
    width = props.width ?? 180,  // default: 180px wide
    investigationType = 'planet',
    classification,
    parentWidth,
  } = props;

  // Responsive: vertical layout for mobile
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 700);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  // Parse times
  const deploy = typeof deployTime === "string" ? new Date(deployTime) : deployTime;
  const current = now || new Date();

  // Timeline steps for planet investigation
  // Find first image in media array (anywhere)
  let firstImage: string | undefined = undefined;
  if (classification && Array.isArray(classification.media)) {
    for (const arr of classification.media) {
      if (Array.isArray(arr)) {
        for (const url of arr) {
          if (typeof url === 'string' && url.startsWith('http')) {
            firstImage = url;
            break;
          }
        }
      }
      if (firstImage) break;
    }
  }

  const steps = investigationType === 'planet' ? [
    {
      label: 'Satellite deployed',
      description: 'Satellite launched and in transit.',
      time: 0,
      card: firstImage
        ? {
            image: firstImage,
            title: 'Deployment Image',
          }
        : undefined,
    },
    { label: 'Star size', description: 'Finding star’s size (solar radii)', time: 10 * 60 * 1000 },
    { label: 'Star temperature', description: 'Finding star’s temperature (Kelvin)', time: 20 * 60 * 1000 },
    { label: 'Orbital period', description: 'User inputs orbital period', time: 30 * 60 * 1000 },
    { label: 'Planet stats', description: 'Planet stats revealed, ready to publish', time: 40 * 60 * 1000 },
  ] : [
    // Weather investigation steps (future)
    { label: 'Satellite deployed', description: 'Satellite launched and in transit.', time: 0 },
  ];

  const totalDuration = steps.length > 1 ? steps[steps.length - 1].time : 1;
  // Find current step and progress within step
  const elapsed = Math.max(0, current.getTime() - deploy.getTime());
  let currentStepIdx = 0;
  for (let i = 0; i < steps.length; i++) {
    if (elapsed >= steps[i].time) currentStepIdx = i;
  }
  const nextStepTime = steps[Math.min(currentStepIdx + 1, steps.length - 1)].time;
  const prevStepTime = steps[currentStepIdx].time;
  const stepProgress = nextStepTime > prevStepTime ? (elapsed - prevStepTime) / (nextStepTime - prevStepTime) : 1;

  // Convert height/width to numbers for calculations (default fallback)
  const pxHeight = typeof height === 'number' ? height : 16;
  const pxWidth = typeof width === 'number' ? width : 180;
  // Satellite icon size
  const satSize = pxHeight * 1.2;
  // For vertical layout, swap width/height logic
  const isVertical = isMobile;
  const stepCount = steps.length;
  const barStart = satSize / 2;
  const barEnd = isVertical ? pxHeight - satSize / 2 + (stepCount - 1) * 120 : pxWidth - satSize / 2;
  const segmentLength = (barEnd - barStart) / (stepCount - 1);
  const satPos = barStart + segmentLength * (currentStepIdx + stepProgress);

  const [inputs, setInputs] = React.useState<{[key: number]: string}>({});

  const isStepActive = (stepIdx: number) => {
    if (investigationType !== 'planet') return false;
    if (stepIdx === 1) return elapsed >= 10 * 60 * 1000;
    if (stepIdx === 2) return elapsed >= 20 * 60 * 1000;
    if (stepIdx === 3) return elapsed >= 30 * 60 * 1000;
    return false;
  };

  const handleInputChange = (idx: number, value: string) => {
    setInputs(prev => ({ ...prev, [idx]: value }));
  };

  return (
    <div
      style={{
        width: isVertical ? '100%' : width,
        minHeight: isVertical ? '320px' : pxHeight + 320,
        height: isVertical ? '100%' : undefined,
        position: isVertical ? 'relative' : 'relative',
        display: isVertical ? 'flex' : undefined,
        flexDirection: isVertical ? 'row' : undefined,
        alignItems: isVertical ? 'center' : undefined,
        justifyContent: isVertical ? 'center' : undefined,
        overflow: isVertical ? 'visible' : undefined,
        ...props.style
      }}
    >
      {isVertical ? (
        <>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', position: 'static', zIndex: 5 }}>
            {steps.map((step, i) => i % 2 === 0 && (
              <div key={i} style={{ minWidth: 140, maxWidth: 220, marginBottom: 32, textAlign: "right", position: "relative", right: 0 }}>
                <div style={{
                  background: '#181e2a',
                  border: '1.5px solid #78cce2',
                  borderRadius: 10,
                  boxShadow: '0 2px 8px #0006',
                  padding: 12,
                  minHeight: 48,
                  maxWidth: 220,
                  marginBottom: 8,
                  marginRight: 12,
                }}>
                  <div style={{ color: i <= currentStepIdx ? '#78cce2' : '#e4eff0', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{step.label}</div>
                  {i === currentStepIdx && (
                    <div style={{ color: '#e4eff0', fontSize: 13, marginBottom: 4 }}>{step.description}</div>
                  )}
                  {investigationType === 'planet' && i >= 1 && i <= 3 && isStepActive(i) && (
                    <input
                      type="text"
                      value={inputs[i] || ''}
                      onChange={e => handleInputChange(i, e.target.value)}
                      placeholder={`Enter value for ${step.label}`}
                      style={{
                        marginTop: 8,
                        width: '90%',
                        padding: 6,
                        borderRadius: 6,
                        border: '1.5px solid #78cce2',
                        background: '#232b3b',
                        color: '#e4eff0',
                        fontSize: 14,
                      }}
                    />
                  )}
                  {investigationType === 'planet' && i === 4 && (
                    <div style={{
                      marginTop: 10,
                      minHeight: 32,
                      color: '#e4eff0',
                      fontSize: 14,
                      fontStyle: 'italic',
                      opacity: 0.7,
                    }}>
                    </div>
                  )}
                </div>
                <div style={{
                  position: 'absolute',
                  right: -12,
                  top: 32,
                  width: 24,
                  height: 0,
                  borderTop: '2px solid #78cce2',
                  zIndex: 2,
                }} />
              </div>
            ))}
          </div>
          <div
            style={{
              position: 'relative',
              width: pxHeight + 16,
              minWidth: pxHeight + 16,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: pxHeight / 2 - satSize / 2 + 8,
                top: satPos - satSize / 2,
                width: satSize,
                height: satSize,
                zIndex: 11,
                transition: 'top 0.5s cubic-bezier(.4,1.6,.4,1)',
                pointerEvents: 'none',
              }}
            >
              <svg width={satSize} height={satSize} viewBox="0 0 40 40" fill="none">
                {/* Body */}
                <rect x="16" y="14" width="8" height="12" rx="3" fill="#78cce2" stroke="#e4eff0" strokeWidth="1.2" />
                {/* Solar panels */}
                <rect x="6" y="17" width="8" height="6" rx="2" fill="#232b3b" stroke="#78cce2" strokeWidth="1.1" />
                <rect x="26" y="17" width="8" height="6" rx="2" fill="#232b3b" stroke="#78cce2" strokeWidth="1.1" />
                {/* Antenna */}
                <rect x="19" y="8" width="2" height="8" rx="1" fill="#e4eff0" />
                <circle cx="20" cy="7" r="2" fill="#f2c572" stroke="#e4eff0" strokeWidth="0.8" />
                {/* Details */}
                <circle cx="20" cy="26" r="2.2" fill="#232b3b" stroke="#e4eff0" strokeWidth="0.7" />
              </svg>
            </div>
            <svg
              width={pxHeight}
              height={barEnd}
              style={{ position: "relative", left: 8, top: 0, zIndex: 1, margin: '0 auto', display: 'block' }}
            >
              <rect x={pxHeight / 2 - 4} y={barStart} width={8} height={barEnd - barStart} rx={4} fill="#232b3b" />
              <rect x={pxHeight / 2 - 4} y={barStart} width={8} height={satPos - barStart} rx={4} fill="#78cce2" />
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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'static', zIndex: 5 }}>
            {steps.map((step, i) => i % 2 === 1 && (
              <div key={i} style={{ minWidth: 140, maxWidth: 220, marginBottom: 32, textAlign: "left", position: "relative", left: 0 }}>
                <div style={{
                  position: 'absolute',
                  left: -12,
                  top: 32,
                  width: 24,
                  height: 0,
                  borderTop: '2px solid #78cce2',
                  zIndex: 2,
                }} />
                <div style={{
                  background: '#181e2a',
                  border: '1.5px solid #78cce2',
                  borderRadius: 10,
                  boxShadow: '0 2px 8px #0006',
                  padding: 12,
                  minHeight: 48,
                  maxWidth: 220,
                  marginBottom: 8,
                  marginLeft: 12,
                }}>
                  <div style={{ color: i <= currentStepIdx ? '#78cce2' : '#e4eff0', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{step.label}</div>
                  {i === currentStepIdx && (
                    <div style={{ color: '#e4eff0', fontSize: 13, marginBottom: 4 }}>{step.description}</div>
                  )}
                  {investigationType === 'planet' && i >= 1 && i <= 3 && isStepActive(i) && (
                    <input
                      type="text"
                      value={inputs[i] || ''}
                      onChange={e => handleInputChange(i, e.target.value)}
                      placeholder={`Enter value for ${step.label}`}
                      style={{
                        marginTop: 8,
                        width: '90%',
                        padding: 6,
                        borderRadius: 6,
                        border: '1.5px solid #78cce2',
                        background: '#232b3b',
                        color: '#e4eff0',
                        fontSize: 14,
                      }}
                    />
                  )}
                  {investigationType === 'planet' && i === 4 && (
                    <div style={{
                      marginTop: 10,
                      minHeight: 32,
                      color: '#e4eff0',
                      fontSize: 14,
                      fontStyle: 'italic',
                      opacity: 0.7,
                    }}>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{
          width: '100%',
          height: '100%',
          minHeight: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{ position: 'relative', width: pxWidth, minHeight: pxHeight + 220, margin: '0 auto' }}>
            {/* Progress bar */}
            <svg width={pxWidth} height={pxHeight} style={{ position: "relative", left: 0, top: 0, zIndex: 1, display: 'block' }}>
              <rect x={barStart} y={pxHeight / 2 - 4} width={barEnd - barStart} height={8} rx={4} fill="#232b3b" />
              <rect x={barStart} y={pxHeight / 2 - 4} width={satPos - barStart} height={8} rx={4} fill="#78cce2" />
              {steps.map((step, i) => (
                <circle
                  key={i}
                  cx={barStart + i * segmentLength}
                  cy={pxHeight / 2}
                  r={10}
                  fill={i <= currentStepIdx ? "#78cce2" : "#232b3b"}
                  stroke="#e4eff0"
                  strokeWidth={i === currentStepIdx ? 2.5 : 1.2}
                />
              ))}
            </svg>
            {/* SVG connectors for all cards */}
            {!hideCards && (
              <svg
                width={pxWidth}
                height={100}
                style={{ position: 'absolute', left: 0, top: pxHeight + 10, pointerEvents: 'none', zIndex: 2 }}
              >
                {steps.map((step, i) => {
                  const yOffset = (i % 2 === 0) ? 0 : 48;
                  const markerX = barStart + i * segmentLength;
                  const barY = 0;
                  const cardY = yOffset + 60;
                  const cardX = markerX;
                  return (
                    <line
                      key={i}
                      x1={markerX}
                      y1={barY}
                      x2={cardX}
                      y2={cardY}
                      stroke="#78cce2"
                      strokeWidth={2}
                    />
                  );
                })}
              </svg>
            )}
            {/* Cards absolutely positioned below the bar, spaced out */}
            {!hideCards && steps.map((step, i) => {
              const yOffset = (i % 2 === 0) ? 0 : 48;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `calc(${barStart + i * segmentLength}px - 130px)`,
                    top: pxHeight + 100 + yOffset,
                    width: 260,
                    textAlign: "center",
                    zIndex: 3,
                  }}
                >
                  <div style={{
                    background: '#181e2a',
                    border: '1.5px solid #78cce2',
                    borderRadius: 10,
                    boxShadow: '0 2px 8px #0006',
                    padding: 16,
                    margin: '0 auto',
                    minHeight: 48,
                    maxWidth: 260,
                    marginBottom: 8,
                  }}>
                    <div style={{ color: i <= currentStepIdx ? '#78cce2' : '#e4eff0', fontWeight: 600, fontSize: 17, marginBottom: 6 }}>{step.label}</div>
                    {i === currentStepIdx && (
                      <div style={{ color: '#e4eff0', fontSize: 15, marginBottom: 6 }}>{step.description}</div>
                    )}
                    {/* Input fields for steps 2-4 if enough time has passed */}
                    {investigationType === 'planet' && i >= 1 && i <= 3 && isStepActive(i) && (
                      <input
                        type="text"
                        value={inputs[i] || ''}
                        onChange={e => handleInputChange(i, e.target.value)}
                        placeholder={`Enter value for ${step.label}`}
                        style={{
                          marginTop: 8,
                          width: '90%',
                          padding: 8,
                          borderRadius: 6,
                          border: '1.5px solid #78cce2',
                          background: '#232b3b',
                          color: '#e4eff0',
                          fontSize: 15,
                        }}
                      />
                    )}
                    {/* Step 5: calculated output (empty for now) */}
                    {investigationType === 'planet' && i === 4 && (
                      <div style={{
                        marginTop: 10,
                        minHeight: 32,
                        color: '#e4eff0',
                        fontSize: 15,
                        fontStyle: 'italic',
                        opacity: 0.7,
                      }}>
                        {/* Calculated output will go here */}
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
