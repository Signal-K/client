import React from 'react';
import { GardenDashboard } from '../../@/components/garden-dashboard';

interface FeedOverlayProps {
  onClose: () => void;
}

const FeedOverlay: React.FC<FeedOverlayProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-x-0 bottom-0 flex justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-t-3xl w-full sm:max-w-screen-lg sm:w-full max-h-60vh overflow-y-auto shadow-lg transform transition-all duration-300">
        <div className="p-4">
          <h2 className="text-2xl font-bold">Feed Overlay</h2>
          <button onClick={onClose} className="mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded">
            Close
          </button>
          <GardenDashboard />
        </div>
      </div>
    </div>
  );
};

export default FeedOverlay;
