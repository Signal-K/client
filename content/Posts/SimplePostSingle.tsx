import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StructuresOnPlanet from '@/components/Structures/Structures';
import { AvatarGenerator } from '@/components/Account/Avatar';
import { Button } from '@/components/ui/button';
import { Share2, ThumbsUpIcon } from 'lucide-react';
import PlanetGenerator from '@/components/Data/Generator/Astronomers/PlanetHunters/PlanetGenerator';
import html2canvas from 'html2canvas';

interface SimplePostSingleProps {
  title: string;
  id: string;
  author: string;
  content: string;
  category: string;
  images: string[];
  votes?: number;
  classificationConfiguration?: any;
};

export function SimplePostSingle({
  id,
  title,
  author,
  content,
  category,
  images,
  votes,
  classificationConfiguration,
}: SimplePostSingleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSharing, setIsSharing] = useState<boolean>(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  const goToNextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPreviousImage = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // For sharing
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleCopyLink = () => {
    const link = `https://starsailors.space/posts/${id}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  const openPostInNewTab = () => {
    window.open(`/posts/${id}`, '_blank');
  };

  const handleShare = async () => {
    if (!shareCardRef.current) {
      return;
    };

    setIsSharing(true);

    const safeTitle = title || 'post';

    const images = Array.from(shareCardRef.current.querySelectorAll('img'));
    const imagePromises = images.map((img: HTMLImageElement) =>
      new Promise<void>((resolve, reject) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("image failed to load"));
        };
      })
    );

    try {
      await Promise.all(imagePromises);
      const canvas = await html2canvas(shareCardRef.current, {
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${safeTitle.toLowerCase().replace(/\s+/g, "-")}-share.png`;
            link.click();
          }
        },
        "image/png",
        1.0,
      );
    } catch (error: any) {
      console.error("Error sharing post: ", error);
    } finally {
      setIsSharing(false);
    };
  };

  return (
    <div className="flex items-center justify-center" ref={shareCardRef}>
      <Card className="w-full max-w-lg bg-white/30 backdrop-blur-md border border-white/10 shadow-lg rounded-lg relative">
        <div
          className="absolute top-2 right-2 z-10"
          ref={dropdownRef}
        >
          <Button
            onClick={toggleDropdown}
            className="flex items-center gap-2 justify-center"
          >
            <Share2 className="mr-2" /> Share
          </Button>
          {dropdownOpen && (
            <div className="absolute top-10 right-0 bg-white/30 backdrop-blur-md border border-white/10 shadow-lg rounded-lg p-4">
              <Button onClick={handleCopyLink} className="w-full mb-2">
                Copy Link
              </Button>
              <Button onClick={openPostInNewTab} className="w-full">
                Open
              </Button>
              <Button onClick={handleShare} className="w-full mt-2">
                Download Post
              </Button>
            </div>
          )}
        </div>

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
              {/* {votes &&<ThumbsUpIcon className='text-blue-500' /> {votes} Votes */}
            </div>
          )}
        </CardContent>
        {/* <PlanetGenerator classificationId={String(id)} classificationConfig={classificationConfiguration} author={author} /> */}
        {/* <StructuresOnPlanet author={author} /> */}
      </Card>
    </div>
  );
};