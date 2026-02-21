"use client";

import { useState, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Star, UserPlus, X, Clock } from "lucide-react";
import ConvertAnonymousAccount from "./ConvertAnonymousAccount";
import { useAuthUser } from "@/src/hooks/useAuthUser";

interface AnonymousUserPromptProps {
  classificationsCount?: number;
  discoveryCount?: number;
  timeSpent?: number; // in minutes
  showPrompt?: boolean;
}

export default function AnonymousUserPrompt({ 
  classificationsCount = 0, 
  discoveryCount = 0, 
  timeSpent = 0,
  showPrompt = false
}: AnonymousUserPromptProps) {
  const { user } = useAuthUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  
  const isAnonymousUser = Boolean((user as any)?.is_anonymous);
  
  // Determine if we should show the upgrade prompt
  const shouldShowPrompt = isAnonymousUser && !isDismissed && (
    classificationsCount >= 3 || 
    discoveryCount >= 1 || 
    timeSpent >= 10 ||
    showPrompt
  );

  useEffect(() => {
    // Check localStorage to see if the user has dismissed this before
    const dismissed = localStorage.getItem('anonymousPromptDismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('anonymousPromptDismissed', 'true');
  };

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleUpgradeSuccess = () => {
    setIsOpen(false);
    setIsDismissed(true);
    // Clear the dismissed flag since they successfully upgraded
    localStorage.removeItem('anonymousPromptDismissed');
  };

  if (!shouldShowPrompt) {
    return null;
  }

  return (
    <>
      {/* Inline Prompt Banner */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 mb-6">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-full">
              <UserPlus className="h-5 w-5 text-amber-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">
                    You're making great progress! 🚀
                  </h3>
                  <p className="text-sm text-amber-800 mb-3">
                    {classificationsCount > 0 && `You've made ${classificationsCount} classifications. `}
                    {discoveryCount > 0 && `Found ${discoveryCount} discoveries. `}
                    {timeSpent > 0 && `Spent ${Math.round(timeSpent)} minutes exploring. `}
                    Save your account (free!) to keep your progress forever!
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {classificationsCount > 0 && (
                      <div className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                        <Star className="h-3 w-3" />
                        {classificationsCount} Classifications
                      </div>
                    )}
                    {discoveryCount > 0 && (
                      <div className="flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        <Star className="h-3 w-3" />
                        {discoveryCount} Discoveries
                      </div>
                    )}
                    {timeSpent > 0 && (
                      <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        <Clock className="h-3 w-3" />
                        {Math.round(timeSpent)}min Active
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={handleOpenModal}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Save Account (Free!)
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      variant="outline"
                      size="sm"
                      className="text-amber-700 border-amber-300 hover:bg-amber-100"
                    >
                      Maybe Later
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-amber-600 hover:bg-amber-100 p-1 h-auto"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal for Account Upgrade */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center">Save Your Account</DialogTitle>
          </DialogHeader>
          <ConvertAnonymousAccount 
            onSuccess={handleUpgradeSuccess}
            onCancel={handleCloseModal}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
