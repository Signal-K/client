import React from 'react';
import Honeycomb from '../../../components/Gameplay/Content/Map/honeyComb';

const generateUnfilledHexagons = (count) => {
  const hexagons = [];

  for (let i = 0; i < count; i++) {
    hexagons.push({
      filled: false,
      fillType: '',
      fillIcon: '',
      colour: '#BBBBBB',
    });
  }

  return hexagons;
};

function HoneycombComponent() {
  const hexagons = generateUnfilledHexagons(100);

  return (
    <div className="container mx-auto p-4">
      <Honeycomb hexagons={hexagons} backgroundImage='https://cdn.openart.ai/stable_diffusion/05aafad9d71b10cf232e156bd759241a2e668651_2000x2000.webp' />
    </div>
  );
}

export default HoneycombComponent;