'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export function PlanetarySystem() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const size = 100;

  const orbits = [
    { radius: size * 0.25, duration: 20 },  
    { radius: size * 0.35, duration: 40 },  
    { radius: size * 0.45, duration: 55 }   
  ]

  return (
    <div className="flex items-center justify-center bg-[#2C3A4A]/5">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Central Object */}
        <div className="absolute inset-0 m-auto rounded-full overflow-hidden" style={{ width: size * 0.2, height: size * 0.2 }}>
          <Image
            src="/assets/Items/Vector.png"
            alt="Central Object"
            layout="fill"
            objectFit="cover"
          />
        </div>
        
        {/* Orbits and Orbiting Objects */}
        {orbits.map((orbit, index) => (
          <div key={index} className="absolute inset-0 m-auto rounded-full border border-blue-300" 
               style={{ 
                 width: orbit.radius * 2, 
                 height: orbit.radius * 2
               }}>
            <div className="absolute inset-0 animate-spin" 
                 style={{ 
                   animationDuration: `${orbit.duration}s`,
                   animationTimingFunction: 'linear'
                 }}>
              <div className="absolute rounded-full overflow-hidden" 
                   style={{ 
                     width: size * 0.08, 
                     height: size * 0.08, 
                     top: '0%', 
                     left: '50%', 
                     transform: 'translate(-50%, -50%)'
                   }}>
                <Image
                  src={`/assets/Items/Telescope.png`}
                  alt={`Orbiting Object ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};