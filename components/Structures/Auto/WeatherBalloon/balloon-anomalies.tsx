"use client"

import type { WeatherAnomaly } from "@/types/Structures/WeatherBalloon";

interface WeatherAnomalyComponentProps {
  anomaly: WeatherAnomaly
  onClick: (anomaly: WeatherAnomaly) => void
  isHighlighted?: boolean
};

export function WeatherAnomalyComponent({ anomaly, onClick, isHighlighted = false }: WeatherAnomalyComponentProps) {
  const baseClasses = "absolute cursor-pointer transition-all duration-300 hover:scale-110 hover:brightness-110";
  const size = anomaly.size || 1;
  const baseSize = anomaly.type === "storm" ? 24 : anomaly.type === "cloud_formation" ? 20 : 16;

  // Create weather-specific visual styles
  const getWeatherStyles = () => {
    const commonStyles = {
      left: `${anomaly.x}%`,
      top: `${anomaly.y}%`,
      width: `${baseSize * size}px`,
      height: `${baseSize * size}px`,
      zIndex: isHighlighted ? 50 : 10,
      filter: `brightness(${1 + anomaly.intensity * 0.3}) saturate(1.2)`,
      animation: isHighlighted
        ? `weatherPulse 1s ease-in-out infinite alternate`
        : `weatherDrift ${anomaly.animationSpeed}s ease-in-out infinite alternate`,
    };

    switch (anomaly.type) {
      case "storm":
        return {
          ...commonStyles,
          background: `
            radial-gradient(ellipse 60% 40% at 30% 30%, ${anomaly.color}40 0%, transparent 50%),
            radial-gradient(ellipse 40% 60% at 70% 60%, ${anomaly.color}60 0%, transparent 50%),
            radial-gradient(ellipse 80% 30% at 50% 80%, ${anomaly.color}30 0%, transparent 50%),
            conic-gradient(from 45deg, ${anomaly.color}80, ${anomaly.color}40, ${anomaly.color}80)
          `,
          borderRadius: "50% 40% 60% 30%",
          boxShadow: isHighlighted
            ? `0 0 ${20 * size}px ${anomaly.color}88, inset 0 0 ${10 * size}px ${anomaly.color}40`
            : `0 0 ${12 * size}px ${anomaly.color}60, inset 0 0 ${6 * size}px ${anomaly.color}20`,
          transform: `rotate(${Math.sin(Date.now() * 0.001) * 10}deg)`,
        }

      case "cloud_formation":
        return {
          ...commonStyles,
          background: `
            radial-gradient(ellipse 40% 30% at 20% 40%, ${anomaly.color}70 0%, transparent 60%),
            radial-gradient(ellipse 35% 25% at 50% 30%, ${anomaly.color}60 0%, transparent 60%),
            radial-gradient(ellipse 30% 35% at 80% 45%, ${anomaly.color}65 0%, transparent 60%),
            radial-gradient(ellipse 25% 20% at 35% 70%, ${anomaly.color}50 0%, transparent 60%),
            radial-gradient(ellipse 20% 25% at 70% 75%, ${anomaly.color}55 0%, transparent 60%)
          `,
          borderRadius: "60% 40% 50% 70%",
          boxShadow: isHighlighted
            ? `0 0 ${15 * size}px ${anomaly.color}66, inset 0 0 ${8 * size}px rgba(255,255,255,0.2)`
            : `0 0 ${8 * size}px ${anomaly.color}44, inset 0 0 ${4 * size}px rgba(255,255,255,0.1)`,
          opacity: 0.8 + anomaly.opacity * 0.2,
        }

      case "atmospheric_phenomenon":
        return {
          ...commonStyles,
          background: `
            linear-gradient(45deg, ${anomaly.color}60 0%, transparent 30%),
            linear-gradient(-45deg, ${anomaly.color}40 20%, transparent 60%),
            linear-gradient(90deg, ${anomaly.color}50 0%, transparent 50%),
            radial-gradient(ellipse at center, ${anomaly.color}30 0%, transparent 70%)
          `,
          borderRadius: "20% 80% 30% 70%",
          boxShadow: isHighlighted
            ? `0 0 ${18 * size}px ${anomaly.color}77, 0 0 ${25 * size}px ${anomaly.color}33`
            : `0 0 ${10 * size}px ${anomaly.color}55, 0 0 ${15 * size}px ${anomaly.color}22`,
          transform: `skew(${Math.sin(Date.now() * 0.002) * 5}deg, ${Math.cos(Date.now() * 0.002) * 3}deg)`,
        }

      case "surface_weather":
        return {
          ...commonStyles,
          background: `
            radial-gradient(ellipse 50% 20% at 50% 20%, ${anomaly.color}80 0%, transparent 70%),
            radial-gradient(ellipse 30% 40% at 30% 60%, ${anomaly.color}60 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 70% 70%, ${anomaly.color}70 0%, transparent 70%),
            linear-gradient(180deg, ${anomaly.color}20 0%, transparent 100%)
          `,
          borderRadius: "50% 50% 80% 20%",
          boxShadow: isHighlighted
            ? `0 0 ${12 * size}px ${anomaly.color}88, inset 0 0 ${6 * size}px rgba(255,255,255,0.3)`
            : `0 0 ${8 * size}px ${anomaly.color}66, inset 0 0 ${4 * size}px rgba(255,255,255,0.15)`,
          opacity: 0.7 + anomaly.opacity * 0.3,
        }

      case "geological_weather":
        return {
          ...commonStyles,
          background: `
            radial-gradient(ellipse 70% 30% at 40% 70%, ${anomaly.color}70 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 60% 30%, ${anomaly.color}50 0%, transparent 70%),
            radial-gradient(ellipse 30% 60% at 20% 40%, ${anomaly.color}60 0%, transparent 60%),
            linear-gradient(45deg, ${anomaly.color}30 0%, transparent 80%)
          `,
          borderRadius: "30% 70% 40% 60%",
          boxShadow: isHighlighted
            ? `0 0 ${16 * size}px ${anomaly.color}77, inset 0 0 ${8 * size}px rgba(139, 69, 19, 0.3)`
            : `0 0 ${10 * size}px ${anomaly.color}55, inset 0 0 ${5 * size}px rgba(139, 69, 19, 0.2)`,
          transform: `rotate(${Math.sin(Date.now() * 0.0015) * 15}deg)`,
        }

      default:
        return {
          ...commonStyles,
          background: `radial-gradient(ellipse, ${anomaly.color}60 0%, transparent 70%)`,
          borderRadius: "50%",
          boxShadow: `0 0 ${10 * size}px ${anomaly.color}44`,
        }
    }
  }

  // Add particle effects for certain weather types
  const renderParticles = () => {
    if (anomaly.type === "storm" || anomaly.type === "geological_weather") {
      return (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-60"
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`,
                animation: `particle ${1 + i * 0.5}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      )
    }
    return null
  }

  // Add wispy trails for atmospheric phenomena
  const renderTrails = () => {
    if (anomaly.type === "atmospheric_phenomenon") {
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute w-full h-0.5 opacity-40"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${anomaly.color}80 50%, transparent 100%)`,
              top: "30%",
              animation: `trail ${anomaly.animationSpeed * 1.5}s ease-in-out infinite`,
            }}
          />
          <div
            className="absolute w-full h-0.5 opacity-30"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${anomaly.color}60 50%, transparent 100%)`,
              top: "70%",
              animation: `trail ${anomaly.animationSpeed * 1.2}s ease-in-out infinite reverse`,
            }}
          />
        </div>
      )
    }
    return null
  }

  return (
    <div
      className={`${baseClasses} ${anomaly.classified ? "ring-1 ring-[#607D8B]" : ""} ${isHighlighted ? "ring-2 ring-white" : ""}`}
      style={getWeatherStyles()}
      onClick={() => onClick(anomaly)}
    >
      {/* Particle effects */}
      {renderParticles()}

      {/* Trail effects */}
      {renderTrails()}

      {/* Classification indicator */}
      {anomaly.classified && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#607D8B] rounded-full border border-white" />
      )}

      {/* Highlight glow */}
      {isHighlighted && (
        <div
          className="absolute inset-0 rounded-full opacity-30 animate-ping"
          style={{
            background: `radial-gradient(circle, ${anomaly.color}60 0%, transparent 70%)`,
            borderRadius: "inherit",
          }}
        />
      )}

      {/* CSS for weather-specific animations */}
      <style jsx>{`
        @keyframes weatherDrift {
          0% { transform: translateX(0px) translateY(0px) rotate(0deg); opacity: 0.7; }
          50% { transform: translateX(2px) translateY(-1px) rotate(1deg); opacity: 0.9; }
          100% { transform: translateX(-1px) translateY(1px) rotate(-1deg); opacity: 0.8; }
        }
        @keyframes weatherPulse {
          0% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          100% { transform: scale(1.1) rotate(2deg); opacity: 1; }
        }
        @keyframes particle {
          0% { transform: translateY(0px) scale(0.8); opacity: 0.4; }
          100% { transform: translateY(-3px) scale(1.2); opacity: 0.8; }
        }
        @keyframes trail {
          0% { transform: translateX(-20px) scaleX(0.5); opacity: 0.2; }
          50% { transform: translateX(0px) scaleX(1); opacity: 0.6; }
          100% { transform: translateX(20px) scaleX(0.5); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};