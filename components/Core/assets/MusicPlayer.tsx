import React, { useRef } from 'react';
import { faPlay, faPause, faStepForward, faStepBackward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const MusicPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudioLoop = () => {
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.play();
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const fastForwardAudio = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
  
      // Add the desired skip duration, e.g., 10 seconds
      const skipDuration = 10; // 10 seconds
  
      // Calculate the new time
      const newTime = currentTime + skipDuration;
  
      // Ensure the new time doesn't exceed the audio duration
      const clampedTime = Math.min(newTime, duration);
  
      audioRef.current.currentTime = clampedTime;
    }
  };
  
  const rewindAudio = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
  
      // Subtract the desired skip duration, e.g., 10 seconds
      const skipDuration = 10; // 10 seconds
  
      // Calculate the new time
      const newTime = currentTime - skipDuration;
  
      // Ensure the new time is not negative
      const clampedTime = Math.max(newTime, 0);
  
      audioRef.current.currentTime = clampedTime;
    }
  };
  
  return (
    <div className="fixed bottom-0 w-full bg-white block md:block z-50 transform scale-95 md:scale-100"> {/* Show on all screens, scale down on mobile */}
      <div className="h-[10%] flex items-center justify-center p-4"> {/* Center content */}
      <div className="flex items-center pl-4">
          <img
            src="https://github.com/Signal-K/client/blob/FCDB-4/public/assets/Onboarding/Missions/Emergence/navigator.png?raw=true"
            alt="Album Art"
            className="w-12 h-12 object-cover mr-4"
          />
          <div>
            <p className="text-lg font-bold">Galactic Radio</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 mx-4">
          <button onClick={playAudioLoop}>
            <FontAwesomeIcon icon={faPlay} />
          </button>
          <button onClick={pauseAudio}>
            <FontAwesomeIcon icon={faPause} />
          </button>
          {/* <button onClick={fastForwardAudio}>
            <FontAwesomeIcon icon={faStepForward} />
          </button>
          <button onClick={rewindAudio}>
            <FontAwesomeIcon icon={faStepBackward} />
          </button> */}
        </div>
      </div>
      <audio ref={audioRef} src="/assets/audio/WakeUp.mp3" />
    </div>
  );
};

export default MusicPlayer;