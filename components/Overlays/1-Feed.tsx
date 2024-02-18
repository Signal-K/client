import React, { useEffect, useState } from 'react';
import { GardenDashboard } from '../../@/components/garden-dashboard';

interface FeedOverlayProps {
  onClose: () => void;
}

const FeedOverlay: React.FC<FeedOverlayProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Open the overlay when it mounts
  useEffect(() => {
    setIsOpen(true);
  }, []);

  // Close the overlay when the close button is clicked
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => onClose(), 300); // Call onClose after the animation completes (300ms)
  };

  return (
    <div className={`fixed inset-x-0 bottom-0 flex justify-center transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="bg-gradient-to-b from-gray-100 via-gray-200 to-blue-100 w-full sm:max-w-screen-lg sm:w-full max-h-60vh overflow-y-auto shadow-lg relative rounded-t-3xl">
        <div className="p-4">
          <h2 className="text-2xl font-bold">Feed Overlay</h2>
          <button
            onClick={handleClose}
            className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded"
          >
            Close
          </button>
          <GardenDashboard />
        </div>
      </div>
    </div>
  );
};

export default FeedOverlay;