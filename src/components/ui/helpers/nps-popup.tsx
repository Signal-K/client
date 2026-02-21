'use client';

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import { X } from "lucide-react";
import { Label } from "@/src/components/ui/label";
import { useAuthUser } from "@/src/hooks/useAuthUser";

interface NPSPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | null;
};

export default function NPSPopup({ isOpen, onClose, userId }: NPSPopupProps) {
  const { user } = useAuthUser();

  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [why, setWhy] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleScoreSelect = (score: number) => setNpsScore(score);

  const handleSubmit = async () => {
    if (npsScore === null || isSubmitting) return;
    if (!user?.id && !userId) return;

    setIsSubmitting(true);
    const response = await fetch("/api/gameplay/nps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        npsScore,
        feedback: why,
      }),
    });
    const payload = await response.json().catch(() => null);
    setIsSubmitting(false);

    if (!response.ok) {
      console.error("Error submitting NPS survey:", payload?.error || response.statusText);
      return;
    }

    setIsSubmitted(true);
    setTimeout(() => {
        onClose();
    }, 2300);
  };

  const getScoreLabel = (score: number) => {
    if (score <= 5) return "Not likely";
    if (score <= 8) return "Neutral";
    return "Very likely";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto relative">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Quick Survey</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isSubmitted ? (
            <>
              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  How likely are you to recommend Star Sailors to a friend or colleague?
                </Label>

                <div className="space-y-3">
                  {/* This ensures it is in a horizontal row */}
                  <div className="flex flex-wrap gap-1 justify-center">
                    {Array.from({ length: 11 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => handleScoreSelect(i)}
                        className={`h-8 w-8 text-xs font-medium rounded transition-colors
                          ${
                            npsScore === i
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                          }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Not at all likely</span>
                    <span>Extremely likely</span>
                  </div>

                  {npsScore !== null && (
                    <p className="text-sm text-center text-muted-foreground">{getScoreLabel(npsScore)}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="projects" className="text-sm font-medium">
                  Why? What would you like to see?
                </Label>
                <Textarea
                  id="projects"
                  placeholder="Tell us your thoughts..."
                  value={why || ""}
                  onChange={(e) => setWhy(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={npsScore === null || isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Survey"}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Thank you!</h3>
              <p className="text-sm text-muted-foreground">Your feedback helps us improve Star Sailors for everyone.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
