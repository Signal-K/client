import React from 'react';
import { BoardingPass } from "@/types/Travel";
import Image from 'next/image';

interface BoardingPassCardProps {
  boardingPass: BoardingPass;
}

const BoardingPassCard: React.FC<BoardingPassCardProps> = ({ boardingPass }) => {
  return (
    <div className="bg-[#2C4F64] p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-4 text-center text-[#5FCBC3]">Boarding Pass</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-[#B9E678]">Passenger Information</h3>
          <p><span className="font-semibold">Name:</span> {boardingPass.userName}</p>
          <p><span className="font-semibold">Frequent Flyer:</span> {boardingPass.frequentFlyerNumber}</p>
          <p><span className="font-semibold">Status:</span> {boardingPass.frequentFlyerStatus}</p>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2 text-[#B9E678]">Flight Information</h3>
          <p><span className="font-semibold">From:</span> {boardingPass.departurePlanet} ({boardingPass.departureTemperature}°C)</p>
          <p><span className="font-semibold">To:</span> {boardingPass.destinationPlanet} ({boardingPass.destinationTemperature}°C)</p>
          <p><span className="font-semibold">Rocket:</span> {boardingPass.rocketType}</p>
          <p><span className="font-semibold">Departure:</span> {new Date(boardingPass.departureTime).toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <Image src="/qr-code-placeholder.png" alt="QR Code" width={150} height={150} />
      </div>
      <div className="mt-4 flex justify-center">
        <Image src="/barcode-placeholder.png" alt="Barcode" width={250} height={80} />
      </div>
    </div>
  );
};

export default BoardingPassCard;