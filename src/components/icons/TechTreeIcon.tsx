import React from "react";

const TechTreeIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Central Node */}
    <circle
      cx="12" cy="12" r="3"
      fill="currentColor"
      className="opacity-90"
    />
    
    {/* Branch Lines */}
    <path
      d="M12 9V4M12 20V15M9 12H4M20 12H15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className="opacity-70"
    />
    
    {/* Diagonal Lines */}
    <path
      d="M15.5 8.5L18.5 5.5M8.5 8.5L5.5 5.5M15.5 15.5L18.5 18.5M8.5 15.5L5.5 18.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="opacity-60"
    />
    
    {/* Outer Nodes */}
    <circle cx="12" cy="4" r="1.5" fill="currentColor" className="opacity-80"/>
    <circle cx="12" cy="20" r="1.5" fill="currentColor" className="opacity-80"/>
    <circle cx="4" cy="12" r="1.5" fill="currentColor" className="opacity-80"/>
    <circle cx="20" cy="12" r="1.5" fill="currentColor" className="opacity-80"/>
    
    {/* Corner Nodes */}
    <circle cx="18.5" cy="5.5" r="1" fill="currentColor" className="opacity-70"/>
    <circle cx="5.5" cy="5.5" r="1" fill="currentColor" className="opacity-70"/>
    <circle cx="18.5" cy="18.5" r="1" fill="currentColor" className="opacity-70"/>
    <circle cx="5.5" cy="18.5" r="1" fill="currentColor" className="opacity-70"/>
    
    {/* Sparkle Effects */}
    <path
      d="M7 3L7.5 4.5L9 4L7.5 3.5Z"
      fill="currentColor"
      className="opacity-60"
    />
    <path
      d="M17 21L17.5 22.5L19 22L17.5 21.5Z"
      fill="currentColor"
      className="opacity-60"
    />
    <path
      d="M3 17L3.5 18.5L5 18L3.5 17.5Z"
      fill="currentColor"
      className="opacity-60"
    />
  </svg>
);

export default TechTreeIcon;