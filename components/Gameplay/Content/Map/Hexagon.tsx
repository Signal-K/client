import React from 'react';

interface HexagonProps {
  filled: boolean;
  fillType: string;
  fillIcon: string;
  colour: string;
}

const Hexagon: React.FC<HexagonProps> = ({ filled, fillType, fillIcon, colour }) => {
  const hexagonClass = filled ? 'bg-opacity-50' : 'bg-opacity-20';
  const outlineColor = colour || '#BBBBBB';

  return (
    <div className={`hexagon ${hexagonClass}`} style={{ borderColor: outlineColor }}>
      {fillIcon && !filled && (
        <img src={fillIcon} alt="" className="w-4/5 h-4/5 mx-auto my-auto" />
      )}
    </div>
  );
};

export default Hexagon;