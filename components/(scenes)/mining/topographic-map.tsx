import { useEffect, useRef, useState } from "react";
import { MapPin, Pickaxe, Zap, Battery, Magnet } from "lucide-react";
import { createNoise2D } from "simplex-noise";
import alea from "alea";

export type MineralDeposit = {
  id: string;
  name: string;
  mineral: string;
  amount: number;
  position: { x: number; y: number };
  icon_url: string;
  level: number;
  uses: any[];
};

type Landmark = {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  isOpen: boolean;
}; 

type TopographicMapProps = {
  deposits: MineralDeposit[]; 
  roverPosition: { x: number; y: number } | null;
  selectedDeposit: MineralDeposit | null;
  landmarks: Landmark[];
  onLandmarkClick: (id: string) => void;
  onDepositSelect: (deposit: MineralDeposit) => void;
};

const getMineralIcon = (name: string) => {
  switch (name) {
    case "Iron":
      return <Magnet className="text-red-500" />;
    case "Copper":
      return <Zap className="text-orange-500" />;
    case "Coal":
      return <Battery className="text-gray-700" />;
    case "Nickel":
      return <Pickaxe className="text-green-500" />;
    default:
      return <Pickaxe className="text-blue-500" />;
  }
};

const BackgroundMap = ({ deposits, seed }: { deposits: MineralDeposit[]; seed: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prng = alea(seed);
    const noise2D = createNoise2D(prng);

    const drawMap = () => {
      const { width, height } = canvas;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#a6142a" // "#F5F5DC";
      ctx.fillRect(0, 0, width, height);

      const step = 10;
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const elevation = noise2D(x * 0.005, y * 0.005);
          const color = elevation > 0 ? `rgba(96, 165, 250, ${elevation})` : `rgba(30, 58, 138, ${-elevation})`;
          ctx.fillStyle = color;
          ctx.fillRect(x, y, step, step);
        }
      }

      deposits.forEach((deposit) => {
        ctx.fillStyle = "#A52A2A";
        ctx.beginPath();
        ctx.arc(
          deposit.position.x * (width / 100),
          deposit.position.y * (height / 100),
          Math.sqrt(deposit.amount) / 5,
          0,
          2 * Math.PI
        );
        ctx.fill();
        ctx.strokeStyle = "#2C4F64";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawMap();
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener("resize", resizeCanvas);
  }, [deposits, seed]);

  return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />;
};

export function TopographicMap({
  deposits,
  roverPosition,
  selectedDeposit,
  landmarks,
  onDepositSelect,
  onLandmarkClick,
}: TopographicMapProps) {
  const [terrainSeed, setTerrainSeed] = useState("default");
  const [dynamicLandmarks, setDynamicLandmarks] = useState(landmarks);

  const generateNewSector = () => {
    const newSeed = Math.random().toString(); // Generate a new random seed
    setTerrainSeed(newSeed);

    setDynamicLandmarks(
      dynamicLandmarks.map((landmark) => ({
        ...landmark,
        position: {
          x: Math.random() * 100,
          y: Math.random() * 100,
        },
      }))
    );
  };

  return (
    <div className="relative w-full h-full">
      <BackgroundMap deposits={deposits} seed={terrainSeed} />
      {deposits.map((deposit) => (
  <div
    key={deposit.id}
    className="absolute"
    style={{
      left: `${deposit.position.x}%`,
      top: `${deposit.position.y}%`,
      transform: "translate(-50%, -50%)",
    }}
    onClick={() => onDepositSelect(deposit)}
  >
    {deposit.icon_url ? (
      <img src={deposit.icon_url} alt={deposit.mineral} />
    ) : (
      getMineralIcon(deposit.mineral)
    )}
  </div>
))}
      {dynamicLandmarks.map((landmark) => (
        <div
          key={landmark.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{ top: `${landmark.position.y}%`, left: `${landmark.position.x}%` }}
          onClick={() => onLandmarkClick(landmark.id)}
        >
          <MapPin className="text-blue-500 hover:text-blue-700" />
        </div>
      ))}
      <button
        onClick={generateNewSector}
        className="absolute bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700"
      >
        Generate Next Sector
      </button>
    </div>
  );
};