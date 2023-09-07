import React, { CSSProperties } from 'react';

const OnboardingPopup = ({ imageSrc, message }: { imageSrc: string; message: string }) => {
  const popupStyle: CSSProperties = {
    position: 'fixed',
    top: '80px', // Adjust the top offset as needed
    left: '30px', // Adjust the left offset as needed
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
  };

  const imageStyle: CSSProperties = {
    marginRight: '10px', // Adjust spacing as needed
    width: '50px', // Adjust the image size as needed
    height: '50px',
  };

  return (
    <div style={popupStyle}>
      <img src={imageSrc} alt="Popup" style={imageStyle} />
      <p>{message}</p>
    </div>
  );
};

export default OnboardingPopup;