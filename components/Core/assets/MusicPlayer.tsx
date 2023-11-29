import React, { useRef } from 'react';
import { faPlay, faPause, faStepForward, faStepBackward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const MusicPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  return (
    <div className="fixed bottom-0 w-full bg-white block md:block z-50 transform scale-95 md:scale-100"> {/* Show on all screens, scale down on mobile */}
      <div className="h-[10%] flex items-center justify-center p-4"> {/* Center content */}
      <div className="flex items-center pl-4">
          </div>
      </div>
      <audio ref={audioRef} src="/assets/audio/WakeUp.mp3" />
    </div>
  );
};

export default MusicPlayer;