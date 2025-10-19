"use client";

import React from "react";
import { Card } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";

/**
 * Isometric dot face SVG component
 * Creates a simple, friendly face using isometric-style dots
 */
const IsometricDotFace = () => (
  <svg 
    width="48" 
    height="48" 
    viewBox="0 0 48 48" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    {/* Face outline circle with dots */}
    <circle cx="24" cy="24" r="18" fill="currentColor" opacity="0.1" />
    
    {/* Left eye - isometric dots */}
    <g transform="translate(14, 18)">
      <circle cx="0" cy="0" r="2" fill="currentColor" opacity="0.8" />
      <circle cx="3" cy="-1.5" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="3" cy="1.5" r="1.5" fill="currentColor" opacity="0.6" />
    </g>
    
    {/* Right eye - isometric dots */}
    <g transform="translate(34, 18)">
      <circle cx="0" cy="0" r="2" fill="currentColor" opacity="0.8" />
      <circle cx="-3" cy="-1.5" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="-3" cy="1.5" r="1.5" fill="currentColor" opacity="0.6" />
    </g>
    
    {/* Smile - curved line of dots */}
    <g transform="translate(24, 28)">
      <circle cx="-8" cy="0" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="-5" cy="2" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="-2" cy="3" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="0" cy="3.5" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="2" cy="3" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="5" cy="2" r="1.5" fill="currentColor" opacity="0.7" />
      <circle cx="8" cy="0" r="1.5" fill="currentColor" opacity="0.7" />
    </g>
    
    {/* Decorative dots around face */}
    <circle cx="8" cy="12" r="1" fill="currentColor" opacity="0.3" />
    <circle cx="40" cy="12" r="1" fill="currentColor" opacity="0.3" />
    <circle cx="8" cy="36" r="1" fill="currentColor" opacity="0.3" />
    <circle cx="40" cy="36" r="1" fill="currentColor" opacity="0.3" />
  </svg>
);

export default function FeedbackTeaser() {
  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-yellow-500/5">
      <div className="p-4 flex items-center gap-4">
        {/* Icon Section */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="text-primary">
              <IsometricDotFace />
            </div>
            {/* Sparkle indicator */}
            <div className="absolute -top-1 -right-1">
              <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-foreground">Feedback</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-medium">
              New
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            🐝 Coming soon: <span className="font-medium text-foreground">Bumble</span> — Tend your garden, count the bees
          </p>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          <Link 
            href="https://star-sailors.userjot.com/?cursor=1&order=top&limit=10"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button 
              size="sm" 
              variant="outline"
              className="gap-2 hover:bg-amber-500/10 hover:border-amber-500/50 transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              <span className="hidden sm:inline">Share Ideas</span>
              <span className="sm:hidden">Feedback</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Subtle animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </Card>
  );
}
