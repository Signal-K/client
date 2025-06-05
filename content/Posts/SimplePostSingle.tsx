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
      <Card className="w-full max-w-4xl md:w-4/5 bg-white border border-[#D8DEE9] shadow-2xl rounded-xl relative overflow-hidden transition-all">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <AvatarGenerator author={author} />
            <div>
              <CardTitle className="text-[#2E3440]">{title}</CardTitle>
              <p className="text-sm text-[#4C566A]">by {author}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-xs font-semibold text-[#5E81AC] uppercase mb-1 tracking-wide">
            {category}
          </p>
          <p className="text-[#2E3440] mb-4">{content}</p>

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
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-[#4C566A]/60 text-white rounded-full p-2"
                  >
                    &#8592;
                  </button>
                  <button
                    onClick={goToNextImage}
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-[#4C566A]/60 text-white rounded-full p-2"
                  >
                    &#8594;
                  </button>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 w-2 rounded-full transition ${
                          currentIndex === index ? 'bg-[#5E81AC]' : 'bg-[#D8DEE9]'
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
        <div className="w-full flex justify-between items-center px-6 pb-4 pt-2 border-t border-[#D8DEE9] text-[#2E3440] text-sm bg-white/80">
          <div className="flex items-center space-x-6">
            <button className="flex items-center gap-1 text-[#4C566A] hover:text-[#88C0D0] transition">
              <ThumbsUpIcon className="w-5 h-5" />
              Vote
            </button>
            <button className="flex items-center gap-1 text-[#4C566A] hover:text-[#A3BE8C] transition">
              <MessageCircle className="w-5 h-5" />
              Comment
            </button>
          </div>

          {/* Share Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-1 text-[#4C566A] hover:text-[#EBCB8B] transition"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>

            {dropdownOpen && (
              <div className="absolute bottom-10 right-0 bg-white/90 backdrop-blur-md border border-[#D8DEE9] shadow-xl rounded-lg p-4 z-20">
                <Button
                  onClick={handleCopyLink}
                  className="w-full mb-2 bg-[#88C0D0] text-white hover:bg-[#81A1C1]"
                >
                  Copy Link
                </Button>
                <Button
                  onClick={openPostInNewTab}
                  className="w-full mb-2 bg-[#5E81AC] text-white hover:bg-[#4C566A]"
                >
                  Open
                </Button>
                <Button
                  onClick={handleShare}
                  className="w-full bg-[#A3BE8C] text-white hover:bg-[#8FBC8F]"
                >
                  Download Post
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};