import React from 'react';

interface VideoEmbedProps {
  src: string;
  title?: string;
};

const VideoEmbed: React.FC<VideoEmbedProps> = ({ src, title }) => {
  return (
    <div className="rounded-lg overflow-hidden shadow-lg">
      <iframe
        title={title || 'Embedded Video'}
        src={src}
        frameBorder="0"
        allowFullScreen
        className="w-full h-full"
      ></iframe>
    </div>
  );
};

export default VideoEmbed;