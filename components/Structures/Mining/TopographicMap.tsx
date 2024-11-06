'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export type MineralDeposit = {
    id: string;
    mineral: string; 
    quantity: number;
    position: { x: number; y: number };
};
 
type Props = {
    deposits: MineralDeposit[];
    roverPosition: { x: number; y: number } | null;
    selectedDeposit: MineralDeposit | null;
};

export function TopographicMap({ deposits = [], roverPosition, selectedDeposit }: Props) { 
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
    
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        const drawTopographicMap = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#2C3A4A';  // Updated background
          ctx.fillRect(0, 0, canvas.width, canvas.height);
    
          ctx.strokeStyle = '#74859A'; // Updated stroke for topography
          for (let i = 0; i < 10; i++) {
            const [centerX, centerY, radius] = [Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 100 + 50];
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
          }
    
          deposits.forEach(deposit => {
            const color = getDepositColor(deposit.mineral);
            drawDeposit(ctx, deposit, color);
          });
        };
    
        const getDepositColor = (name: string) => {
          const colors: Record<string, string> = {
            'Iron': '#FFE3BA',
            'Copper': '#5FCBC3',
            'Gold': '#FFD700',
            'Titanium': '#B0C4DE',
            'Platinum': '#E5E4E2',
          };
          return colors[name] || '#FFE3BA';
        };
    
        const drawDeposit = (ctx: CanvasRenderingContext2D, deposit: MineralDeposit, color: string) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(deposit.position.x, deposit.position.y, Math.sqrt(deposit.quantity) / 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.strokeStyle = '#85DDA2';  // Updated stroke
          ctx.lineWidth = 2;
          ctx.stroke();
    
          ctx.fillStyle = '#85DDA2';  // Updated text color
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(deposit.mineral, deposit.position.x, deposit.position.y + Math.sqrt(deposit.quantity) / 2 + 20);
        };
    
        drawTopographicMap();
      }, [deposits]);

      return (
        <div className="relative w-full bg-[#2C3A4A]"> 
          <canvas ref={canvasRef} className="w-full h-full" width={800} height={400} />
          {roverPosition && (
            <motion.div
              className="absolute w-4 h-4 bg-[#5FCBC3] rounded-full" 
              style={{ left: roverPosition.x, top: roverPosition.y }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
          {selectedDeposit && (
            <div
              className="absolute w-6 h-6 border-2 border-[#5FCBC3] rounded-full"                      
              style={{ left: selectedDeposit.position.x - 12, top: selectedDeposit.position.y - 12 }}
            />
          )}
        </div>
      );
}