import React from 'react';
import '../../../styles/Icons/FishIcon.css';

interface FishIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const FishIcon: React.FC<FishIconProps> = ({ size = 32, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="fish-icon"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    {...props}
  >
    {/* Fish body */}
    <ellipse className="fish-body" cx="32" cy="32" rx="20" ry="10" />

    {/* Fish tail */}
    <polygon className="fish-tail" points="12,22 12,42 0,32" />

    {/* Fish fin */}
    <path className="fish-fin" d="M32,22 Q40,25 32,28" />

    {/* Fish eye */}
    <circle className="fish-eye" cx="40" cy="30" r="3" />
    <circle className="fish-pupil" cx="40" cy="30" r="1.5" />
  </svg>
);