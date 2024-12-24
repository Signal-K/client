import { Canvas } from "@react-three/fiber"
import { Stars, OrbitControls } from "@react-three/drei";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Asteroid } from "./Asteroid";
import { Effects } from "./effects";

export default function AsteroidViewer() {
  const [metallic, setMetallic] = useState(0.5)

  return (
    <div className="w-full h-screen bg-black">
      <Canvas camera={{ position: [0, 0, 4] }}>
        <color attach="background" args={["black"]} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Asteroid metallic={metallic} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1} />
        <Effects />
      </Canvas>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 bg-black/50 p-4 rounded-lg">
        <label className="text-white text-sm mb-2 block">Material Type</label>
        <Slider
          value={[metallic]}
          onValueChange={([value]) => setMetallic(value)}
          max={1}
          step={0.01}
          className="w-full"
        />
        <div className="flex justify-between text-white/70 text-xs mt-1">
          <span>Rocky</span>
          <span>Metallic</span>
        </div>
      </div>
    </div>
  );
};