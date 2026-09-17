import React from 'react';

const VideoEmbed = () => {
  return (
    <div className="bg-black">
      <div className="relative h-0" style={{ paddingBottom: '56.25%' }}>
        {/* 16:9 aspect ratio, adjust as needed */}
        <iframe
          src="/assets/Videos/StarSailors.mp4"
          title="Welcome to Star Sailors"
          frameBorder="0"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        ></iframe>
      </div>
    </div>
  );
};

export default VideoEmbed;