"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { DatabaseAnomaly } from '../TelescopeViewportRange';
import { PlanetGeneratorMinimal } from '@/src/components/discovery/data-sources/Astronomers/PlanetHunters/PlanetGenerator';

interface SatelliteSpiderScanProps {
  anomalies: (DatabaseAnomaly & { linked_anomaly_id: number; classification_id: number | string | null; date: string; })[];
}

// Use circular orbits (rx === ry) for smooth circular motion.
// Larger radii to orbit clear of the planet
const ORBIT_DEFINITIONS = [
  // increased radii to clear the planet completely
  { r: 140, speed: 1, initialAngle: 0 },
  { r: 160, speed: 0.8, initialAngle: Math.PI / 2 },
  { r: 180, speed: 0.6, initialAngle: Math.PI },
  { r: 200, speed: 0.4, initialAngle: (3 * Math.PI) / 2 },
];

const OrbitalPaths: React.FC<{ anomalies: SatelliteSpiderScanProps['anomalies'] }> = ({ anomalies }) => {
  const [pathPoints, setPathPoints] = useState<{x: number, y: number}[]>([]);
  const [satellitePosition, setSatellitePosition] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState("0 0 500 500");

  useEffect(() => {

    if (anomalies.length === 0) return;

    const deployDate = new Date(anomalies[0].date);
    let animationFrameId: number;

    // Keep path history bounded to avoid memory growth and jitter from high-frequency updates
    const MAX_PATH_POINTS = 600; // about 10s at 60fps
    let lastPushTime = 0;
    const PATH_SAMPLE_INTERVAL = 30; // ms, sample at ~33Hz

    // Use a single continuous circular orbit (no abrupt switching) to avoid jumps.
    const baseOrbit = ORBIT_DEFINITIONS[0];
    const orbitDuration = 20; // seconds for a full loop

    // Initialize satellite position immediately to avoid initial snap from 0,0
    const initAngle = baseOrbit.initialAngle + ((Date.now() - deployDate.getTime()) / 1000 / orbitDuration) * 2 * Math.PI * baseOrbit.speed;
    const initX = baseOrbit.r * Math.cos(initAngle);
    const initY = baseOrbit.r * Math.sin(initAngle);
    setSatellitePosition({ x: initX, y: initY });
    setPathPoints([{ x: initX, y: initY }]);

    const animate = () => {
      const currentTime = new Date();
      const totalElapsedTime = (currentTime.getTime() - deployDate.getTime()) / 1000;

      // Angle progresses smoothly over totalElapsedTime for a continuous orbit
      const angle = baseOrbit.initialAngle + (totalElapsedTime / orbitDuration) * 2 * Math.PI * baseOrbit.speed;

      // Circular orbit: use radius r for both x and y
      const satX = baseOrbit.r * Math.cos(angle);
      const satY = baseOrbit.r * Math.sin(angle);

      setSatellitePosition({ x: satX, y: satY });

      const nowMs = Date.now();
      if (nowMs - lastPushTime >= PATH_SAMPLE_INTERVAL) {
        lastPushTime = nowMs;
        setPathPoints(prevPoints => {
          const next = [...prevPoints, { x: satX, y: satY }];
          if (next.length > MAX_PATH_POINTS) {
            // drop oldest points to keep array size bounded
            return next.slice(next.length - MAX_PATH_POINTS);
          }
          return next;
        });
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        const maxOrbitRadius = Math.max(...ORBIT_DEFINITIONS.map(o => o.r)) * 1.2;
        const viewSize = maxOrbitRadius * 2;
        setViewBox(`-${viewSize / 2} -${viewSize / 2} ${viewSize} ${viewSize}`);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [anomalies]);

  const pathData = pathPoints.length > 0 
    ? `M ${pathPoints[0].x} ${pathPoints[0].y} ` + pathPoints.map(p => `L ${p.x} ${p.y}`).join(' ')
    : "";

  return (
    <svg
      ref={svgRef}
      className="absolute top-0 left-0 w-full h-full"
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g>
        {/* The continuous path of the satellite */}
        <path
          d={pathData}
          fill="none"
          stroke="rgba(0, 255, 255, 0.2)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* The current satellite position - rotated 180deg to flip image */}
        <image
          href="/assets/Viewports/Satellite/Satellite_Tile1.png"
          x={satellitePosition.x - 24}
          y={satellitePosition.y - 24}
          height="48"
          width="48"
          filter="url(#glow)"
          // rotate 180deg around the satellite center (satellitePosition is the center)
          transform={`rotate(180 ${satellitePosition.x} ${satellitePosition.y})`}
        />
      </g>
    </svg>
  );
};

const SatelliteSpiderScan: React.FC<SatelliteSpiderScanProps> = ({ anomalies }) => {
  const primaryClassificationId = anomalies[0]?.classification_id?.toString();
  // photos: array of timestamps when photos became available
  const [photos, setPhotos] = useState<number[]>([]);
  const [photosTaken, setPhotosTaken] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  useEffect(() => {
    if (anomalies.length === 0) return;

    const deployDate = new Date(anomalies[0].date);

    // Determine already-available photos based on deploy time
    const now = Date.now();
    const msSinceDeploy = now - deployDate.getTime();
    const available = Math.min(4, Math.floor(msSinceDeploy / (1000 * 60 * 60)));
    const initialPhotos: number[] = [];
    for (let i = 1; i <= available; i++) {
      initialPhotos.push(deployDate.getTime() + i * 1000 * 60 * 60);
    }
    if (initialPhotos.length > 0) {
      setPhotos(initialPhotos);
      setPhotosTaken(initialPhotos.length);
    }

    // Schedule timers for future photos up to 4 total
    const timers: number[] = [];
    for (let i = available + 1; i <= 4; i++) {
      const photoTime = deployDate.getTime() + i * 1000 * 60 * 60;
      const delay = Math.max(0, photoTime - Date.now());
      const t = window.setTimeout(() => {
        // add photo timestamp and flash
        setPhotos(prev => {
          const next = [...prev, photoTime];
          return next;
        });
        setPhotosTaken(prev => prev + 1);
        // Flash the screen briefly
        setIsFlashing(true);
        window.setTimeout(() => setIsFlashing(false), 250);
      }, delay);
      timers.push(t);
    }

    // Also update countdown every second so UI shows live time to next photo
    const countdownInterval = window.setInterval(() => {
      // noop - state updates from timers drive available photos; interval keeps component ticking for countdown
      // we could set a dummy state to force re-render, but using Date.now() directly in render is fine
    }, 1000);

    return () => {
      timers.forEach(t => clearTimeout(t));
      clearInterval(countdownInterval);
    };
  }, [anomalies]);

  // helper: time until next photo in ms, or null if exhausted or no anomalies
  const nextPhotoMs = (() => {
    if (!anomalies || anomalies.length === 0) return null;
    if (photosTaken >= 4) return null;
    const deployDate = new Date(anomalies[0].date).getTime();
    const nextIndex = photosTaken + 1; // 1-based
    const nextTime = deployDate + nextIndex * 1000 * 60 * 60;
    return Math.max(0, nextTime - Date.now());
  })();

  const formatMs = (ms: number) => {
    if (ms <= 0) return '0s';
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${sec}s`;
    return `${sec}s`;
  };

  const SUPABASE_URL = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined;
  const buildPhotoUrl = (anomalyId: number | string) => {
    if (!SUPABASE_URL) return `/assets/Viewports/Satellite/Satellite_Tile1.png`;
    return `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/telescope/satellite-planetFour/${anomalyId}.jpeg`;
  };

  return (
  <div className="flex flex-col md:flex-row w-full h-full text-white rounded-lg shadow-lg overflow-hidden min-h-0 box-border">
      {/* Main Content: Planet Viewer */}
  <div className="flex-1 p-4 md:p-8 flex items-center justify-center relative h-full overflow-hidden box-border"
       style={{ minHeight: isMobileExpanded ? '30vh' : '400px' }}>
        {primaryClassificationId ? (
          <div className="w-full h-full relative min-h-0 flex items-center justify-center">
            <div style={{ transform: 'translateY(100px)' }}>
              <PlanetGeneratorMinimal
                classificationId={primaryClassificationId}
                hideBackground={true}
                hideSky={true}
                cameraZoom={12}
              />
            </div>
            <OrbitalPaths anomalies={anomalies} />

            {/* Flash overlay when photo is taken */}
            {isFlashing && (
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(255,255,255,0.18)', mixBlendMode: 'screen', transition: 'opacity 200ms' }} />
            )}

            <div className="absolute bottom-4 right-4 bg-[#181e2a] p-3 rounded-lg border border-[#232b3b] shadow-lg">
              <h3 className="text-md font-semibold text-cyan-400">Photo Log</h3>
              <p className="text-sm text-gray-300 mt-1">Photos Taken: {photosTaken} / 4</p>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No classification data available to render planet.</div>
        )}
      </div>

      {/* Sidebar: Scan Results */}
      <div className={`w-full md:w-1/3 lg:w-1/4 bg-[#181e2a] border-t md:border-t-0 md:border-l border-[#232b3b] min-h-0 box-border relative transition-all duration-300 ${
        isMobileExpanded ? 'h-[70vh] md:h-full' : 'h-48 md:h-full'
      }`}>
        {/* Mobile expand/collapse button */}
        <button
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="md:hidden absolute top-2 right-2 z-10 bg-[#232b3b] hover:bg-[#2a3441] p-2 rounded-lg border border-[#3a4553] transition-colors"
          aria-label={isMobileExpanded ? "Collapse panel" : "Expand panel"}
        >
          {isMobileExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        
        {/* sidebar content scrolls within full height */}
        <div className="h-full overflow-y-auto p-4 md:p-6 pr-2">
        <h2 className="text-xl font-bold text-cyan-400 mb-4 border-b border-cyan-700 pb-2">Wind Survey Results</h2>
        <p className="mb-6 text-sm text-gray-300">The satellite's scan for sublimation and surface spider anomalies on Planet Four has identified the following objects of interest.</p>
        
  <div className="space-y-4 pb-6">
          {/* Photo thumbnails area */}
          <div className="bg-[#0f1419] p-3 rounded-lg border border-[#232b3b]">
            <h4 className="text-sm font-semibold text-cyan-300 mb-2">Satellite Photos</h4>
            <div className="flex flex-col space-y-3">
              {photos.map((ts, idx) => {
                // photos array stores timestamps; try to map to anomaly id if available in anomalies list
                const anomaly = anomalies[idx];
                const anomalyId = anomaly?.id ?? ts;
                const url = buildPhotoUrl(anomalyId);
                return (
                  <div key={ts} className="flex items-center space-x-3">
                    <button
                      className="w-16 h-12 bg-[#061018] rounded-sm border border-[#1f2a37] overflow-hidden flex-shrink-0"
                      title={`Photo ${idx + 1}`}
                      onClick={() => window.open(url, '_blank')}
                    >
                      <img src={url} alt={`photo-${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                    <a
                      href={`/structures/balloon/p4/an-${anomalyId}/classify`}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium rounded transition-colors"
                    >
                      Classify
                    </a>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 text-xs text-gray-300">
              {photosTaken >= 4 ? (
                <div className="text-yellow-300">Exhausted planet allocation this week</div>
              ) : (
                <div>Next photo in: <span className="font-medium text-gray-100">{nextPhotoMs ? formatMs(nextPhotoMs) : '—'}</span></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default SatelliteSpiderScan;