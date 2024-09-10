"use client";

import React, { useState, useEffect } from "react";

interface BottomMenuBarProps {
    onClose: () => void;
};

export const BottomMenuBar: React.FC<BottomMenuBarProps> = ({ onClose }) => {
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
        <div className="bg-cover bg-center w-full sm:max-w-screen-lg sm:w-full max-h-96vh overflow-y-auto shadow-lg relative rounded-t-3xl">
          <div style={{ backgroundImage: `url('/assets/Backdrops/garden.png')` }} className="bg-cover bg-center h-96vh flex items-center justify-center relative rounded-t-3xl">

          </div>
        </div>
      </div>
    );
  };