import { ReactNode } from "react";

const HexagonClip: React.FC = () => (
  <svg className="clip-svg">
    <defs>
      <clipPath id="hexagon-clip" clipPathUnits="objectBoundingBox">
        <polygon points="0.25 0.05, 0.75 0.05, 1 0.5, 0.75 0.95, 0.25 0.95, 0 0.5" />
      </clipPath>
    </defs>
  </svg>
);

const TriangleClip: React.FC = () => (
  <svg className="clip-svg">
    <defs>
      <clipPath id="triangle-clip" clipPathUnits="objectBoundingBox">
        <polygon points="1 0.03, 0.17 1, 1 1" />
      </clipPath>
    </defs>
  </svg>
);

interface ClipBlockProps {
    backgroundUrl: string;
    gradientColors: string;
    children?: ReactNode;
  }
  
  const ClipBlock: React.FC<ClipBlockProps> = ({ backgroundUrl, gradientColors, children }) => (
    <div className="clip-block">
      <div
        className="clip-each clip-solid"
        style={{
          backgroundImage: `url(${backgroundUrl})`,
          backgroundBlendMode: 'hard-light',
        }}
      >
        <div className="social-share-block">
          <span className="social-each">
            <strong>10</strong>
          </span>{' '}
          <span>&hearts;</span>
        </div>
      </div>
      {children}
    </div>
  );

const ClipGradient: React.FC = () => (
  <a href="#" className="clip-each clip-gradient">
    <div className="clip-caption">work</div>
  </a>
);

const ClipBorder: React.FC = () => (
  <a href="#" className="clip-each clip-border">
    <div className="clip-caption">life</div>
  </a>
);

const ClipTagline: React.FC = () => (
  <div className="clip-block">
    <a href="#" className="clip-tagline">
      balance
    </a>
  </div>
);

const ClipSolid: React.FC<{ backgroundUrl: string }> = ({ backgroundUrl }) => (
  <div className="clip-solid" style={{ backgroundImage: `url(${backgroundUrl})` }}>
    <div className="clip-caption" style={{ color: '#fff' }}>
      Text on Solid Clip
    </div>
  </div>
);

const PolygonClip: React.FC = () => (
  <div className="wrap">
    <ClipBlock backgroundUrl="https://karenmenezes.com/static/img/demos/shapes-polygon/c.jpg" gradientColors="#ad6996">
      <ClipSolid backgroundUrl="https://karenmenezes.com/static/img/demos/shapes-polygon/c.jpg" />
    </ClipBlock>
    <ClipBlock backgroundUrl="https://karenmenezes.com/static/img/demos/shapes-polygon/c.jpg" gradientColors="#ad6996">
      <ClipGradient />
      <ClipBorder />
    </ClipBlock>
    <ClipTagline />
    <HexagonClip />
    <TriangleClip />
  </div>
);

export default PolygonClip;

import React from 'react';

export function SectorGallery() {
    const isHovered = true;
    
    return (
        <div className="grid space-2 w-[130px] h-[130px] m-[-100px] mr-[-10px] mb-[-100px] ml-[-10px]">
             <img
       src="https://picsum.photos/id/1040/300/300"
       alt="a house on a mountain"
       className={`w-full h-full object-cover filter ${isHovered ? 'grayscale-0' : 'grayscale-80'}`} />
     <img
       src="https://picsum.photos/id/1040/300/300"
       alt="a house on a mountain"
       className={`w-full h-full object-cover filter ${isHovered ? 'grayscale-0' : 'grayscale-80'}`}
    //    onMouseEnter={() => setIsHovered(true)}
    //    onMouseLeave={() => setIsHovered(false)}
     />
   </div>
        
    );
};

export function HexagonGrid() {
    const hexagons = Array.from({ length: 7 }).map((_, index) => {
        const rotateClass = index % 2 === 0 ? 'rotate-120deg' : '';
        const translateClass = index === 0 ? 'translate-y-[-50%]' : index > 3 ? 'translate-y-[50%]' : '';
        const xTranslateClass = index % 2 === 0 ? '-translate-x-[50%]' : '';
        const yTranslateClass = index === 0 || index > 3 ? '-translate-y-[50%]' : '';
     
        return (
          <div key={index} className={`absolute ${rotateClass} ${translateClass} ${xTranslateClass} ${yTranslateClass} w-64 h-64 bg-transparent border-gray-500 border-4 rounded-full clip-path[polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)]`}>
            <img src="/placeholder.jpg" alt="Placeholder" className="mx-auto mt-10 w-4/5" />
          </div>
        );
      });
     
      return (
        <div className="relative w-full h-full">
          {hexagons}
        </div>
      );
};

{/* <div className="grid grid-cols-3 gap-4 mx-auto max-w-2xl p-8 bg-blue-300 hexagon-carousel">
        <img
          src="https://picsum.photos/id/1040/300/300"
          alt="a house on a mountain"
          className="hexagon-item"
        />
        <img
          src="https://picsum.photos/id/106/300/300"
          alt="sime pink flowers"
          className="hexagon-item"
        />
        <img
          src="https://picsum.photos/id/136/300/300"
          alt="big rocks with some trees"
          className="hexagon-item"
        />
        <img
          src="https://picsum.photos/id/1039/300/300"
          alt="a waterfall, a lot of tree and a great view from the sky"
          className="hexagon-item"
        />
        <img
          src="https://picsum.photos/id/110/300/300"
          alt="a cool landscape"
          className="hexagon-item"
        />
        <img
          src="https://picsum.photos/id/1047/300/300"
          alt="inside a town between two big buildings"
          className="hexagon-item"
        />
        <img
          src="https://picsum.photos/id/1057/300/300"
          alt="a great view of the sea above the mountain"
          className="hexagon-item"
        />
      </div> */}