import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StructuresOnPlanet from '@/components/Structures/Structures';
import { AvatarGenerator } from '@/app/tests/page';

interface SimplePostSingleProps {
  title: string;
  author: string;
  content: string;
  category: string;
  images: string[];
}

export function SimplePostSingle({
  title,
  author,
  content,
  category,
  images,
}: SimplePostSingleProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const goToNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPreviousImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-lg bg-white/30 backdrop-blur-md border border-white/10 shadow-lg rounded-lg">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <AvatarGenerator author={author} />
            <div>
              <CardTitle>{title}</CardTitle>
              <p className="text-sm text-muted-foreground">by {author}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium text-muted-foreground mb-2">{category}</p>
          <p className="mb-4">{content}</p>
          {images.length > 0 && (
            <div className="relative">
              <img
                src={images[currentIndex]}
                alt={`Image ${currentIndex + 1}`}
                className="rounded-lg w-full"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPreviousImage}
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 focus:outline-none"
                  >
                    &#8592;
                  </button>
                  <button
                    onClick={goToNextImage}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 focus:outline-none"
                  >
                    &#8594;
                  </button>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 w-2 rounded-full ${
                          currentIndex === index ? 'bg-white' : 'bg-gray-400'
                        }`}
                      ></button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
        <StructuresOnPlanet author={author} />
      </Card>
    </div>
  );
};