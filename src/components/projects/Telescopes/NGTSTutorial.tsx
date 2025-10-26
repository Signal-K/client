"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface NGTSTutorialProps {
  onClose: () => void;
}

const NGTSTutorial: React.FC<NGTSTutorialProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to NGTS Planet Classification",
      text: "The Next-Generation Transit Survey (NGTS) is a ground-based robotic search for exoplanets in Chile. You'll be analyzing real transit data from these observations.",
      image: "/assets/Template.png"
    },
    {
      title: "Understanding Transit Plots",
      text: "NGTS data shows how a star's brightness changes over time. When a planet passes in front of its star (a transit), we see a dip in the light curve.",
      image: "/assets/Docs/Curves/Step2.png"
    },
    {
      title: "The Odd Even Transit Check",
      text: "This is a key diagnostic tool. We split the transits into two groups: odd-numbered transits (green) and even-numbered transits (magenta). If both groups overlap in the middle of the plot, it suggests a real planet signal.",
      image: "/assets/Template.png"
    },
    {
      title: "What to Look For",
      text: "Question: 'Do both the green and magenta points cover most of the middle portion of the plot?' If YES, the odd and even transits align well - this is good! If NO, they don't align - this might indicate a false positive or binary star system.",
      image: "/assets/Docs/Curves/Step1.png"
    },
    {
      title: "Drawing the Transit Shape",
      text: "After answering the Odd Even Transit Check question, you'll draw the shape of the main transit curve. This helps us understand the transit depth and shape, which reveals information about the planet's size.",
      image: "/assets/Docs/Curves/Step3.png"
    },
    {
      title: "Tips for Success",
      text: "Look for: (1) Clear alignment between green and magenta points in the middle, (2) Smooth, U-shaped or V-shaped dips, (3) Consistent transit depth. Be wary of: scattered points, asymmetric shapes, or large differences between odd/even transits.",
      image: "/assets/Docs/Curves/Step4.png"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#2C4F64]/95 to-[#1a2332]/95 rounded-2xl shadow-2xl border border-[#85DDA2]/30 max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#85DDA2]/20">
          <h2 className="text-2xl font-bold text-[#85DDA2]">
            {slides[currentSlide].title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-[#85DDA2]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Image */}
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-black/40 flex items-center justify-center">
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Text */}
          <p className="text-white/90 text-lg leading-relaxed">
            {slides[currentSlide].text}
          </p>

          {/* Progress indicators */}
          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-[#85DDA2]"
                    : "w-2 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer with navigation */}
        <div className="flex justify-between items-center p-6 border-t border-[#85DDA2]/20">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentSlide === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-white/10"
            }`}
          >
            <ChevronLeft className="w-5 h-5 text-[#85DDA2]" />
            <span className="text-[#85DDA2]">Previous</span>
          </button>

          <span className="text-white/70">
            {currentSlide + 1} / {slides.length}
          </span>

          {currentSlide === slides.length - 1 ? (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#85DDA2] text-[#1a2332] font-semibold rounded-lg hover:bg-[#6bc c84] transition-colors"
            >
              Start Classifying
            </button>
          ) : (
            <button
              onClick={nextSlide}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <span className="text-[#85DDA2]">Next</span>
              <ChevronRight className="w-5 h-5 text-[#85DDA2]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NGTSTutorial;
