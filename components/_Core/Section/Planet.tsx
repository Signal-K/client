import * as React from "react";

interface PlanetProps {
  backgroundImage: string;
  logoImage: string;
  planetName: string;
  leftArrowImage: string;
  rightArrowImage: string;
  compassImage: string;
  structureImage: string;
  activeRoverImage: string;
  idleRoverImage: string;
  galleryImages: string[];
  centerButtonImage: string;
}

const Planet: React.FC<PlanetProps> = ({
  backgroundImage,
  logoImage,
  planetName,
  leftArrowImage,
  rightArrowImage,
  compassImage,
  structureImage,
  activeRoverImage,
  idleRoverImage,
  galleryImages,
  centerButtonImage,
}) => {
  return (
    <div className="flex flex-col justify-center overflow-hidden h-screen">
      <img
        loading="lazy"
        src={backgroundImage}
        className="object-cover absolute inset-0 z-0"
      />
      <div className="relative z-10 flex-1">
        {/* <Header
          logoImage={logoImage}
          planetName={planetName}
          leftArrowImage={leftArrowImage}
          rightArrowImage={rightArrowImage}
          compassImage={compassImage}
        /> */}
        <div className="flex flex-col justify-between h-full pb-8">
          <RoverSection
            structureImage={structureImage}
            activeRoverImage={activeRoverImage}
            idleRoverImage={idleRoverImage}
          />
          <Gallery images={galleryImages} centerButtonImage={centerButtonImage} />
        </div>
      </div>
    </div>
  );
};

interface HeaderProps {
  logoImage: string;
  planetName: string;
  leftArrowImage: string;
  rightArrowImage: string;
  compassImage: string;
}

const Header: React.FC<HeaderProps> = ({
  logoImage,
  planetName,
  leftArrowImage,
  rightArrowImage,
  compassImage,
}) => {
  return (
    <div className="flex justify-between items-center px-6 py-4">
      <div className="flex items-center">
        <img loading="lazy" src={logoImage} className="w-12 h-12 mr-2" />
        <div className="flex flex-col items-center">
          <img loading="lazy" src={leftArrowImage} className="w-6 h-6 mb-1" />
          <div className="text-white">{planetName}</div>
          <img loading="lazy" src={rightArrowImage} className="w-6 h-6 mt-1" />
        </div>
        <img loading="lazy" src={compassImage} className="w-6 h-6 ml-auto" />
      </div>
    </div>
  );
};

interface RoverSectionProps {
  structureImage: string;
  activeRoverImage: string;
  idleRoverImage: string;
}

const RoverSection: React.FC<RoverSectionProps> = ({
  structureImage,
  activeRoverImage,
  idleRoverImage,
}) => {
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex justify-between w-full px-6 mb-4">
        {[1, 2, 3].map((index) => (
          <div key={index} className="w-1/3 p-2">
            <img loading="lazy" src={structureImage} className="w-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-between w-full px-6">
        <div className="w-1/2">
          <div className="text-center text-white">Active Rover</div>
          <img loading="lazy" src={activeRoverImage} className="w-full" />
        </div>
        <div className="w-1/2">
          <div className="text-center text-white">Idle Rover</div>
          <img loading="lazy" src={idleRoverImage} className="w-full" />
        </div>
      </div>
    </div>
  );
};

interface GalleryProps {
  images: string[];
  centerButtonImage: string;
}

const Gallery: React.FC<GalleryProps> = ({ images, centerButtonImage }) => {
  return (
    <div className="flex justify-center">
      <div className="flex flex-wrap w-full px-4">
        {images.map((image, index) => (
          <div key={index} className="w-1/3 p-2">
            <img loading="lazy" src={image} className="w-full" />
          </div>
        ))}
      </div>
      <div className="flex justify-center w-full">
        <img loading="lazy" src={centerButtonImage} className="w-16 h-16 mb-8" />
      </div>
    </div>
  );
};

export default Planet;