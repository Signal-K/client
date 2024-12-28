"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { CommentCard } from "../Comments/CommentSingle";

import CloudSignal from "@/components/Structures/Missions/Meteorologists/Cloudspotting/CloudSignal";
import PlanetGenerator from "@/components/Data/Generator/Astronomers/PlanetHunters/PlanetGenerator";

interface CommentProps {
  id: number;
  author: string;
  content: string;
  created_at: string;
};

interface PostCardSingleProps {
  classificationId: number;
  title: string;
  anomalyId: string;
  author: string;
  content: string;
  votes: number;
  category: string;
  tags?: string[];
  classificationConfig?: any;
  images: string[];
  classificationType: string;
  onVote?: () => void;
  commentStatus?: boolean;
};

export function PostCardSingleWithGenerator({
  classificationId,
  title,
  author,
  content,
  votes,
  category,
  tags,
  anomalyId,
  classificationConfig,
  images,
  classificationType,
  commentStatus,
  onVote,
}: PostCardSingleProps) {
  const supabase = useSupabaseClient();
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(true);
  const [voteCount, setVoteCount] = useState(votes);

  useEffect(() => {
    fetchComments();
  }, [classificationId]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("classification_id", classificationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleVoteClick = () => {
    if (onVote) onVote();
    setVoteCount((prev) => prev + 1);
  };

  const renderDynamicComponent = () => {
    switch (classificationType) {
      case "cloud":
        return <CloudSignal
          classificationConfig={classificationConfig}
          classificationId={String(classificationId)} 
        />
      case "planet":
        return <PlanetGenerator
          classificationId={String(classificationId)} 
          classificationConfig={classificationConfig}
          author={author}
        />;
      default:
        return (
          <div>
            {loadingComments ? (
              <p>Loading comments...</p>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  author={comment.author}
                  content={comment.content}
                  createdAt={comment.created_at}
                  replyCount={0}
                  parentCommentId={classificationId}
                />
              ))
            ) : (
              <p>No comments yet. Be the first to comment!</p>
            )}
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 bg-card text-card-foreground border-primary">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${author}`} />
            <AvatarFallback>{author[0]}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground">by {author}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Badge variant="secondary">{category}</Badge>
        <p>{content}</p>
        {images.length > 0 && (
          <div>
            <img src={images[0]} alt="Post Image" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Button onClick={handleVoteClick} size="sm">
          <ThumbsUp className="mr-2" /> {voteCount}
        </Button>
        <Button size="sm">
          <MessageSquare className="mr-2" /> {comments.length}
        </Button>
      </CardFooter>
      <CardContent>{renderDynamicComponent()}</CardContent>
    </Card>
  );
};