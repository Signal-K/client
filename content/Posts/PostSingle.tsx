// PostCardSingle.tsx (Updated)
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, GitFork } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CommentCard } from "../Comments/CommentSingle";
import { CommentForm } from "../Comments/CommentForm";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface PostCardSingleProps {
  classificationId: number;
  title: string;
  author: string;
  content: string;
  votes: number;
  category: string;
  tags: string[];
  images: string[];
  onVote: () => void;
}

export function PostCardSingle({
  classificationId,
  title,
  author,
  content,
  votes,
  category,
  tags,
  images,
  onVote,
}: PostCardSingleProps) {
  const supabase = useSupabaseClient();
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(true);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("classification_id", classificationId);

      if (error) throw error;
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [classificationId]);

  const [voteCount, setVoteCount] = useState(votes);

  const handleVoteClick = () => {
    onVote();
    setVoteCount((prevCount) => prevCount + 1);
  };

  // Callback to refresh the comments list after adding a new comment
  const handleCommentAdded = () => {
    fetchComments();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 squiggly-connector bg-card text-card-foreground border-primary">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${author}`} />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground"> by {author} </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Badge variant="secondary" className="mr-2">{category}</Badge>
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="mr-2">{tag}</Badge>
          ))}
        </div>
        <p>{content}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {images.map((image, index) => (
            <img key={index} src={image} alt={`Media ${index + 1}`} className="w-full h-auto max-w-xs object-cover" />
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" size="sm" onClick={handleVoteClick}>
          <ThumbsUp className="mr-2 h-4 w-4" />
          {voteCount}
        </Button>
        <Button variant="ghost" size="sm">
          <MessageSquare className="mr-2 h-4 w-4" />
          {comments.length} Comments
        </Button>
        <Button variant="ghost" size="sm">
          <GitFork className="mr-2 h-4 w-4" />
          Fork
        </Button>
      </CardFooter>
      <div className="mt-8">
        {loadingComments ? (
          <p>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <CommentCard
              key={comment.id}
              author={comment.author}
              content={comment.content}
              createdAt={comment.created_at}
              replyCount={0} // You can implement reply count logic here
            />
          ))
        )}
      </div>
      <div className="mt-8">
        <CommentForm classificationId={classificationId} onCommentAdded={handleCommentAdded} />
      </div>
    </Card>
  );
};