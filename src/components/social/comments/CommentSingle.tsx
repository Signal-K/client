"use client";

import { AvatarGenerator } from "@/src/components/profile/setup/Avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";

interface CommentCardProps {
  id: number;
  author: string;
  content: string;
  createdAt: string;
  children?: React.ReactNode;
  parentCommentId?: number | null;
  category?: string;
  value?: string | null;
  replyCount: number;
  isSurveyor?: boolean;
  configuration?: {
    planetType?: string;
    preferred?: boolean;
  };
  classificationId: number;
  classificationConfig?: any;
};

export function CommentCard({ 
  author, 
  classificationConfig, 
  category, 
  classificationId, 
  content, 
  createdAt, 
  value, 
  replyCount, 
  parentCommentId, 
  isSurveyor, 
  configuration 
}: CommentCardProps) {
  const handleConfirmComment = async () => {
    if (!configuration) return;

    try {
      const response = await fetch("/api/gameplay/classifications/configuration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classificationId,
          action: "merge",
          patch: configuration,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || "Failed to confirm comment");
      }
    } catch (error) {
      console.error("Error confirming comment:", error);
    };
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-4 squiggly-connector bg-card text-card-foreground border-primary">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <AvatarGenerator author={author} />
          <div>
            <CardTitle>{author}</CardTitle>
            {isSurveyor && <p className="text-red-800">Surveyor</p>}
            <p className="text-green-300">{category}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p>{content}</p>
        {value && category && (
          <div className="mt-2 p-2 bg-gray-800 text-gray-200 rounded-md text-sm">
            <strong>{category}</strong> = {value}
          </div>
        )}
        {configuration && (
          <Button onClick={handleConfirmComment} className="text-green-500 mt-2">
            Confirm
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
