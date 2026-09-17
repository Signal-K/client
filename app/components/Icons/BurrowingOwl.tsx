import React from 'react';
import '../../../styles/Icons/BurrowingOwl.css'; 

interface BurrowingOwlIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
};

export const BurrowingOwlIcon: React.FC<BurrowingOwlIconProps> = ({ size = 32, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="burrowing-owl-icon"
    width={size}
    height={size}
    viewBox="0 0 64 64"
    {...props}
  >
    {/* Outer circle (head) */}
    <circle className="owl-head" cx="32" cy="32" r="30" />
    
    {/* Owl's eyes */}
    <circle className="owl-eye" cx="22" cy="28" r="6" />
    <circle className="owl-eye" cx="42" cy="28" r="6" />
    <circle className="owl-pupil" cx="22" cy="28" r="3" />
    <circle className="owl-pupil" cx="42" cy="28" r="3" />

    {/* Owl's beak */}
    <polygon className="owl-beak" points="30,35 34,35 32,40" />

    {/* Owl's feather details */}
    <path className="owl-feathers" d="M16 40 Q 24 45, 32 40 Q 40 45, 48 40" />
    <path className="owl-feathers" d="M16 48 Q 24 50, 32 46 Q 40 50, 48 48" />

    {/* Owl ears */}
    <path className="owl-ear" d="M14 18 L22 12 Q28 20, 22 26 Z" />
    <path className="owl-ear" d="M50 18 L42 12 Q36 20, 42 26 Z" />
  </svg>
);