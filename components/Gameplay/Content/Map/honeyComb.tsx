import React from 'react';
import Hexagon from './Hexagon';

interface HexagonProps {
    filled: boolean;
    fillType: string;
    fillIcon: string;
    colour: string;
};

interface HoneycombProps {
  hexagons: Array<HexagonProps>;
  backgroundImage: string;
}

const Honeycomb: React.FC<HoneycombProps> = ({ hexagons, backgroundImage }) => {
  const honeycombStyle = {
    backgroundImage: `url(${backgroundImage})`,
  };

  return (
    <div className="honeycomb-container" style={honeycombStyle}>
      <div className="grid grid-cols-3 gap-4">
        {hexagons.map((hexagon, index) => (
          <Hexagon key={index} {...hexagon} />
        ))}
      </div>
    </div>
  );
};

export default Honeycomb;
