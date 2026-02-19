"use client";

import React, { useState, useEffect } from 'react';
import { useSession, useSupabaseClient } from '@/src/lib/auth/session-context';
import Image from 'next/image';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  X, 
  Lightbulb, 
  HelpCircle,
  CheckCircle2,
  Info,
  Sparkles
} from 'lucide-react';
import { cn } from '@/src/shared/utils';

interface TutorialSlide {
  text: string;
  image?: string;
  title?: string;
  /** Optional tip shown at the bottom */
  tip?: string;
  /** Optional quiz question to check understanding */
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  /** Optional highlight for specific UI element (for future interactive mode) */
  highlight?: string;
}

interface TutorialContentBlockProps {
  classificationtype: string;
  slides: TutorialSlide[];
  onComplete: () => void;
  onSkip?: () => void;
  title?: string;
  description?: string;
  forceShow?: boolean;
  /** Context about what this classification helps with */
  scientificContext?: string;
  /** What structure this classification uses */
  structureType?: 'telescope' | 'satellite' | 'rover' | 'solar';
}

export default function TutorialContentBlock({
  classificationtype,
  slides,
  onComplete,
  onSkip,
  title = "Tutorial",
  description = "Learn how to complete this classification",
  forceShow = false,
  scientificContext,
  structureType
}: TutorialContentBlockProps) {
  const supabase = useSupabaseClient();
  const session = useSession();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isCheckingFirstTime, setIsCheckingFirstTime] = useState(true);
  const [loading, setLoading] = useState(true);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);
  const [showContextInfo, setShowContextInfo] = useState(false);

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
      // Reset quiz state for new slide
      setQuizAnswer(null);
      setShowQuizFeedback(false);
      setQuizCorrect(false);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      setQuizAnswer(null);
      setShowQuizFeedback(false);
      setQuizCorrect(false);
    }
  };

  const handleQuizAnswer = (index: number) => {
    if (showQuizFeedback) return; // Prevent changing answer after submission
    setQuizAnswer(index);
  };

  const submitQuiz = () => {
    if (quizAnswer === null || !currentSlideData.quiz) return;
    const isCorrect = quizAnswer === currentSlideData.quiz.correctIndex;
    setQuizCorrect(isCorrect);
    setShowQuizFeedback(true);
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
            {/* Scientific Context Banner */}
            {scientificContext && showContextInfo && (
              <div className="p-4 bg-blue-500/20 border-b border-blue-500/30">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-300 mb-1">Why does this matter?</h4>
                    <p className="text-sm text-blue-100/80 leading-relaxed">{scientificContext}</p>
                  </div>
                  <button
                    onClick={() => setShowContextInfo(false)}
                    className="p-1 hover:bg-blue-500/20 rounded"
                  >
                    <X className="w-4 h-4 text-blue-300" />
                  </button>
                </div>
              </div>
            )}

            {/* Context toggle button */}
            {scientificContext && !showContextInfo && (
              <button
                onClick={() => setShowContextInfo(true)}
                className="absolute top-4 right-4 p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-300 transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            )}

            {/* Slide Content */}
            <div className="flex-1 flex flex-col lg:flex-row">
              {/* Text Content */}
              <div className={cn(
                "p-6 sm:p-8 flex flex-col justify-center",
                currentSlideData.image ? "lg:w-1/2" : "lg:w-full"
              )}>
                <div className="space-y-4">
                  {currentSlideData.title && (
                    <h3 className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                      {currentSlideData.title}
                    </h3>
                  )}
                  <p className="text-white/90 text-base sm:text-lg leading-relaxed">
                    {currentSlideData.text}
                  </p>

                  {/* Tip section */}
                  {currentSlideData.tip && (
                    <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mt-4">
                      <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-100/90">{currentSlideData.tip}</p>
                    </div>
                  )}

                  {/* Quiz section */}
                  {currentSlideData.quiz && (
                    <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-4">
                      <h4 className="font-semibold text-purple-300 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Quick Check
                      </h4>
                      <p className="text-white/90">{currentSlideData.quiz.question}</p>
                      
                      <div className="space-y-2">
                        {currentSlideData.quiz.options.map((option, index) => {
                          const isSelected = quizAnswer === index;
                          const isCorrectOption = index === currentSlideData.quiz!.correctIndex;
                          let optionClasses = "w-full p-3 rounded-lg text-left text-sm transition-all border ";
                          
                          if (showQuizFeedback) {
                            if (isCorrectOption) {
                              optionClasses += "bg-green-500/20 border-green-500/50 text-green-200";
                            } else if (isSelected && !isCorrectOption) {
                              optionClasses += "bg-red-500/20 border-red-500/50 text-red-200";
                            } else {
                              optionClasses += "bg-white/5 border-white/10 text-white/50";
                            }
                          } else {
                            optionClasses += isSelected
                              ? "bg-purple-500/30 border-purple-500/50 text-white"
                              : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10";
                          }

                          return (
                            <button
                              key={index}
                              onClick={() => handleQuizAnswer(index)}
                              disabled={showQuizFeedback}
                              className={optionClasses}
                            >
                              <span className="flex items-center gap-2">
                                {showQuizFeedback && isCorrectOption && (
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                )}
                                {option}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {!showQuizFeedback && quizAnswer !== null && (
                        <Button
                          onClick={submitQuiz}
                          className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                        >
                          Check Answer
                        </Button>
                      )}

                      {showQuizFeedback && (
                        <div className={cn(
                          "p-3 rounded-lg text-sm",
                          quizCorrect
                            ? "bg-green-500/20 border border-green-500/30 text-green-200"
                            : "bg-amber-500/20 border border-amber-500/30 text-amber-200"
                        )}>
                          <p className="font-semibold mb-1">
                            {quizCorrect ? "✓ Correct!" : "Not quite!"}
                          </p>
                          <p>{currentSlideData.quiz.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
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
  tip?: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}>): TutorialSlide[] {
  return slidesData.map((slide) => ({
    text: slide.text,
    image: slide.image,
    title: slide.title,
    tip: slide.tip,
    quiz: slide.quiz,
  }));
}

// Pre-built scientific context strings for different classification types
export const SCIENTIFIC_CONTEXTS = {
  'planet': 'By analyzing light curves from TESS, you help discover worlds beyond our solar system. Your classifications contribute to real scientific research and have led to the discovery of new exoplanets!',
  'telescope-minorPlanet': 'Tracking asteroids helps us understand our solar system\'s history and identify potentially hazardous objects. Your observations directly contribute to planetary defense efforts.',
  'sunspot': 'Monitoring solar activity helps predict space weather that can affect satellites, power grids, and astronauts. Your sunspot counts continue a 400-year scientific tradition!',
  'balloon-marsCloudShapes': 'Understanding Martian clouds reveals how water moves through the atmosphere and where it might be found. This is crucial for future Mars missions and understanding climate patterns.',
  'satellite-planetFour': 'Seasonal fans and blotches on Mars reveal active CO₂ geysers and help us understand how volatiles behave on cold worlds. This informs our search for subsurface water.',
  'automaton-aiForMars': 'Training AI rovers helps real Mars missions. Your terrain classifications directly inform how Perseverance and Curiosity navigate, making future exploration safer and more efficient.',
  'lidar-jovianVortexHunter': 'Jupiter\'s storms can last centuries! Understanding their dynamics helps us understand atmospheric physics on gas giants throughout the universe.',
};

// Export the TutorialSlide type for use in other components
export type { TutorialSlide };

// useTutorial hook removed (deleted per cleanup request)
