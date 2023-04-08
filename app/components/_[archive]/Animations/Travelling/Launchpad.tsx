import { useEffect, useState } from 'react';
import FunctionalRocket from './Rocket';
import ClassRocket from './ClassRocket';
import './_launchpad.scss';

export default function LaunchPad() {
  const [, triggerRerender] = useState(Date.now());
  
  useEffect(() => {
    setInterval(() => { triggerRerender(Date.now()); }, 500);
  }, [])
  
  return (
    <div className="launchpad">
      <FunctionalRocket />
    </div>
  );
}
