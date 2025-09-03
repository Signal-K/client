import React from "react";

interface Props {
  type: string;
  className?: string;
}

// SVGs for each classification type
const icons: Record<string, JSX.Element> = {
  sunspot: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-yellow-400"><circle cx="12" cy="12" r="6" fill="currentColor" /><g stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.2" y1="4.2" x2="7.2" y2="7.2" /><line x1="16.8" y1="16.8" x2="19.8" y2="19.8" /><line x1="4.2" y1="19.8" x2="7.2" y2="16.8" /><line x1="16.8" y1="7.2" x2="19.8" y2="4.2" /></g></svg>
  ),
  planet: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-blue-400"><circle cx="12" cy="12" r="8" fill="currentColor" /><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
  ),
  roverImg: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-gray-500"><rect x="6" y="14" width="12" height="4" rx="2" fill="currentColor" /><circle cx="8" cy="20" r="2" fill="currentColor" /><circle cx="16" cy="20" r="2" fill="currentColor" /><rect x="10" y="10" width="4" height="4" fill="currentColor" /></svg>
  ),
  "satellite-planetFour": (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-yellow-600"><ellipse cx="12" cy="12" rx="8" ry="4" fill="currentColor" /><path d="M2 12c2-2 6-4 10-4s8 2 10 4" stroke="currentColor" strokeWidth="2" /></svg>
  ),
  "telescope-minorPlanet": (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-gray-400"><circle cx="12" cy="12" r="6" fill="currentColor" /><circle cx="16" cy="8" r="2" fill="currentColor" /><circle cx="8" cy="16" r="1.5" fill="currentColor" /></svg>
  ),
  cloud: (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-cyan-400"><ellipse cx="12" cy="16" rx="8" ry="4" fill="currentColor" /><ellipse cx="16" cy="12" rx="4" ry="2" fill="currentColor" /><ellipse cx="8" cy="12" rx="4" ry="2" fill="currentColor" /></svg>
  ),
  "automaton-aiForMars": (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-red-400"><rect x="6" y="14" width="12" height="4" rx="2" fill="currentColor" /><circle cx="8" cy="20" r="2" fill="currentColor" /><circle cx="16" cy="20" r="2" fill="currentColor" /><rect x="10" y="10" width="4" height="4" fill="currentColor" /></svg>
  ),
  "lidar-jovianVortexHunter": (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-cyan-600"><ellipse cx="12" cy="16" rx="8" ry="4" fill="currentColor" /><ellipse cx="16" cy="12" rx="4" ry="2" fill="currentColor" /><ellipse cx="8" cy="12" rx="4" ry="2" fill="currentColor" /></svg>
  ),
};

export function ClassificationTypeIcon({ type, className }: Props) {
  return icons[type] ? React.cloneElement(icons[type], { className }) : null;
}
