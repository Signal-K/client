import React from "react";

const TelescopeIcon = ({ deployed, hasDiscoveries }: { deployed: boolean; hasDiscoveries: boolean }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Telescope Base */}
    <rect
      x="11" y="22" width="6" height="4" rx="1"
      fill={deployed ? "#4f46e5" : "#9ca3af"}
      stroke={deployed ? "#3730a3" : "#6b7280"}
      strokeWidth="1"
    />
    
    {/* Telescope Main Body */}
    <ellipse
      cx="14" cy="14" rx="8" ry="3"
      fill={deployed ? (hasDiscoveries ? "#10b981" : "#3b82f6") : "#d1d5db"}
      stroke={deployed ? (hasDiscoveries ? "#059669" : "#2563eb") : "#9ca3af"}
      strokeWidth="2"
      transform="rotate(-30 14 14)"
    />
    
    {/* Telescope Lens */}
    <circle
      cx="8" cy="10" r="2.5"
      fill={deployed ? "#fbbf24" : "#e5e7eb"}
      stroke={deployed ? "#f59e0b" : "#9ca3af"}
      strokeWidth="1.5"
    />
    
    {/* Telescope Eyepiece */}
    <circle
      cx="20" cy="18" r="1.5"
      fill={deployed ? "#8b5cf6" : "#d1d5db"}
      stroke={deployed ? "#7c3aed" : "#9ca3af"}
      strokeWidth="1"
    />
    
    {/* Support Legs */}
    <path
      d="M11 22L8 26M17 22L20 26"
      stroke={deployed ? "#4f46e5" : "#9ca3af"}
      strokeWidth="2"
      strokeLinecap="round"
    />
    
    {/* Stars/Discovery Indicators */}
    {deployed && (
      <>
        <circle cx="4" cy="6" r="1" fill="#fbbf24" opacity="0.8" />
        <circle cx="22" cy="4" r="0.8" fill="#06d6a0" opacity="0.7" />
        <circle cx="24" cy="12" r="0.6" fill="#f72585" opacity="0.6" />
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

export default TelescopeIcon;