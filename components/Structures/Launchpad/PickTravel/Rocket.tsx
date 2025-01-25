import type React from "react"
import { motion } from "framer-motion"

interface RocketProps {
  isLaunched: boolean
  isRotated: boolean
  isFinished: boolean
}

const Rocket: React.FC<RocketProps> = ({ isLaunched, isRotated, isFinished }) => {
  const rocketVariants = {
    initial: { x: "10%", y: "50%", rotate: 0 },
    rotated: { rotate: 45, transition: { duration: 1 } },
    launched: {
      x: ["10%", "30%", "50%", "70%", "90%"],
      y: ["50%", "30%", "50%", "30%", "50%"],
      transition: {
        duration: 5,
        ease: "easeInOut",
        times: [0, 0.25, 0.5, 0.75, 1],
      },
    },
  }

  const getAnimationState = () => {
    if (!isLaunched) return "initial"
    if (isLaunched && !isRotated) return "rotated"
    return "launched"
  }

  return (
    <motion.div className="absolute" variants={rocketVariants} initial="initial" animate={getAnimationState()}>
      <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.g animate={{ rotate: isRotated ? 45 : 0 }} transition={{ duration: 1 }}>
          <path d="M25 2L10 48H40L25 2Z" fill="#D1D5DB" />
          <path d="M25 2L20 48H30L25 2Z" fill="#9CA3AF" />
          <rect x="22" y="35" width="6" height="15" fill="#EF4444" />
          {isLaunched && !isFinished && (
            <motion.g
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.5,
                repeat: Number.POSITIVE_INFINITY,
              }}
            >
              <circle cx="25" cy="50" r="3" fill="#FCD34D" />
              <circle cx="25" cy="50" r="5" fill="#FBBF24" fillOpacity="0.5" />
              <circle cx="25" cy="50" r="7" fill="#F59E0B" fillOpacity="0.2" />
            </motion.g>
          )}
        </motion.g>
      </svg>
    </motion.div>
  )
}

export default Rocket

