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

    const [calculatorInputs, setCalculatorInputs] = useState({ input1: "", input2: "" })
    const [calculatorResult, setCalculatorResult] = useState("")
    const [selectedCalculator, setSelectedCalculator] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>();
  
    const calculatePlanetRadius = (stellarRadius: string, fluxDifferential: string) => {
      const R_star = Number.parseFloat(stellarRadius);
      const F_planet = Number.parseFloat(fluxDifferential);
    
      if (isNaN(R_star) || isNaN(F_planet) || F_planet <= 0) {
        return { radius: "", planetType: "" };
      };
    
      const radius = R_star * Math.sqrt(F_planet);
      const planetType = radius > 2.4 ? "Gaseous" : "Terrestrial";
    
      return { radius: radius.toFixed(2), planetType };
    };
    
    const handleRadiusInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setRadiusInputs((prev) => ({
        ...prev,
        [`${classificationId}-1`]: value,
      }));
    
      const { radius, planetType } = calculatePlanetRadius(value, "1");
      setRadiusInputs((prev) => ({
        ...prev,
        [`${classificationId}-2`]: radius,
        [`${classificationId}-3`]: planetType,
      }));
    };

    const handlePeriodInputChange = ( e: React.ChangeEvent<HTMLTextAreaElement> ) => {
        const value = e.target.value;
        setPeriodInputs((prev) => ({
            ...prev,
            [`${classificationId}-1`]: value,
        }));

        const period = calculatePlanetTemperature("1", value);
        setPeriodInputs((prev) => ({
            ...prev,
            [`${classificationId}-2`]: period,
        }));
    };
      
    const calculatePlanetTemperature = (starTemp: string, period: string) => {
        const T_star = Number.parseFloat(starTemp);
        const P = Number.parseFloat(period);
      
        if (isNaN(T_star) || isNaN(P) || P <= 0) {
          return "Invalid input";
        };
      
        return (T_star * Math.pow(P, -0.5)).toFixed(2);
    };      

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

  const [temperatureInputs, setTemperatureInputs] = useState<Record<string, string>>({});  
  const [densityInputs, setDensityInputs] = useState<Record<string, string>>({});
  const [radiusInputs, setRadiusInputs] = useState<Record<string, string>>({});
  const [periodInputs, setPeriodInputs] = useState<Record<string, string>>({});

  const handleAddRadiusComment = async () => {
    const radiusInput1 = radiusInputs[`${classificationId}-1`];
    const radiusInput2 = radiusInputs[`${classificationId}-2`];
    const radiusInput3 = radiusInputs[`${classificationId}-3`];
  
    if (!radiusInput1?.trim() || !radiusInput2?.trim()) {
      console.error("Both text areas must be filled");
      return;
    }
  
    try {
      const { error } = await supabase
        .from("comments")
        .insert([
          {
            content: radiusInput1,
            classification_id: classificationId,
            author: session?.user.id,
            configuration: { planetType: radiusInput3, radius: radiusInput2 },
            surveyor: "TRUE",
            category: "PlanetType",
            value: radiusInput3,
          },
        ]);
  
      if (error) {
        throw error;
      }
  
      setRadiusInputs((prev) => ({
        ...prev,
        [`${classificationId}-1`]: "",
        [`${classificationId}-2`]: "",
        [`${classificationId}-3`]: "",
      }));
  
      fetchComments();
    } catch (error: any) {
      console.error("Error inserting comment: ", error);
    }
  };

  const handleAddTemperatureComment = async () => {
    const temperatureInput1 = temperatureInputs[`${classificationId}-1`];
    const temperatureInput2 = temperatureInputs[`${classificationId}-2`];

    if (!temperatureInput1?.trim() || !temperatureInput2?.trim()) {
      console.error("Both text areas must be filled");
      return;
    };

    try {
      const { error } = await supabase
        .from("comments")
        .insert([
          {
            content: `${temperatureInput1}\n\n${temperatureInput2}`,
            classification_id: classificationId,
            author: session?.user?.id,
            configuration: { temperature: `${temperatureInput2}` },
            surveyor: "TRUE",
            value: temperatureInput2,
            category: 'Temperature'
          },
        ]);

      if (error) throw error;

      setTemperatureInputs((prev) => ({
        ...prev,
        [`${classificationId}-1`]: "",
        [`${classificationId}-2`]: "",
      }));
      fetchComments();
    } catch (error) {
      console.error("Error adding temperature comment:", error);
    };
  };

  const handleAddPeriodComment = async () => {
    const periodInput1 = periodInputs[`${classificationId}-1`];
    const periodInput2 = periodInputs[`${classificationId}-2`];

    try {
        const { error } = await supabase
            .from("comments")
            .insert([
                {
                    content: `${periodInput1}`,
                    classification_id: classificationId,
                    author: session?.user?.id,
                    configuration: {
                        period: `${periodInput1}`,
                    },
                    surveyor: "TRUE",
                    value: periodInput1,
                    category: "OrbitalPeriod",
                },
            ]);

        if (error) {
            throw error;
        };

        setPeriodInputs((prev) => ({
            ...prev,
            [`${classificationId}-1`]: "",
            [`${classificationId}-2`]: "",
        }));
        fetchComments();
    } catch (error: any) {
        console.error("Error inserting comment: ", error);
    };
};

  const handleAddDensityComment = async () => {
    const densityInput1 = densityInputs[`${classificationId}-1`];
    const densityInput2 = densityInputs[`${classificationId}-2`];
  
    if (!densityInput1?.trim() || !densityInput2?.trim()) {
      console.error("Both text areas must be filled");
      return;
    }
  
    try {
      const { error } = await supabase
        .from("comments")
        .insert([
          {
            content: `${densityInput1}\n\n${densityInput2}`,
            classification_id: classificationId,
            author: session?.user?.id,
            configuration: { density: `${densityInput1}, ${densityInput2}` },
            surveyor: "TRUE",
            value: densityInput2,
            category: "Density",
          },
        ]);
  
      if (error) throw error;
  
      setDensityInputs((prev) => ({
        ...prev,
        [`${classificationId}-1`]: "",
        [`${classificationId}-2`]: "",
      }));
  
      fetchComments();
    } catch (error) {
      console.error("Error adding density comment:", error);
    };
  };  

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
        <div className="bg-[#9d22bf]" ref={shareCardRef}>
            <Card className="w-full overflow-hidden border-2 border-[#5FCBC3]/30 bg-[#hhhhhh]">
              <div className="bg-[#9d22bf] p-4">
                <CardHeader className="flex flex-row items-center gap-3 p-4 border-b border-[#5FCBC3]/20">
                    {session && <AvatarGenerator author={session?.user?.id} />}
                    <div className="flex flex-col">
                        <p className="text-sm font-medium text-[#F7F5E9]">{session?.user.id}</p>
                        <p className="text-xs text-[#B9E678]">{classificationType.toUpperCase()} Classification</p>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div
                        className="relative aspect-[16/9] overflow-hidden bg-[#1e2834] cursor-pointer"
                        onClick={() => setIsLightboxOpen(true)}
                    >
                        {images.length > 0 && (
                            <>
                                <Image
                                    src={images[currentIndex]}
                                    alt={`Image ${currentIndex + 1}`}
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                    sizes='100vw'
                                />
                            </>
                        )}
                    </div>
                    <div className="p-4 space-y-2 bg-gradient-to-b from-[#2C3A4A] to-[#1e2834]">
                        <p className="text-sm text-[#F7F5E9]">
                            {content}
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="p-3 pt-0 flex justify-between">
                <Button variant="ghost" size="sm" className="text-[#F7F5E9] hover:text-[#B9E678] hover:bg-[#1e2834]">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    <span className="text-xs">{votes}</span>
                </Button>
        
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#F7F5E9] hover:text-[#B9E678] hover:bg-[#1e2834]"
                    onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span className="text-xs">{comments.length}</span>
                    <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${isCommentsOpen ? "rotate-180" : ""}`} />
                </Button>
        
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        size="sm"
                        disabled={isSharing}
                        variant="outline"
                        className="flex items-center gap-2 bg-[#2C3A4A] border-[#5FCBC3]/30 text-[#F7F5E9] hover:bg-[#1e2834]"
                    >
                        <Share2 className="h-4 w-4" />
                        {isSharing ? "Sharing..." : "Share"}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60 bg-[#2C3A4A] border-[#5FCBC3]/30 text-[#F7F5E9]">
                    <div className="space-y-2">
                        <h4 className="font-medium text-sm">Share this post</h4>
                        <div className="flex flex-col gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="justify-start bg-[#2C3A4A] text-[#F7F5E9] border-[#5FCBC3]/30 hover:bg-[#1e2834]"
                        >
                            Copy Link
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="justify-start bg-[#2C3A4A] text-[#F7F5E9] border-[#5FCBC3]/30 hover:bg-[#1e2834]"
                        >
                            Share to Research Network
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShare}
                            disabled={isSharing}
                            className="justify-start bg-[#2C3A4A] text-[#F7F5E9] border-[#5FCBC3]/30 hover:bg-[#1e2834]"
                        >
                            Export Citation
                        </Button>
                        </div>
                    </div>
                    </PopoverContent>
                </Popover>
                </CardFooter>
      {isCommentsOpen && (
        <div className="border-t border-[#5FCBC3]/20 bg-[#1e2834]/50">
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#1e2834] rounded-none border-b border-[#5FCBC3]/20">
              <TabsTrigger
                value="comments"
                className="data-[state=active]:bg-[#5FCBC3] data-[state=active]:text-[#2C3A4A] text-[#F7F5E9]"
              >
                Comments & Stats
              </TabsTrigger>
              {classificationType === 'planet' && (
                <TabsTrigger
                value="calculator"
                className="data-[state=active]:bg-[#5FCBC3] data-[state=active]:text-[#2C3A4A] text-[#F7F5E9]"
              >
                Calculate Stats
              </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="comments" className="p-4 space-y-4">
                        <div className="p-4 space-y-4">
                {loading ? (
                  <p>Loading comments...</p>
                ) : error ? ( 
                  <p className="text-red-500">{error}</p>
                ) : comments.length === 0 ? (
                  <p>No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 border border-[#B9E678]">
                        <AvatarFallback className="bg-[#1e2834] text-[#F7F5E9] text-xs">
                          {comment.username ? comment.username[0].toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-[#F7F5E9]">{comment.username}</p>
                          <span className="text-xs text-[#F7F5E9]/70">
                            {/* {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })} */}
                          </span>
                        </div>
                        <p className="text-sm text-[#F7F5E9] mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
                </div>
            </TabsContent>
            <TabsContent value="calculator" className="p-4 space-y-4">
              <div className="space-y-4">
                <div className="bg-[#2C3A4A] p-3 rounded-md border border-[#5FCBC3]/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="h-4 w-4 text-[#B9E678]" />
                    <h4 className="text-sm font-medium text-black">Planet Calculator</h4>
                  </div>

                  <div className="space-y-3">
                    <Select
                      value={selectedCalculator}
                      onValueChange={(val) => setSelectedCalculator(val as "radius" | "temperature" | 'period')}
                    >
                      <SelectTrigger className="bg-[#1e2834] border-[#5FCBC3]/30 text-black">
                        <SelectValue placeholder="Select calculator" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#2C3A4A] border-[#5FCBC3]/30 text-black">
                        <SelectItem value="radius" className="focus:bg-[#1e2834] focus:text-black">
                          Planet Radius
                        </SelectItem>
                        <SelectItem value="temperature" className="focus:bg-[#1e2834] focus:text-black">
                          Planet Temperature
                        </SelectItem>
                        <SelectItem value="period" className="focus:bg-[#1e2834] focus:text-black">
                          Planet Orbital Period
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs text-black/70">
                          {selectedCalculator === "radius" ? "Stellar Radius (R☉)" : "Star Temperature (K)"}
                        </label>
                        <Input
                          value={calculatorInputs.input1}
                          onChange={(e) => setCalculatorInputs({ ...calculatorInputs, input1: e.target.value })}
                          className="bg-[#1e2834] border-[#5FCBC3]/30 text-black h-8"
                          type="number"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-black/70">
                          {selectedCalculator === "radius" ? "Flux Differential" : "Orbital Period (Days)"}
                        </label>
                        <Input
                          value={calculatorInputs.input2}
                          onChange={(e) => setCalculatorInputs({ ...calculatorInputs, input2: e.target.value })}
                          className="bg-[#1e2834] border-[#5FCBC3]/30 text-black h-8"
                          type="number"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        if (selectedCalculator === "radius") {
                          const result = calculatePlanetRadius(calculatorInputs.input1, calculatorInputs.input2);
                          setCalculatorResult(result.radius); 
                          setRadiusInputs((prev) => ({
                            ...prev,
                            [`${classificationId}-2`]: result.radius, 
                            [`${classificationId}-3`]: result.planetType, 
                          }));
                        } else {
                          const result = calculatePlanetTemperature(calculatorInputs.input1, calculatorInputs.input2);
                          setCalculatorResult(result);
                        }
                      }}
                      className="w-full bg-[#5FCBC3] text-[#2C3A4A] hover:bg-[#5FCBC3]/90"
                    >
                      Calculate
                    </Button>


                    <div className="bg-[#1e2834] p-2 rounded border border-[#5FCBC3]/20 flex justify-between items-center">
                      <span className="text-xs text-[#F7F5E9]/70">Result:</span>
                      <span className="text-sm font-medium text-[#2C3A4A] font-mono">{calculatorResult || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
  {selectedCalculator === "temperature" ? (
    <>
      <Textarea
        placeholder="Observations"
        className="bg-[#2C3A4A] border-[#5FCBC3]/30 text-[#2C3A4A] min-h-[80px]"
        value={temperatureInputs[`${classificationId}-1`] || ""}
        onChange={(e) =>
          setTemperatureInputs((prev) => ({
            ...prev,
            [`${classificationId}-1`]: e.target.value,
          }))
        }
      />
      <Textarea
        placeholder="Value"
        className="bg-[#2C3A4A] border-[#5FCBC3]/30 text-[#2C3A4A] min-h-[80px]"
        value={temperatureInputs[`${classificationId}-2`] || ""}
        onChange={(e) =>
          setTemperatureInputs((prev) => ({
            ...prev,
            [`${classificationId}-2`]: e.target.value,
          }))
        }
      />
    </>
  ) : selectedCalculator === "radius" ? (
    <>
      <Textarea
        placeholder="Enter Planet Radius (pR☉)..."
        className="bg-[#2C3A4A] border-[#5FCBC3]/30 text-[#2C3A4A] min-h-[80px]"
        value={radiusInputs[`${classificationId}-1`] || ""}
        onChange={handleRadiusInputChange}
      />
      <Textarea
        placeholder="Calculated Planet Radius"
        className="bg-[#2C3A4A] border-[#5FCBC3]/30 text-[#2C3A4A] min-h-[80px] opacity-50"
        value={radiusInputs[`${classificationId}-2`] || ""}
        readOnly
      />
      <Textarea
        placeholder="Determined Planet Type"
        className="bg-[#2C3A4A] border-[#5FCBC3]/30 text-[#2C3A4A] min-h-[80px] opacity-50"
        value={radiusInputs[`${classificationId}-3`] || ""}
        readOnly
      />
    </>
  ) : selectedCalculator ==='period' ? (
    <>
      <Textarea
        placeholder="General period discussion points."
        className="bg-[#2C3A4A] border-[#5FCBC3]/30 text-[#2C3A4A] min-h-[80px]"
        value={periodInputs[`${classificationId}-1`] || ""}
        onChange={handlePeriodInputChange}
      />
    </>
  ) : (
    <Textarea
      placeholder="Share your analysis or findings..."
      className="bg-[#2C3A4A] border-[#2C3A4A]/30 text-[#2C3A4A] min-h-[80px]"
      value={newComment}
      onChange={(e) => setNewComment(e.target.value)}
    />
  )}
  <div className="flex justify-end">
    <Button
      onClick={
        selectedCalculator === "temperature"
          ? handleAddTemperatureComment
          : selectedCalculator === "radius"
          ? handleAddRadiusComment
          : selectedCalculator === 'period'
          ? handleAddPeriodComment
          : handleAddComment
      }
      className="bg-[#5FCBC3] text-[#2C3A4A] hover:bg-[#5FCBC3]/90"
    >
      Post Analysis {selectedCalculator}
    </Button>
  </div>
</div>

              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Image Lightbox */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="max-w-4xl bg-[#2C3A4A] border-[#5FCBC3]/30 text-[#F7F5E9]">
          <DialogHeader className="flex flex-row justify-between items-center">
            <DialogTitle className="text-[#F7F5E9]">{content} by {session?.user.id}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsLightboxOpen(false)}
              className="text-[#F7F5E9] hover:text-[#B9E678] hover:bg-[#1e2834]"
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
          <div className="text-sm text-[#F7F5E9]">
            <p className="font-medium">{content}</p>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </Card>
    </div>
  );
};