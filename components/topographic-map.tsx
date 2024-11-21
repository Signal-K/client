import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Pickaxe, Zap, Battery, Magnet } from 'lucide-react';

export type MineralDeposit = {
  id: string;
  name: string;
  mineral: string;
  amount: number;
  position: { x: number; y: number };
  icon_url: string;
  level: number;
  uses: any[]; // Adjust this according to your actual data structure
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
    case 'Iron':
      return <Magnet className="text-red-500" />;
    case 'Copper':
      return <Zap className="text-orange-500" />;
    case 'Coal':
      return <Battery className="text-gray-700" />;
    case 'Nickel':
      return <Pickaxe className="text-green-500" />;
    default:
      return <Pickaxe className="text-blue-500" />;
  }
};

const BackgroundMap = ({ deposits }: { deposits: MineralDeposit[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawMap = () => {
      const { width, height } = canvas;

      ctx.fillStyle = '#F5F5DC';
      ctx.fillRect(0, 0, width, height);

      deposits.forEach((deposit) => {
        ctx.fillStyle = '#A52A2A';
        ctx.beginPath();
        ctx.arc(
          deposit.position.x * (width / 100),
          deposit.position.y * (height / 100),
          Math.sqrt(deposit.amount) / 5,
          0,
          2 * Math.PI
        );
        ctx.fill();
        ctx.strokeStyle = '#2C4F64';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawMap();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, [deposits]);

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
  return (
    <div className="absolute inset-0">
      <BackgroundMap deposits={deposits} />
      {deposits.map((deposit) => (
        <div
          key={deposit.id}
          className="absolute"
          style={{
            left: `${deposit.position.x}%`,
            top: `${deposit.position.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          onClick={() => onDepositSelect(deposit)}
        >
          {getMineralIcon(deposit.mineral)}
        </div>
      ))}
      {landmarks.map((landmark) => (
        <div
          key={landmark.id}
          className="absolute"
          style={{
            left: `${landmark.position.x}%`,
            top: `${landmark.position.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          onClick={() => onLandmarkClick(landmark.id)}
        >
          <MapPin />
        </div>
      ))}
    </div>
  );
}