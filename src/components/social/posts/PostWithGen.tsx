"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { ThumbsUp, MessageSquare, FeatherIcon, PencilLineIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { useSession } from "@/src/lib/auth/session-context";
import { CommentCard } from "../comments/CommentSingle";

import CloudSignal from "@/src/components/deployment/missions/structures/Meteorologists/Cloudspotting/CloudSignal";
// import { PlanetGenerator } from "@/src/components/discovery/data-sources/Astronomers/PlanetHunters/PlanetGenerator";
// import AsteroidViewer from "@/src/components/discovery/data-sources/Astronomers/DailyMinorPlanet/asteroid-viewer";
// import CloudClassifier from "@/src/components/discovery/data-sources/Meteorologists/JVH/cloud-classifier";
// import { PlanetScene } from "@/src/components/discovery/data-sources/Astronomers/PlanetHunters/V2/planet-scene";
// import { FullPlanetGenerator } from "@/src/components/discovery/data-sources/Astronomers/PlanetHunters/V2/full-planet-generator";
import Link from "next/link";
import { Textarea } from "@/src/components/ui/textarea";
import { SurveyorComments } from "./Surveyor/SurveyorPostCard";

interface CommentProps {
  id: number;
  author: string;
  content: string;
  created_at: string;
  isSurveyor?: boolean;
  configuration?: {
    planetType?: string;
  };
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
  biome?: string;
  toggle?: boolean;
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
  biome,
  images,
  classificationType,
  commentStatus,
  toggle,
  onVote,
}: PostCardSingleProps) {
  const session = useSession();

  const [comments, setComments] = useState<CommentProps[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(true);
  const [voteCount, setVoteCount] = useState(votes);
  const [showGeneratorOnly, setShowGeneratorOnly] = useState<boolean>(!!toggle);

  useEffect(() => {
    fetchComments();
  }, [classificationId]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await fetch(
        `/api/gameplay/social/comments?classificationId=${classificationId}&order=desc`,
        { cache: "no-store" }
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload?.comments) throw new Error(payload?.error || "Failed to fetch comments");
      setComments(payload.comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleVoteClick = async () => {
    if (!session) return;

    try {
      const response = await fetch("/api/gameplay/social/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classificationId,
          anomalyId,
          voteType: "up",
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error("Error inserting vote:", result?.error);
        return;
      }
      if (result?.alreadyVoted) {
        return;
      }

      setVoteCount((prev) => prev + 1);
    } catch (error) {
      console.error('Error inserting vote: ', error);
    }

    if (onVote) onVote();
  };

  const renderDynamicComponent = () => {
    switch (classificationType) {
      case "cloud":
        return <CloudSignal classificationConfig={classificationConfig} classificationId={String(classificationId)} />
      case "planet":
        return (
          <></>
          // <PlanetGenerator
          //   classificationId={String(classificationId)}
          //   classificationConfig={classificationConfig}
          //   author={author}
          //   biome={biome}
          // />
          // <SimplePlanetGenerator

          //   classificationId={String(classificationId)}
          //   classificationConfig={classificationConfig}
          //   author={author}
          //   />
        );
      // case "telescope-minorPlanet":
      //   return <AsteroidViewer classificationId={String(classificationId)} classificationConfig={classificationConfig} />;
      // case "lidar-jovianVortexHunter":
      //   return <CloudClassifier classificationId={String(classificationId)} classificationConfig={classificationConfig} />;
      default:
        return (
          <div>
            {loadingComments ? (
              <p>Loading comments...</p>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  id={comment.id}
                  author={comment.author}
                  classificationId={classificationId}
                  content={comment.content}
                  createdAt={comment.created_at}
                  replyCount={0}
                  parentCommentId={classificationId}
                  isSurveyor={false}
                />
              ))
            ) : (
              <p>No comments yet. Be the first to comment!</p>
            )}
          </div>
        );
    }
  };

  if (showGeneratorOnly) {
    return (
      <div className="w-full max-w-2xl mx-auto my-8">
        <div className="flex justify-end mb-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowGeneratorOnly(false)}
          >
            <EyeIcon className="w-4 h-4 mr-1" /> Show Full Post
          </Button>
        </div>
        {renderDynamicComponent()}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 bg-card text-card-foreground border-primary">
      <CardHeader>
        <div className="flex items-start justify-between">
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
          <Button size="icon" variant="ghost" onClick={() => setShowGeneratorOnly(true)}>
            <EyeOffIcon className="w-5 h-5" />
          </Button>
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
        {renderDynamicComponent()}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Button onClick={handleVoteClick} size="sm">
          <ThumbsUp className="mr-2" /> {voteCount}
        </Button>
        <Button size="sm">
          <MessageSquare className="mr-2" /> {comments.length}
        </Button>
        <Link href={`/planets/edit/${classificationId}`}>
          <Button size="sm">
            <FeatherIcon className="text-green-500" /> Edit
          </Button>
        </Link>
        <Link href={`/posts/${classificationId}`}>
          <Button size="sm">
            <PencilLineIcon className="text-green-500" /> Expand
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export function PostCardSingleWithGeneratorEditMode({
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
  // commentStatus,
  onVote,
}: PostCardSingleProps) {
  const session = useSession();

  const [comments, setComments] = useState<CommentProps[]>([]);
  const [loadingComments, setLoadingComments] = useState<boolean>(true);
  const [voteCount, setVoteCount] = useState(votes);
  const [showStats, setShowStats] = useState(false);
  const [commentStatus, setCommentStatus] = useState<boolean>(false);
  const [newComment, setNewComment] = useState<string>("");
  const [surveyorComments, setSurveyorComments] = useState<any[]>([]);
  const [nonSurveyorComments, setNonSurveyorComments] = useState<any[]>([]);

  useEffect(() => {
    fetchComments();
  }, [classificationId]);

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await fetch(
        `/api/gameplay/social/comments?classificationId=${classificationId}&order=desc`,
        { cache: "no-store" }
      );
      const payload = await response.json().catch(() => null);
      const data = payload?.comments;
      if (!response.ok || !Array.isArray(data)) throw new Error(payload?.error || "Failed to fetch comments");

      if (
        classificationConfig?.classificationType === "telescope-minorPlanet" ||
        classificationConfig?.classificationType === "planet"
      ) {
        const surveyor = data.filter((comment: any) => comment.surveyor);
        const nonSurveyor = data.filter((comment: any) => !comment.surveyor);
        setSurveyorComments(surveyor);
        setNonSurveyorComments(nonSurveyor);
      }

      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    };
  };

  const handleVoteClick = () => {
    if (onVote) onVote();
    setVoteCount((prev) => prev + 1);
  };

    const [currentIndex, setCurrentIndex] = React.useState(0);
  
    const goToNextImage = () => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };
  
    const goToPreviousImage = () => {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? images.length - 1 : prevIndex - 1
      );
    };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch("/api/gameplay/social/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newComment,
          classificationId,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.error || "Failed to add comment");

      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    };
  };

  const renderDynamicComponent = () => {
    switch (classificationType) {
      case "cloud":
        return <CloudSignal
          classificationConfig={classificationConfig}
          classificationId={String(classificationId)} 
        />

        case "planet":
          return (
            <>
              {/* {session?.user?.id === author && (
                // <PlanetGenerator classificationId={""} author={""}                  // classificationId={String(classificationId)} 
                
                  // classificationConfig={classificationConfig}
                  // author={author}
                /> */}
                        {/* //   // <FullPlanetGenerator /> --> we need to be able to pass the stats in, too (as a prop) */}
              {/* )} */}
              {session?.user?.id !== author && (
                // <SimplePlanetGenerator
                //   classificationId={String(classificationId)}
                //   classificationConfig={classificationConfig}
                //   author={author}
                // <PlanetGenerator classificationId={""} author={""}                />
                <></>
                // <FullPlanetGeneratorNoControl />
              )}
            </>
          );
      // case "telescope-minorPlanet":
      //   return <AsteroidViewer 
      //     classificationId={String(classificationId)} 
      //     classificationConfig={classificationConfig}
      //   />;
      // case "lidar-jovianVortexHunter":
      //   return <CloudClassifier
      //     classificationId={String(classificationId)} 
      //     classificationConfig={classificationConfig}
      //   />;
      default:
        return (
          <div>
            {loadingComments ? (
              <p>Loading comments...</p>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  id={comment.id}
                  author={comment.author}
                  classificationId={classificationId}
                  content={comment.content}
                  createdAt={comment.created_at}
                  replyCount={0}
                  parentCommentId={classificationId}
                  isSurveyor={false}
                />
              ))
            ) : (
              <p>No comments yet. Be the first to comment!</p>
            )}
          </div>
        );
    };
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div className="relative col-span-1">
                        <img
                          src={images[currentIndex]}
                          alt={`Image ${currentIndex + 1}`}
                          className="rounded-lg w-full h-auto"
                        />
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={goToPreviousImage}
                              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2"
                            >
                              &#8592;
                            </button>
                            <button
                              onClick={goToNextImage}
                              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2"
                            >
                              &#8594;
                            </button>
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                              {images.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setCurrentIndex(index)}
                                  className={`h-2 w-2 rounded-full ${
                                    currentIndex === index ? "bg-white" : "bg-gray-400"
                                  }`}
                                ></button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
          
                      {/* Grid cell for the PlanetTempCalculator */}
                      {/* {classificationType === 'planet' && (
                        <div className="col-span-1">
                          <PlanetTempCalculator />
                        </div>
                      )} */}
                    </div>
                  )}
        {images.length > 0 && (
          <div>
            <img src={images[0]} alt="Post Image" />
          </div>
        )}
        <p>{images}</p>
        {renderDynamicComponent()}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <Button onClick={handleVoteClick} size="sm">
          <ThumbsUp className="mr-2" /> {voteCount}
        </Button>
        <Button size="sm" onClick={() => setCommentStatus(true)}>
          <MessageSquare className="mr-2" /> {comments.length}
        </Button>
      </CardFooter>
      {commentStatus !== false && (
          <CardContent>
            {!showStats && (
              <div className="space-y-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add your comment..."
                  rows={3}
                  className="w-full"
                />
                <CardFooter className="flex flex-col gap-2">
                  <Button onClick={handleAddComment} className="w-full">
                    Submit Comment
                  </Button>
                  <Button onClick={() => setShowStats(!showStats)} variant="outline">
                    Propose new stats
                  </Button>
                </CardFooter>
              </div>
            )}
            {!showStats ? (
              <div className="mt-4 space-y-2">
                {loadingComments ? (
                  <p>Loading comments...</p>
                ) : comments.length > 0 ? (
                  comments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      id={comment.id}
                      author={comment.author}
                      content={comment.content}
                      createdAt={comment.created_at}
                      replyCount={0}
                      classificationId={classificationId}
                      parentCommentId={classificationId}
                      isSurveyor={comment.isSurveyor}
                    />
                  ))
                ) : (
                  <p>No comments yet. Be the first to comment!</p>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                <SurveyorComments
                  classificationId={classificationId}
                  author={author}
                  anomalyId={anomalyId}
                  classificationConfig={classificationConfig}
                  commentStatus={commentStatus}
                />
              </div>
            )}
          </CardContent>
        )}
    </Card>
  );
};
