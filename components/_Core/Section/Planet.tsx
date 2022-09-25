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
    <div className="flex flex-col justify-center">
      <div className="flex overflow-hidden relative flex-col w-full min-h-[2413px] max-md:max-w-full">
        <img
          loading="lazy"
          src={backgroundImage}
          className="object-cover absolute inset-0 size-full"
        />
        <Header
          logoImage={logoImage}
          planetName={planetName}
          leftArrowImage={leftArrowImage}
          rightArrowImage={rightArrowImage}
          compassImage={compassImage}
        />
        <RoverSection
          structureImage={structureImage}
          activeRoverImage={activeRoverImage}
          idleRoverImage={idleRoverImage}
        />
        <Gallery images={galleryImages} centerButtonImage={centerButtonImage} />
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
    <div className="flex relative flex-col justify-center w-full backdrop-blur-[5px] bg-white bg-opacity-0 max-md:max-w-full">
      <div className="flex gap-2.5 justify-between items-center px-12 py-5 w-full max-md:flex-wrap max-md:px-5 max-md:max-w-full">
        <img
          loading="lazy"
          src={logoImage}
          className="shrink-0 self-stretch my-auto max-w-full aspect-square w-[100px]"
        />
        <div className="flex flex-col justify-center self-stretch max-md:max-w-full">
          <div className="flex flex-col justify-center items-center py-1.5 max-md:max-w-full">
            <div className="justify-center px-4 py-1 text-xl font-medium text-center text-white whitespace-nowrap rounded-xl shadow-sm bg-indigo-600 bg-opacity-40">
              Main
            </div>
            <div className="flex gap-5 justify-center items-center self-stretch px-3 mt-2 text-3xl font-semibold text-center text-white uppercase tracking-[5.12px] max-md:flex-wrap">
              <img
                loading="lazy"
                src={leftArrowImage}
                className="shrink-0 self-stretch my-auto border-white border-solid aspect-square border-[3px] stroke-[3px] stroke-white w-[33px]"
              />
              <div className="self-stretch">{planetName}</div>
              <img
                loading="lazy"
                src={rightArrowImage}
                className="shrink-0 self-stretch my-auto border-white border-solid aspect-square border-[3px] stroke-[3px] stroke-white w-[33px]"
              />
            </div>
            <div className="flex justify-center items-center p-1.5 mt-2 w-[47px]">
              <img loading="lazy" src={compassImage} className="w-full aspect-square" />
            </div>
          </div>
        </div>
        <img
          loading="lazy"
          src={logoImage}
          className="shrink-0 self-stretch my-auto max-w-full aspect-square w-[100px]"
        />
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
    <div className="relative self-center w-full max-w-[906px] mt-[1554px] max-md:mt-10 max-md:max-w-full">
      <div className="flex gap-5 max-md:flex-col max-md:gap-0">
        <div className="flex flex-col w-[26%] max-md:ml-0 max-md:w-full">
          <div className="flex relative flex-col px-5 mt-1 text-xl font-semibold text-center text-white uppercase whitespace-nowrap tracking-[3.2px] max-md:mt-10">
            <div>structure</div>
            <div className="shrink-0 self-start mt-20 rounded-full shadow-2xl backdrop-blur-[5px] bg-cyan-300 bg-opacity-50 h-[45px] max-md:mt-10" />
          </div>
        </div>
        <div className="flex flex-col ml-5 w-[74%] max-md:ml-0 max-md:w-full">
          <div className="relative grow max-md:mt-10 max-md:max-w-full">
            <div className="flex gap-5 max-md:flex-col max-md:gap-0">
              <div className="flex flex-col w-[68%] max-md:ml-0 max-md:w-full">
                <div className="flex relative grow gap-4 items-start mt-16 max-md:mt-10">
                  <div className="flex flex-col flex-1 px-5">
                    <div className="justify-center self-center px-4 py-1 text-xl font-medium text-center text-white whitespace-nowrap rounded-xl shadow-sm bg-green-500 bg-opacity-40">
                      Active
                    </div>
                    <div className="text-xl font-semibold text-center text-white uppercase tracking-[3.2px]">
                      rover
                    </div>
                    <div className="flex flex-col justify-center px-10 py-0.5 max-md:px-5">
                      <div className="flex flex-col items-start pt-5">
                        <img
                          loading="lazy"
                          src={activeRoverImage}
                          className="aspect-[1.18] w-[92px]"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 px-5 mt-1.5">
                    <div className="justify-center self-center px-4 py-1 text-xl font-medium text-center text-white whitespace-nowrap rounded-xl shadow-sm bg-red-600 bg-opacity-40">
                      Idle
                    </div>
                    <div className="text-xl font-semibold text-center text-white uppercase tracking-[3.2px]">
                      rover
                    </div>
                    <div className="flex flex-col justify-center px-10 py-0.5 max-md:px-5">
                      <div className="flex flex-col items-start pt-5">
                        <img
                          loading="lazy"
                          src={idleRoverImage}
                          className="aspect-[1.18] w-[92px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col ml-5 w-[32%] max-md:ml-0 max-md:w-full">
                <div className="flex relative flex-col px-5 text-xl font-semibold text-center text-white uppercase whitespace-nowrap tracking-[3.2px] max-md:mt-9">
                  <div>structure</div>
                  <div className="shrink-0 self-start mt-20 rounded-full shadow-2xl backdrop-blur-[5px] bg-cyan-300 bg-opacity-50 h-[45px] max-md:mt-10" />
                </div>
              </div>
            </div>
          </div>
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
    <div className="flex relative flex-col justify-center mt-16 w-full max-md:mt-10 max-md:max-w-full">
      <div className="flex flex-col justify-center py-5 w-full max-md:max-w-full">
        <div className="flex flex-col justify-center w-full max-md:max-w-full">
          <div className="flex justify-center items-center px-16 py-6 w-full max-md:px-5 max-md:max-w-full">
            <div className="flex gap-5 justify-between max-md:flex-wrap">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="flex overflow-hidden relative flex-col justify-center aspect-[1.08] w-[140px]"
                >
                  <img
                    loading="lazy"
                    src={image}
                    className="object-cover absolute inset-0 size-full"
                  />
                  <div className="relative shrink-0 h-[130px]" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center self-center px-2.5 mt-10 bg-indigo-700 h-[108px] rounded-[100px] w-[108px]">
          <img loading="lazy" src={centerButtonImage} className="w-full aspect-square" />
        </div>
      </div>
    </div>
  );
};

export default Planet;