"use client";

import React, { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Image from 'next/image';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';

interface TutorialSlide {
  text: string;
  image?: string;
  title?: string;
}

interface TutorialContentBlockProps {
  classificationtype: string;
  slides: TutorialSlide[];
  onComplete: () => void;
  onSkip?: () => void;
  title?: string;
  description?: string;
  forceShow?: boolean; // Add prop to force tutorial display
}

export default function TutorialContentBlock({
  classificationtype,
  slides,
  onComplete,
  onSkip,
  title = "Tutorial",
  description = "Learn how to complete this classification",
  forceShow = false
}: TutorialContentBlockProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isCheckingFirstTime, setIsCheckingFirstTime] = useState(true);
  const [loading, setLoading] = useState(true);

  // Check if user has completed this classification type before
  useEffect(() => {
    const checkFirstTimeUser = async () => {
      // If forceShow is true, skip the check and always show tutorial
      if (forceShow) {
        setShowTutorial(true);
        setLoading(false);
        setIsCheckingFirstTime(false);
        return;
      }

      if (!session?.user?.id) {
        setLoading(false);
        setIsCheckingFirstTime(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('classifications')
          .select('id')
          .eq('author', session.user.id)
          .eq('classificationtype', classificationtype)
          .limit(1);

        if (error) {
          console.error('Error checking classification history:', error);
          setShowTutorial(false);
        } else {
          // If no classifications found, show tutorial
          const isFirstTime = !data || data.length === 0;
          setShowTutorial(isFirstTime);
        }
      } catch (error) {
        console.error('Error in first-time check:', error);
        setShowTutorial(false);
      } finally {
        setLoading(false);
        setIsCheckingFirstTime(false);
      }
    };

    checkFirstTimeUser();
  }, [session, supabase, classificationtype, forceShow]);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setShowTutorial(false);
    onComplete();
  };

  const handleSkip = () => {
    setShowTutorial(false);
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Don't render anything while checking
  if (isCheckingFirstTime || loading) {
    return null;
  }

  // Don't render if tutorial shouldn't be shown
  if (!showTutorial) {
    return null;
  }

  const currentSlideData = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">{title}</h2>
            <p className="text-gray-300 text-sm sm:text-base">{description}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSkip}
            className="text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Content */}
        <Card className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
          <CardContent className="p-0 h-full flex flex-col">
            {/* Slide Content */}
            <div className="flex-1 flex flex-col lg:flex-row">
              {/* Text Content */}
              <div className="lg:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
                <div className="space-y-4">
                  {currentSlideData.title && (
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      {currentSlideData.title}
                    </h3>
                  )}
                  <p className="text-white/90 text-base sm:text-lg leading-relaxed">
                    {currentSlideData.text}
                  </p>
                </div>
              </div>

              {/* Image Content */}
              {currentSlideData.image && (
                <div className="lg:w-1/2 relative min-h-[300px] lg:min-h-full">
                  <Image
                    src={currentSlideData.image}
                    alt={`Tutorial step ${currentSlide + 1}`}
                    fill
                    className="object-cover lg:object-contain"
                    priority={currentSlide <= 1}
                  />
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="p-6 sm:p-8 border-t border-white/10">
              {/* Progress Indicators */}
              <div className="flex justify-center mb-6">
                <div className="flex space-x-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentSlide
                          ? 'bg-green-400 scale-125'
                          : index < currentSlide
                          ? 'bg-green-400/60'
                          : 'bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={prevSlide}
                    disabled={isFirstSlide}
                    className="text-white hover:bg-white/10 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                </div>

                <div className="text-center">
                  <span className="text-white/70 text-sm">
                    {currentSlide + 1} of {slides.length}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {!isLastSlide && (
                    <Button
                      variant="ghost"
                      onClick={handleSkip}
                      className="text-white/70 hover:bg-white/10"
                    >
                      Skip Tutorial
                    </Button>
                  )}
                  
                  <Button
                    onClick={isLastSlide ? handleComplete : nextSlide}
                    className="bg-gradient-to-r from-green-500/80 to-blue-500/80 hover:from-green-600/90 hover:to-blue-600/90 text-white border-0 rounded-2xl backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                  >
                    {isLastSlide ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Classification
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Export helper function to create tutorial slides
export function createTutorialSlides(slidesData: Array<{
  text: string;
  image?: string;
  title?: string;
}>): TutorialSlide[] {
  return slidesData.map((slide) => ({
    text: slide.text,
    image: slide.image,
    title: slide.title,
  }));
}

// Export hook for tutorial state management
// useTutorial hook removed (deleted per cleanup request)
