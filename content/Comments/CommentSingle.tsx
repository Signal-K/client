"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface CommentCardProps {
  author: string;
  content: string;
  createdAt: string;
  replyCount: number;
  parentCommentId?: number | null;
};
 
export function CommentCard({ author, content, createdAt, replyCount, parentCommentId }: CommentCardProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto my-4 squiggly-connector bg-card text-card-foreground border-primary">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${author}`} />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{author}</CardTitle>
            <p className="text-sm text-muted-foreground">Posted at {new Date(createdAt).toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p>{content}</p>
      </CardContent>
      <Button variant="ghost" size="sm" className="flex items-center">
        <MessageSquare className="mr-2 h-4 w-4" />
        {replyCount} Replies
      </Button>
    </Card>
  );
};