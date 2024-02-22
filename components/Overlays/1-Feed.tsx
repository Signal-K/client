import React, { useEffect, useState } from 'react';
import { GardenDashboard } from '../garden-dashboard';
import { Button } from '../ui/addons/button';
import { useMediaQuery } from 'react-responsive';
import Link from 'next/link';

interface FeedOverlayProps {
  onClose: () => void;
}

const FeedOverlay: React.FC<FeedOverlayProps> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Open the overlay when it mounts
  useEffect(() => {
    setIsOpen(true);
  }, []);

  const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1224px)' });
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });

  // Close the overlay when the close button is clicked
  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => onClose(), 300); // Call onClose after the animation completes (300ms)
  };

  return (
    <div className={`fixed inset-x-0 bottom-0 flex justify-center transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="bg-gradient-to-b from-gray-100 via-blue-200 to-green-100 w-full sm:max-w-screen-lg sm:w-full max-h-60vh overflow-y-auto shadow-lg relative rounded-t-3xl">
        <div className="p-4">
        {isDesktopOrLaptop && (<center><ul className="menu bg-base-200 lg:menu-horizontal rounded-box mb-5">
  <li>
    <a>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
      Planets
      <span className="badge badge-sm">6+</span>
    </a>
  </li>
  <li>
    <a>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      Sectors
      <span className="badge badge-sm badge-warning">NEW</span>
    </a>
  </li>
  <Link href="/explore"><li>
    <a>
      Explore
      <span className="badge badge-xs badge-info"></span>
    </a>
  </li></Link>
</ul></center>)}
          <GardenDashboard />
          <center><Button className=' className="w-full mb-10"' onClick={handleClose}>Close</Button></center>
        </div>
      </div>
    </div>
  );
};

export default FeedOverlay;