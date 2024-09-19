import React from 'react';

interface GuideButtonProps {
    onClick: () => void;
}

const GuideButton: React.FC<GuideButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="bg-[#4CAF50] text-white font-bold py-2 px-4 rounded-md shadow-lg hover:bg-[#45a049] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4CAF50] transition-colors duration-300"
        >
            Guide
        </button>
    );
};

export default GuideButton;