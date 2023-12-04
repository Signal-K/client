import { useSession } from "@supabase/auth-helpers-react";
import { ReactNode } from "react";

interface ImageGridProps {
    imageUrl: string;
};

// This set of components is only really required as long as we don't have sectors already saved -> once they are, we'll need to replace them (see SectorSetup.tsx)
export function ImagesGrid ({ imageUrls }) {
    return (
        <div className="grid grid-cols-4 gap-2 p-4">
        {imageUrls.map((imageUrl, index) => (
          <div
            key={index}
            className="relative overflow-hidden bg-center bg-cover"
            style={{
              backgroundImage: `url(${imageUrl})`,
              paddingBottom: '100%',
              backgroundPosition: `-${(index % 4) * 25}% -${Math.floor(index / 4) * 25}%`,
            }}
          ></div>
        ))}
      </div>
    );
};

export function ImageGrid ({ imageUrl }) {
    const session = useSession();

    if (session) {
        return (
            <div className="grid grid-cols-4 gap-2 p-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden bg-center bg-cover"
          style={{
            backgroundImage: `url(${imageUrl})`,
            paddingBottom: '100%',
            backgroundPosition: `-${(index % 4) * 25}% -${Math.floor(index / 4) * 25}%`,
          }}
        ></div>
      ))}
    </div>
        );
    };

    // Hexagons are the way forward, however right now I just can't get the styling right, so we'll go back to the squares for now ^^
    return (
        <div className="grid grid-cols-4 p-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="relative overflow-hidden bg-center bg-cover hexagon"
          style={{
            backgroundImage: `url(${imageUrl})`,
            paddingBottom: '100%',
            backgroundPosition: `-${(index % 4) * 25}% -${Math.floor(index / 4) * 25}%`,
            transform: 'scale(0.6)',
          }}
        ></div>
      ))}
      <style jsx>
        {`
          .hexagon {
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          }
        `}
      </style>
    </div>
    );
}

