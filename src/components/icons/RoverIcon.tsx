import React from "react";

const RoverIcon = ({ deployed, hasDiscoveries }: { deployed: boolean; hasDiscoveries: boolean }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Rover Main Body */}
    <rect
      x="8" y="12" width="12" height="6" rx="2"
      fill={deployed ? (hasDiscoveries ? "#10b981" : "#3b82f6") : "#d1d5db"}
      stroke={deployed ? (hasDiscoveries ? "#059669" : "#2563eb") : "#9ca3af"}
      strokeWidth="2"
    />
    
    {/* Solar Panel on Top */}
    <rect
      x="10" y="9" width="8" height="2" rx="0.5"
      fill={deployed ? "#1e40af" : "#9ca3af"}
      stroke={deployed ? "#1e3a8a" : "#6b7280"}
      strokeWidth="1"
    />
    
    {/* Solar Panel Grid Lines */}
    {deployed && (
      <>
        <line x1="11" y1="9" x2="11" y2="11" stroke="#60a5fa" strokeWidth="0.5"/>
        <line x1="13" y1="9" x2="13" y2="11" stroke="#60a5fa" strokeWidth="0.5"/>
        <line x1="15" y1="9" x2="15" y2="11" stroke="#60a5fa" strokeWidth="0.5"/>
        <line x1="17" y1="9" x2="17" y2="11" stroke="#60a5fa" strokeWidth="0.5"/>
      </>
    )}
    
    {/* Wheels */}
    <circle
      cx="10" cy="20" r="2.5"
      fill={deployed ? "#374151" : "#9ca3af"}
      stroke={deployed ? "#1f2937" : "#6b7280"}
      strokeWidth="1.5"
    />
    <circle
      cx="18" cy="20" r="2.5"
      fill={deployed ? "#374151" : "#9ca3af"}
      stroke={deployed ? "#1f2937" : "#6b7280"}
      strokeWidth="1.5"
    />
    
    {/* Wheel Spokes */}
    {deployed && (
      <>
        <line x1="8.5" y1="18.5" x2="11.5" y2="21.5" stroke="#6b7280" strokeWidth="1"/>
        <line x1="11.5" y1="18.5" x2="8.5" y2="21.5" stroke="#6b7280" strokeWidth="1"/>
        <line x1="16.5" y1="18.5" x2="19.5" y2="21.5" stroke="#6b7280" strokeWidth="1"/>
        <line x1="19.5" y1="18.5" x2="16.5" y2="21.5" stroke="#6b7280" strokeWidth="1"/>
      </>
    )}
    
    {/* Camera/Sensor Mast */}
    <rect
      x="13" y="6" width="2" height="6" rx="0.5"
      fill={deployed ? "#6b7280" : "#d1d5db"}
      stroke={deployed ? "#4b5563" : "#9ca3af"}
      strokeWidth="1"
    />
    
    {/* Camera/Sensor Head */}
    <circle
      cx="14" cy="6" r="1.5"
      fill={deployed ? "#fbbf24" : "#e5e7eb"}
      stroke={deployed ? "#f59e0b" : "#9ca3af"}
      strokeWidth="1"
    />
    
    {/* Robotic Arm */}
    <path
      d="M20 15L22 13L24 15L22 17Z"
      fill={deployed ? "#8b5cf6" : "#d1d5db"}
      stroke={deployed ? "#7c3aed" : "#9ca3af"}
      strokeWidth="1"
    />
    
    {/* Arm Joint */}
    <circle
      cx="22" cy="15" r="1"
      fill={deployed ? "#6366f1" : "#d1d5db"}
    />
    
    {/* Sample Container */}
    <rect
      x="12" y="14" width="4" height="2" rx="0.5"
      fill={deployed ? "#059669" : "#d1d5db"}
      stroke={deployed ? "#047857" : "#9ca3af"}
      strokeWidth="1"
    />
    
    {/* Dust Trail Effect (when deployed) */}
    {deployed && (
      <>
        <circle cx="6" cy="22" r="0.5" fill="#d97706" opacity="0.4">
          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite"/>
        </circle>
        <circle cx="4" cy="23" r="0.3" fill="#d97706" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="24" cy="22" r="0.4" fill="#d97706" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2.8s" repeatCount="indefinite"/>
        </circle>
      </>
    )}
    
    {/* Rock Samples (when has discoveries) */}
    {hasDiscoveries && (
      <>
        <circle cx="2" cy="24" r="1" fill="#92400e" opacity="0.8"/>
        <circle cx="26" cy="25" r="0.8" fill="#7c2d12" opacity="0.7"/>
        <circle cx="4" cy="26" r="0.6" fill="#a16207" opacity="0.6"/>
      </>
    )}
    
    {/* Discovery Notification */}
    {hasDiscoveries && (
      <circle cx="22" cy="6" r="4" fill="#ef4444" stroke="#ffffff" strokeWidth="2">
        <animate attributeName="r" values="3;4;3" dur="2s" repeatCount="indefinite"/>
      </circle>
    )}
  </svg>
);

export default RoverIcon;