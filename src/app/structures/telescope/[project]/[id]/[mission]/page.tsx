'use client'

import dynamic from "next/dynamic";

// @react-three/fiber (used transitively via PlanetGenerator → planetViewer) ships
// react-reconciler@0.27 which accesses React 18 internals (ReactCurrentBatchConfig)
// that no longer exist in React 19, causing a 500 during SSR. Disabling SSR here
// keeps all Three.js code client-side only where it belongs.
const TelescopeClassifyPageClient = dynamic(
  () => import("./TelescopeClassifyPageClient"),
  { ssr: false }
);

export default TelescopeClassifyPageClient;
