import React from 'react';

interface RefreshPageButtonProps {
  buttonText?: string;
}

const RefreshPageButton: React.FC<RefreshPageButtonProps> = ({ buttonText = "Update" }) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <button
      onClick={handleRefresh}
      className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-700"
    >
      {buttonText}
    </button>
  );
};

export default RefreshPageButton;