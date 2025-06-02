import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarGenerator } from '@/components/Account/Avatar';
import { Button } from '@/components/ui/button';
import { Share2, ThumbsUpIcon, MessageCircle } from 'lucide-react';
import html2canvas from 'html2canvas';

interface SimplePostSingleProps {
  title: string;
  id: string;
  author: string;
  content: string;
  category: string;
  images: string[];
  classificationConfiguration?: any;
}

export function SimplePostSingle({
  id,
  title,
  author,
  content,
  category,
  images,
  classificationConfiguration,
}: SimplePostSingleProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const goToNextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPreviousImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleCopyLink = () => {
    const link = `https://starsailors.space/posts/${id}`;
    navigator.clipboard.writeText(link).then(() => alert('Link copied to clipboard!'));
  };

  const openPostInNewTab = () => {
    window.open(`/posts/${id}`, '_blank');
  };

  const handleShare = async () => {
    if (!shareCardRef.current) return;
    setIsSharing(true);

    const images = Array.from(shareCardRef.current.querySelectorAll('img'));
    const imagePromises = images.map((img: HTMLImageElement) =>
      new Promise<void>((resolve, reject) => {
        if (img.complete) return resolve();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("image failed to load"));
      })
    );

    try {
      await Promise.all(imagePromises);
      const canvas = await html2canvas(shareCardRef.current, {
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-share.png`;
          link.click();
        }
      }, "image/png");
    } catch (error) {
      console.error("Error sharing post: ", error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full px-4" ref={shareCardRef}>
      <Card className="w-full max-w-4xl md:w-4/5 backdrop-blur-md bg-white/90 border border-white/10 shadow-2xl rounded-xl relative overflow-hidden">
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
            <div className="relative mb-4">
              <img
                src={images[currentIndex]}
                alt={`Image ${currentIndex + 1}`}
                className="rounded-lg w-full max-h-[500px] object-cover"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPreviousImage}
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/60 text-white rounded-full p-2"
                  >
                    &#8592;
                  </button>
                  <button
                    onClick={goToNextImage}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/60 text-white rounded-full p-2"
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
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>

        {/* Bottom Action Bar */}
        <div className="w-full flex justify-between items-center px-6 pb-4 pt-2 border-t border-white/10 text-white text-sm">
          <div className="flex items-center space-x-6">
            <button className="flex items-center gap-1 hover:text-blue-400 transition">
              <ThumbsUpIcon className="w-5 h-5" />
              Vote
            </button>
            <button className="flex items-center gap-1 hover:text-green-400 transition">
              <MessageCircle className="w-5 h-5" />
              Comment
            </button>
          </div>

          {/* Share Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-1 hover:text-yellow-300 transition"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>

            {dropdownOpen && (
              <div className="absolute bottom-10 right-0 bg-white/30 backdrop-blur-md border border-white/10 shadow-xl rounded-lg p-4 z-20">
                <Button onClick={handleCopyLink} className="w-full mb-2">
                  Copy Link
                </Button>
                <Button onClick={openPostInNewTab} className="w-full mb-2">
                  Open
                </Button>
                <Button onClick={handleShare} className="w-full">
                  Download Post
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}''