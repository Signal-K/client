import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CommentCard } from "../Comments/CommentSingle";
import { CommentForm } from "../Comments/CommentForm";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

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
    }
    setVoteCount((prevCount) => prevCount + 1);
  };

  const handleCommentAdded = () => {
    fetchComments();
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
  
    try {
      // Ensure title is a valid string
      const sanitizedTitle = title?.replace(/\s+/g, "_") || "Post_Title";
  
      // Create a canvas element
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
  
      if (!context) throw new Error("Canvas not supported");
  
      // Set canvas dimensions
      const card = cardRef.current;
      const { width, height } = card.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
  
      // Render the DOM element
      context.fillStyle = window.getComputedStyle(card).backgroundColor || "#fff";
      context.fillRect(0, 0, width, height);
  
      // Draw text content
      const drawText = (text: string, x: number, y: number, font: string, color: string) => {
        context.font = font;
        context.fillStyle = color;
        context.fillText(text, x, y);
      };
  
      drawText(sanitizedTitle, 20, 40, "20px Arial", "#000"); // Title
      drawText(`by ${author}`, 20, 70, "16px Arial", "#555"); // Author
      drawText(content, 20, 100, "14px Arial", "#333"); // Content
  
      // Optionally, render other elements like images, badges, etc.
      if (images.length > 0) {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Add this line to handle CORS
        img.src = images[currentImageIndex];
  
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            context.drawImage(img, 20, 120, 200, 200); // Adjust image position and size
            resolve();
          };
          img.onerror = reject; // Handle any errors with the image loading
        });
      }
  
      // Convert canvas to an image and download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${sanitizedTitle}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };  

  return (
    <Card
      ref={cardRef}
      className="w-full max-w-2xl mx-auto my-8 bg-card text-card-foreground border-primary"
    >
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
        </div>
        <p>{content}</p>

        {images.length > 0 && (
          <div className="relative w-full">
            <img
              src={images[currentImageIndex]}
              alt={`Media ${currentImageIndex + 1}`}
              className="w-full h-auto object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-gray-600 rounded-full"
                >
                  ❮
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-gray-600 rounded-full"
                >
                  ❯
                </button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((_, index) => (
                    <span
                      key={index}
                      className={`h-2 w-2 rounded-full ${
                        index === currentImageIndex ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
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
        <Button onClick={handleShare} size="sm" variant="outline">
          <Share2 className="mr-2" /> Share
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