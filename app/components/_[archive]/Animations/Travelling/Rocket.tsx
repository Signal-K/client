import React, { useState } from 'react';
import RocketCore from './RocketCore';

const FunctionalRocket: React.FC = () => {
  const [initialLaunchTime] = useState<number>(Date.now());

  return <RocketCore initialLaunchTime={initialLaunchTime} />;
};

export default FunctionalRocket;