export function HexagonBlocks () {
  return (
    <div style={{width: '100%', height: '100%', position: 'relative'}}>
    <div style={{width: 633, height: 543.61, left: 225, top: 0, position: 'absolute'}}>
        <div style={{width: 212.45, height: 200.29, left: 317.83, top: 309.46, position: 'absolute'}}>
            <div style={{width: 62.78, height: 59.49, left: 101.97, top: 165.90, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 101.97, top: 97.15, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#FF0000', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 152.96, top: 131.53, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 152.96, top: 62.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#FF0000', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 50.99, top: 131.53, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 50.99, top: 62.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#FF0000', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 50.99, top: 200.29, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 0, top: 165.90, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
        </div>
        <div style={{width: 110.47, height: 165.90, left: 521.52, top: 240.54, position: 'absolute'}}>
            <div style={{width: 62.78, height: 59.49, left: 50.99, top: 62.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 0, top: 165.90, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
        </div>
        <div style={{width: 62.78, height: 59.49, left: 573.25, top: 166.23, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
        <div style={{width: 263.44, height: 269.04, left: 369.56, top: 69.24, position: 'absolute'}}>
            <div style={{width: 62.78, height: 59.49, left: 101.98, top: 234.67, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#FF0000', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 152.96, top: 200.29, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 101.98, top: 165.90, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 101.98, top: 97.15, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 152.96, top: 131.53, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 152.96, top: 62.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 152.96, top: 269.04, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 203.95, top: 165.90, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 50.99, top: 131.53, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 50.99, top: 62.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 50.99, top: 269.04, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 50.99, top: 200.29, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#FF0000', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 0, top: 165.90, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
        </div>
        <div style={{width: 530.49, height: 407.22, left: 0, top: 0, position: 'absolute'}}>
            <div style={{width: 62.78, height: 59.49, left: 267.20, top: 372.84, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 318.19, top: 338.46, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 267.20, top: 304.09, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 267.20, top: 235.32, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 318.19, top: 269.71, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 318.19, top: 200.95, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 318.19, top: 407.22, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 369.17, top: 304.09, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#FF0000', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 216.21, top: 269.71, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 216.21, top: 200.95, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 216.21, top: 407.22, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 216.21, top: 338.46, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 165.22, top: 304.09, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 161, top: 235.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 51, top: 239.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 106, top: 203.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 54, top: 168.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 0, top: 136.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 106, top: 131.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 161, top: 94.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 51, top: 97.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 369, top: 94.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 471, top: 94.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 420, top: 62.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
        </div>
        <div style={{width: 263.44, height: 269.05, left: 165.22, top: 1, position: 'absolute'}}>
            <div style={{width: 62.78, height: 59.49, left: 101.97, top: 234.67, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#EB00FF', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 152.96, top: 200.28, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#EB00FF', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 101.97, top: 165.91, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 101.97, top: 97.15, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#EB00FF', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 152.96, top: 131.54, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#EB00FF', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 152.96, top: 62.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 152.96, top: 269.05, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 203.95, top: 165.91, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 50.99, top: 131.54, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#EB00FF', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 50.99, top: 62.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 50.99, top: 269.05, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 50.99, top: 200.28, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#EB00FF', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 0, top: 165.91, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
        </div>
        <div style={{width: 212.45, height: 165.90, left: 165.13, top: 377.71, position: 'absolute'}}>
            <div style={{width: 62.78, height: 59.49, left: 50.99, top: 97.15, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 101.98, top: 131.53, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 101.98, top: 62.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 152.96, top: 165.90, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 0, top: 131.53, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 62.78, height: 59.49, left: 0, top: 62.78, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#000AFF', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
        </div>
    </div>
    <div style={{width: 447.59, height: 499.23, left: 0, top: 43.17, position: 'absolute'}}>
        <div style={{width: 173.01, height: 94.59, left: 165.21, top: 404.64, position: 'absolute'}}>
            <div style={{width: 61.12, height: 63.74, left: 54.63, top: 94.59, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 109.27, top: 61.12, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 0, top: 61.12, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
        </div>
        <div style={{width: 227.64, height: 195.01, left: 1, top: 233.88, position: 'absolute'}}>
            <div style={{width: 61.12, height: 63.74, left: 109.27, top: 195.01, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 54.63, top: 161.54, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 54.63, top: 94.59, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 109.27, top: 128.07, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 109.27, top: 61.12, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 163.90, top: 161.54, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 0, top: 61.12, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
        </div>
        <div style={{width: 282.27, height: 261.95, left: 165.31, top: 167.44, position: 'absolute'}}>
            <div style={{width: 61.12, height: 63.74, left: 109.27, top: 228.48, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#000AFF', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 163.90, top: 195.01, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 109.27, top: 161.54, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#000AFF', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 109.27, top: 94.60, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 163.90, top: 128.06, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#000AFF', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 163.90, top: 61.12, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 163.90, top: 261.95, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#000AFF', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 218.53, top: 161.54, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#000AFF', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 54.63, top: 128.06, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 54.63, top: 61.12, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#00DA23', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 54.63, top: 261.95, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 54.63, top: 195.01, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 0, top: 161.54, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
        </div>
        <div style={{width: 284.07, height: 261.96, left: 0, top: 0, position: 'absolute'}}>
            <div style={{width: 61.12, height: 63.74, left: 111.06, top: 228.48, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#00DA23', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 165.70, top: 195.01, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 111.06, top: 161.54, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#00DA23', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 111.06, top: 94.59, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 165.70, top: 128.07, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#00DA23', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 165.70, top: 61.12, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 165.70, top: 261.96, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#00DA23', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 220.33, top: 161.54, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: '#00DA23', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 56.43, top: 128.07, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 56.43, top: 61.12, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 63.74, left: 56.43, top: 261.96, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 64.74, left: 56.43, top: 195.01, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 64.74, left: 1.80, top: 161.54, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
            <div style={{width: 61.12, height: 64.74, left: 0, top: 226.95, position: 'absolute', transform: 'rotate(-90deg)', transformOrigin: '0 0', background: 'linear-gradient(0deg, rgba(187, 187, 187, 0.80) 0%, rgba(187, 187, 187, 0.80) 100%), linear-gradient(0deg, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.50) 100%)'}}></div>
        </div>
    </div>
</div>
  );
};

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