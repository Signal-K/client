"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Calculator, ChevronDown, MessageSquare, Send, Share2, ThumbsUp, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import html2canvas from "html2canvas"
import { AvatarGenerator } from "@/components/Account/Avatar"
import { PostCardSingleProps, CommentProps } from "./PostSingle"
import SurveyorCalculator from "./Surveyor/CalculatorSurveyor"

export default function PostCard({
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
    const session = useSession();

    // Post content
    const [comments, setComments] = useState<CommentProps[]>([]);
    const [newComment, setNewComment] = useState<string>("");

    const [voteCount, setVoteCount] = useState(votes);
    const [isSharing, setIsSharing] = useState<boolean>(false);
    const shareCardRef = useRef<HTMLDivElement>(null);

    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>();

    const fetchComments = async () => {
      setLoading(true);
      try {
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("id, content, created_at, author, classification_id")
          .eq("classification_id", classificationId)
          .order("created_at", { ascending: false });

        if (commentsError) throw commentsError;

        // Fetch usernames from profiles
        const authorIds = [...new Set(commentsData.map((c) => c.author))];
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", authorIds);

        if (profilesError) throw profilesError;

        // Map usernames to comments
        const profileMap = Object.fromEntries(profilesData.map((p) => [p.id, p.username]));
        const enrichedComments = commentsData.map((comment) => ({
          ...comment,
          username: profileMap[comment.author] || "Unknown",
        }));

        setComments(enrichedComments);
      } catch (error: any) {
        setError("Error fetching comments.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const handleVoteClick = async () => {
        if (!session) {
            return;
        };

        try {
            const { error } = await supabase
                .from("votes")
                .insert([
                    {
                        user_id: session.user.id,
                        classification_id: classificationId,
                        anomaly_id: anomalyId,
                    },
                ]);

            if (error) {
                console.error("Error inserting vote: ", error);
                return;
            };

            setVoteCount((prev) => prev + 1);
        } catch (error: any) {
            console.error("Error handling vote: ", error);
        };

        if (onVote) onVote();
    };

    useEffect(() => {
      fetchComments();
    }, []);

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            return;
        };

        try {
            const { error } = await supabase
                .from("comments")
                .insert([
                    {
                        content: newComment,
                        classification_id: classificationId,
                        author: session?.user.id,
                    },
                ]);

            if (error) {
                throw error
            };

            setNewComment("");
            fetchComments();
        } catch (error: any) {
            console.error("Error adding comment: ", error);
        };
    };

    const [currentIndex, setCurrentIndex] = React.useState(0);

    // For sharing
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const handleCopyLink = () => {
        const link = `https://starsailors.space/posts/${classificationId}`;
        navigator.clipboard.writeText(link).then(() => {
            alert("Link to post copied to clipboard!");
        });
    };

    const openPostInNewTab = () => {
        window.open(`/posts/${classificationId}`, "_blank");
    };

    const handleShare = async () => {
        if (!shareCardRef.current) {
            return;
        };

        setIsSharing(true);
        const safeTitle = title || 'Classification';

        // Ensure all images in the classification are loaded
        const images = Array.from(shareCardRef.current.querySelectorAll('img'));
        const imagePromises = images.map((img: HTMLImageElement) =>
            new Promise<void>(( resolve, reject ) => {
                if (img.complete) {
                    resolve();
                } else {
                    img.onload = () => resolve();
                    img.onerror = () => reject(new Error("Image failed to load."));
                };
            })
        );

        try {
            await Promise.all(imagePromises);

            const canvas = await html2canvas(shareCardRef.current, {
                useCORS: true,
                scrollX: 0,
                scrollY: -window.scrollY,
            });

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `${safeTitle.toLowerCase().replace(/\s+/g, "-")}-share.png`;
                        link.click();
                    }
                },
                'image/png',
                1.0
            );
        } catch (error: any) {
            console.error("Error sharing post: ", error);
        } finally {
            setIsSharing(false);
        };
    };
  
return (
  <div className="bg-white" ref={shareCardRef}>
    <Card className="w-full overflow-hidden border border-gray-300">
      <div className="bg-gray-50 p-4">
        <CardHeader className="flex flex-row items-center gap-3 p-4 border-b border-gray-200">
          {session && <AvatarGenerator author={session?.user?.id} />}
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-800">{session?.user.id}</p>
            <p className="text-xs text-green-600">{classificationType.toUpperCase()} Classification</p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div
            className="relative aspect-[16/9] overflow-hidden bg-white cursor-pointer"
            onClick={() => setIsLightboxOpen(true)}
          >
            {images.length > 0 && (
              <Image
                src={images[currentIndex]}
                alt={`Image ${currentIndex + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                sizes="100vw"
              />
            )}
          </div>
          <div className="p-4 space-y-2 bg-gradient-to-b from-gray-50 to-white">
            <p className="text-sm text-gray-800">{content}</p>
          </div>
        </CardContent>

        <CardFooter className="p-3 pt-0 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-700 hover:text-green-600 hover:bg-gray-100"
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            <span className="text-xs">{votes}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-700 hover:text-green-600 hover:bg-gray-100"
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span className="text-xs">{comments.length}</span>
            <ChevronDown
              className={`h-3 w-3 ml-1 transition-transform ${isCommentsOpen ? "rotate-180" : ""}`}
            />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                disabled={isSharing}
                variant="outline"
                className="flex items-center gap-2 bg-white border-gray-300 text-gray-800 hover:bg-gray-100"
              >
                <Share2 className="h-4 w-4" />
                {isSharing ? "Sharing..." : "Share"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 bg-white border-gray-300 text-gray-800">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Share this post</h4>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                  >
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                  >
                    Share to Research Network
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    disabled={isSharing}
                    className="justify-start bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
                  >
                    Export Citation
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </CardFooter>

        {isCommentsOpen && (
          <div className="border-t border-gray-200 bg-white">
            <Tabs defaultValue="comments" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white rounded-none border-b border-gray-200">
                <TabsTrigger
                  value="comments"
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-white text-gray-700"
                >
                  Comments & Stats
                </TabsTrigger>
                {classificationType === "planet" && (
                  <TabsTrigger
                    value="calculator"
                    className="data-[state=active]:bg-green-500 data-[state=active]:text-white text-gray-700"
                  >
                    Calculate Stats
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="comments" className="p-4 space-y-4">
                {loading ? (
                  <p className="text-gray-600">Loading comments...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : comments.length === 0 ? (
                  <p className="text-gray-500">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 border border-green-500">
                        <AvatarFallback className="bg-white text-gray-800 text-xs">
                          {comment.username ? comment.username[0].toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-800">{comment.username}</p>
                          <span className="text-xs text-gray-500">
                            {/* Time formatting */}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="calculator" className="p-4 space-y-4">
                <SurveyorCalculator classificationId={classificationId.toString()} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
          <DialogContent className="max-w-4xl bg-white border-gray-300 text-gray-800">
            <DialogHeader className="flex flex-row justify-between items-center">
              <DialogTitle className="text-gray-800">
                {content} by {session?.user.id}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLightboxOpen(false)}
                className="text-gray-800 hover:text-green-600 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <div className="relative aspect-video w-full">
              <Image
                src={images[currentIndex]}
                alt=""
                fill
                className="object-contain"
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            </div>
            <div className="text-sm text-gray-800">
              <p className="font-medium">{content}</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  </div>
);
};