import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CommentCard } from "../Comments/CommentSingle";
import { CommentForm } from "../Comments/CommentForm";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

import {
  planetClassificationOptions,
  roverImgClassificationOptions,
  cloudClassificationOptionsOne,
  cloudClassificationOptionsTwo,
  cloudClassificationOptionsThree,
  zoodexBurrowingOwlClassificationOptions,
  zoodexIguanasFromAboveClassificationOptions,
  diskDetectorClassificationOptions,
  DailyMinorPlanetOptions,
  automatonaiForMarsOptions,
} from "../Classifications/Options";

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
  children?: React.ReactNode;
  commentStatus?: boolean;
}

export function PostCardSingle({
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
  const [comments, setComments] = useState<any[]>([]);
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
        .eq("classification_id", classificationId);

      if (error) throw error;
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleVoteClick = () => {
    if (onVote) {
      onVote();
    };
    setVoteCount((prevCount) => prevCount + 1);
  };

  const handleCommentAdded = () => {
    fetchComments();
  };

  const getClassificationOptions = () => {
    switch (classificationType) {
      case "planet":
        return planetClassificationOptions;
      case "roverImg":
        return roverImgClassificationOptions;
      case "cloud":
        return [
          ...cloudClassificationOptionsOne,
          ...cloudClassificationOptionsTwo,
          ...cloudClassificationOptionsThree,
        ];
      case "zoodex-burrowingOwl":
        return zoodexBurrowingOwlClassificationOptions;
      case "zoodex-iguanasFromAbove":
        return zoodexIguanasFromAboveClassificationOptions;
      case "DiskDetective":
        return diskDetectorClassificationOptions;
      case "telescope-minorPlanet":
        return DailyMinorPlanetOptions;
      case "automaton-aiForMars":
        return automatonaiForMarsOptions;
      default:
        return [];
    }
  };

  const renderClassificationOptions = () => {
    if (!classificationConfig?.classificationOptions) {
      return null;
    }

    const selectedOptions = classificationConfig.classificationOptions || {};
    const options = getClassificationOptions();

    return (
      <div className="mt-4 p-4 border border-secondary rounded">
        <h3 className="text-lg font-bold">Classification Options</h3>
        <ul className="list-none">
          {options.map((option) => {
            const isSelected = selectedOptions[option.id] || false;
            const optionColor = isSelected ? "bg-green-200" : "bg-red-200";
            return (
              <li key={option.id} className={`p-2 rounded ${optionColor}`}>
                {option.text}
              </li>
            );
          })}
        </ul>
      </div>
    );
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
        <div className="mb-4">
          <Badge variant="secondary" className="mr-2">{category}</Badge>
          {/* {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="mr-2">{tag}</Badge>
          ))} */}
        </div>
        <p>{content}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Media ${index + 1}`}
              className="w-full h-auto max-w-xs object-cover"
            />
          ))}
        </div>
        {/* {classificationConfig && renderClassificationOptions()} */}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Button onClick={handleVoteClick} size="sm">
          <ThumbsUp className="mr-2" /> {voteCount}
        </Button>
        <Button size="sm">
          <MessageSquare className="mr-2" /> {comments.length}
        </Button>
      </CardFooter>
      {commentStatus !== false && (
        <>
          <CardContent>
            {loadingComments ? (
              <p>Loading comments...</p>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <CommentCard key={comment.id} {...comment} />
              ))
            ) : (
              <p>No comments yet.</p>
            )}
          </CardContent>
          <CardFooter>
            <CommentForm
              classificationId={classificationId}
              onCommentAdded={handleCommentAdded}
            />
          </CardFooter>
        </>
      )}
    </Card>
  );
};