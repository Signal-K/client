import React from "react";

const SatelliteIcon = ({ deployed, hasDiscoveries }: { deployed: boolean; hasDiscoveries: boolean }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Satellite Main Body */}
    <rect
      x="10" y="10" width="8" height="8" rx="2"
      fill={deployed ? (hasDiscoveries ? "#10b981" : "#3b82f6") : "#d1d5db"}
      stroke={deployed ? (hasDiscoveries ? "#059669" : "#2563eb") : "#9ca3af"}
      strokeWidth="2"
    />
    
    {/* Solar Panels */}
    <rect
      x="6" y="12" width="3" height="4" rx="0.5"
      fill={deployed ? "#1e40af" : "#9ca3af"}
      stroke={deployed ? "#1e3a8a" : "#6b7280"}
      strokeWidth="1"
    />
    <rect
      x="19" y="12" width="3" height="4" rx="0.5"
      fill={deployed ? "#1e40af" : "#9ca3af"}
      stroke={deployed ? "#1e3a8a" : "#6b7280"}
      strokeWidth="1"
    />
    
    {/* Solar Panel Grid Lines */}
    {deployed && (
      <>
        <line x1="6.5" y1="12" x2="6.5" y2="16" stroke="#60a5fa" strokeWidth="0.5"/>
        <line x1="7.5" y1="12" x2="7.5" y2="16" stroke="#60a5fa" strokeWidth="0.5"/>
        <line x1="8.5" y1="12" x2="8.5" y2="16" stroke="#60a5fa" strokeWidth="0.5"/>
        <line x1="19.5" y1="12" x2="19.5" y2="16" stroke="#60a5fa" strokeWidth="0.5"/>
        <line x1="20.5" y1="12" x2="20.5" y2="16" stroke="#60a5fa" strokeWidth="0.5"/>
        <line x1="21.5" y1="12" x2="21.5" y2="16" stroke="#60a5fa" strokeWidth="0.5"/>
      </>
    )}
    
    {/* Communication Dish */}
    <ellipse
      cx="14" cy="12" rx="2" ry="1"
      fill={deployed ? "#fbbf24" : "#e5e7eb"}
      stroke={deployed ? "#f59e0b" : "#9ca3af"}
      strokeWidth="1"
    />
    
    {/* Antenna */}
    <line
      x1="14" y1="10" x2="14" y2="7"
      stroke={deployed ? "#ef4444" : "#9ca3af"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle
      cx="14" cy="7" r="1"
      fill={deployed ? "#ef4444" : "#d1d5db"}
    />
    
    {/* Thruster Flames */}
    {deployed && (
      <>
        <path
          d="M12 18L11 21L13 21Z"
          fill="#f97316"
          opacity="0.8"
        />
        <path
          d="M16 18L15 21L17 21Z"
          fill="#f97316"
          opacity="0.8"
        />
      </>
    )}
    
    {/* Signal Waves */}
    {deployed && (
      <>
        <path
          d="M16 12C18 10 20 10 22 12"
          stroke="#06d6a0"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M17 12C18.5 11 19.5 11 21 12"
          stroke="#06d6a0"
          strokeWidth="1"
          fill="none"
          opacity="0.8"
        />
      </>
    )}
    
    {/* Earth in Background */}
    <circle
      cx="24" cy="24" r="3"
      fill="#3b82f6"
      opacity="0.3"
    />
    <path
      d="M22 24C22 23 23 22 24 22C25 22 26 23 26 24"
      stroke="#10b981"
      strokeWidth="1"
      fill="none"
      opacity="0.5"
    />
    
    {/* Discovery Notification */}
    {hasDiscoveries && (
      <circle cx="22" cy="6" r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="2">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite"/>
      </circle>
    )}
  </svg>
);

export default SatelliteIcon;