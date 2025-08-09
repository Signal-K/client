"use client";

import { useSession } from "@supabase/auth-helpers-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { UserX, Clock, Database, AlertTriangle, Sparkles } from "lucide-react";

interface AnonymousUserStatusProps {
  onUpgradeClick?: () => void;
  className?: string;
}

export default function AnonymousUserStatus({ onUpgradeClick, className }: AnonymousUserStatusProps) {
  const session = useSession();
  
  const isAnonymousUser = session?.user?.is_anonymous;

  if (!isAnonymousUser) {
    return null;
  }

  return (
    <Alert className={`border-amber-200 bg-amber-50 ${className}`}>
      <UserX className="h-4 w-4 text-amber-600" />
      <AlertDescription>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-amber-300 text-amber-800">
                Guest Session
              </Badge>
              <div className="flex items-center gap-1 text-xs text-amber-700">
                <Clock className="h-3 w-3" />
                Temporary account
              </div>
            </div>
            
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Your current session:</p>
              <ul className="space-y-1 text-xs text-amber-700">
                <li className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Progress saved temporarily
                </li>
                <li className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Full gameplay features available
                </li>
                <li className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span className="text-amber-600">Lost if you sign out or clear browser data</span>
                </li>
              </ul>
            </div>

            {onUpgradeClick && (
              <div className="pt-2">
                <Button 
                  onClick={onUpgradeClick}
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Upgrade to Permanent Account
                </Button>
              </div>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
