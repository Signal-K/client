import React, { ReactNode } from "react";

interface BackgroundPageProps {
  backgroundImage: string;
  children: ReactNode;
}

const BackgroundPage: React.FC<BackgroundPageProps> = ({
  backgroundImage,
  children,
}) => {
  const backgroundStyle: React.CSSProperties = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1,
  };

  const contentContainerStyle: React.CSSProperties = {
    position: "relative", // To allow children to be positioned relative to this container
    zIndex: 1, // Ensure content appears above the background
  };

  return (
    <div style={backgroundStyle}>
      <div style={contentContainerStyle}>
        {children}
      </div>
    </div>
  );
};

export default BackgroundPage;