'use client'

import { motion } from "framer-motion"

interface AnimatedPointerProps {
  position?: "top" | "right" | "bottom" | "left"
  arrowDirection?: "up" | "right" | "down" | "left"
  offset?: number
  size?: number
}

export default function AnimatedPointer({
  position = "left",
  arrowDirection = "right",
  offset = 20,
  size = 120
}: AnimatedPointerProps = {}) {
  const rotations = {
    top: 0,
    right: 90,
    bottom: 180,
    left: 270
  }

  const arrowRotations = {
    up: 270,
    right: 0,
    down: 90,
    left: 180
  }

  const positions = {
    top: { top: -offset, left: '50%', transform: 'translateX(-50%)' },
    right: { top: '50%', right: -offset, transform: 'translateY(-50%)' },
    bottom: { bottom: -offset, left: '50%', transform: 'translateX(-50%)' },
    left: { top: '50%', left: -offset, transform: 'translateY(-50%)' }
  }

  return (
    <motion.div
      className="absolute"
      style={{
        ...positions[position],
        width: size,
        height: size
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: [0.9, 1, 0.9],
        x: position === "left" || position === "right" ? [0, 4, 0] : 0,
        y: position === "top" || position === "bottom" ? [0, 4, 0] : 0
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="url(#rainbow)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ 
          filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.7))',
          transform: `rotate(${rotations[position]}deg)`,
          width: '100%',
          height: '100%'
        }}
      >
        <defs>
          <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff0000">
              <animate attributeName="stop-color" values="#ff0000; #ff7f00; #ffff00; #00ff00; #0000ff; #8b00ff; #ff0000" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#ff7f00">
              <animate attributeName="stop-color" values="#ff7f00; #ffff00; #00ff00; #0000ff; #8b00ff; #ff0000; #ff7f00" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <path 
          d="M5 12h14M12 5l7 7-7 7" 
          style={{ transform: `rotate(${arrowRotations[arrowDirection]}deg)`, transformOrigin: 'center' }}
        />
      </svg>
    </motion.div>
  )
}