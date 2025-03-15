"use client"

import React, { useRef, useState } from "react"
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
    children?: React.ReactNode;
    commentStatus?: boolean;
};

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
    const [loadingComments, setLoadingComments] = useState<boolean>(true);
    const [newComment, setNewComment] = useState<string>("");
    const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});

    const [surveyorComments, setSurveyorComments] = useState<any[]>([]);
    const [nonSurveyorComments, setNonSurveyorComments] = useState<any[]>([]);

    const [voteCount, setVoteCount] = useState(votes);
    const [isSharing, setIsSharing] = useState<boolean>(false);
    const shareCardRef = useRef<HTMLDivElement>(null);

    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [showStats, setShowStats] = useState<boolean>(false);

    const [calculatorInputs, setCalculatorInputs] = useState({ input1: "", input2: "" })
    const [calculatorResult, setCalculatorResult] = useState("")
    const [selectedStat, setSelectedStat] = useState("transit")
  
    const calculatePlanetRadius = (stellarRadius: string, fluxDifferential: string) => {
        const R_star = Number.parseFloat(stellarRadius);
        const F_planet = Number.parseFloat(fluxDifferential);
      
        if (isNaN(R_star) || isNaN(F_planet) || F_planet <= 0) {
          return "Invalid input";
        }
      
        return (R_star * Math.sqrt(F_planet)).toFixed(2);
      };
      
    const calculatePlanetTemperature = (starTemp: string, period: string) => {
        const T_star = Number.parseFloat(starTemp);
        const P = Number.parseFloat(period);
      
        if (isNaN(T_star) || isNaN(P) || P <= 0) {
          return "Invalid input";
        }
      
        return (T_star * Math.pow(P, -0.5)).toFixed(2);
    };      

    const fetchComments = async () => {
        setLoadingComments(true);
        try {
            const { data, error } = await supabase
                .from("comments")
                .select("*")
                .eq("classification_id", classificationId)
                .order('created_at', { ascending: false });

            if (classificationConfig?.classificationType === 'telescope-minorPlanet' || classificationConfig?.classificationType === 'planet') {
                const surveyor = comments.filter((comment) => comment.isSurveyor);
                const nonSurveyor = comments.filter((comment) => !comment.isSurveyor);
                setSurveyorComments(surveyor);
                setNonSurveyorComments(nonSurveyor);
            };

            if (error) {
                throw error;
            };

            setComments(data);
        } catch (error: any) {
            console.error("Error fetching comments: ", error);
        } finally {
            setLoadingComments(false);
        };
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
    
    const goToNextImage = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const goToPreviousImage = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1,
        );
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
        <div className="" ref={shareCardRef}>
            <Card className="w-full overflow-hidden border-2 border-[#5FCBC3]/30 bg-[#2C3A4A] shadow-lg">
                <CardHeader className="flex flex-row items-center gap-3 p-4 border-b border-[#5FCBC3]/20">
                    {/* <Avatar className="h-10 w-10 border-2 border-[#B9E678]">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="bg-[#1e2834] text-[#F7F5E9]">AS</AvatarFallback>
                    </Avatar> */}
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
                                <span className="text-xs text-[#F7F5E9] bg-[#2C3A4A]/70 px-2 py-1 rounded">Click to expand</span>
                            </>
                        )}
                        {/* <Image
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-cMApdWa6w7mhYAXbGn2rLgWQNb4ZHh.png"
                            alt="Stellar temperature graph showing flux variations over time"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-[#5FCBC3]/10 hover:bg-transparent transition-colors duration-300 flex items-center justify-center">
                        <span className="text-xs text-[#F7F5E9] bg-[#2C3A4A]/70 px-2 py-1 rounded">Click to expand</span> */}
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
                        onClick={() => {
                        handleShare()
                        }}
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
        
                {/* Comments Section (Embedded) */}
      {isCommentsOpen && (
        <div className="border-t border-[#5FCBC3]/20 bg-[#1e2834]/50">
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#1e2834] rounded-none border-b border-[#5FCBC3]/20">
              <TabsTrigger
                value="comments"
                className="data-[state=active]:bg-[#5FCBC3] data-[state=active]:text-[#2C3A4A] text-[#F7F5E9]"
              >
                Comments
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="data-[state=active]:bg-[#5FCBC3] data-[state=active]:text-[#2C3A4A] text-[#F7F5E9]"
              >
                Classification
              </TabsTrigger>
              <TabsTrigger
                value="calculator"
                className="data-[state=active]:bg-[#5FCBC3] data-[state=active]:text-[#2C3A4A] text-[#F7F5E9]"
              >
                Calculate Anomaly
              </TabsTrigger>
            </TabsList>

            {/* <TabsContent value="comments" className="p-4 space-y-4">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 border border-[#B9E678]">
                    <AvatarFallback className="bg-[#1e2834] text-[#F7F5E9] text-xs">JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#F7F5E9]">JDoe_Astro</p>
                      <span className="text-xs text-[#F7F5E9]/70">2d ago</span>
                    </div>
                    <p className="text-sm text-[#F7F5E9] mt-1">
                      The periodic dips are consistent with a transiting exoplanet. Have you checked for phase folding?
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 border border-[#B9E678]">
                    <AvatarFallback className="bg-[#1e2834] text-[#F7F5E9] text-xs">SK</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#F7F5E9]">StellarKid</p>
                      <span className="text-xs text-[#F7F5E9]/70">1d ago</span>
                    </div>
                    <p className="text-sm text-[#F7F5E9] mt-1">
                      Could also be stellar activity. The temperature is in the range where we'd expect significant spot
                      coverage.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 border border-[#B9E678]">
                    <AvatarFallback className="bg-[#1e2834] text-[#F7F5E9] text-xs">AS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#F7F5E9]">AstroScientist</p>
                      <span className="text-xs text-[#F7F5E9]/70">12h ago</span>
                    </div>
                    <p className="text-sm text-[#F7F5E9] mt-1">
                      @JDoe_Astro Yes, I've done phase folding and found a potential period of 3.2 days. Working on a
                      follow-up analysis now.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Avatar className="h-8 w-8 border border-[#B9E678]">
                    <AvatarFallback className="bg-[#1e2834] text-[#F7F5E9] text-xs">ME</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex">
                    <Input
                      placeholder="Add a comment..."
                      className="bg-[#2C3A4A] border-[#5FCBC3]/30 text-[#F7F5E9] rounded-r-none"
                    />
                    <Button size="sm" className="rounded-l-none bg-[#5FCBC3] text-[#2C3A4A] hover:bg-[#5FCBC3]/90">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent> */}

            {/* <TabsContent value="stats" className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="bg-[#2C3A4A] p-3 rounded-md border border-[#5FCBC3]/20">
                  <h4 className="text-sm font-medium text-[#F7F5E9]">Classification Results</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#F7F5E9]">Exoplanet Transit</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-[#1e2834] rounded-full overflow-hidden">
                          <div className="h-full bg-[#B9E678]" style={{ width: "68%" }}></div>
                        </div>
                        <span className="text-xs text-[#F7F5E9]">68%</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#F7F5E9]">Stellar Variability</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-[#1e2834] rounded-full overflow-hidden">
                          <div className="h-full bg-[#5FCBC3]" style={{ width: "24%" }}></div>
                        </div>
                        <span className="text-xs text-[#F7F5E9]">24%</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#F7F5E9]">Instrumental Artifact</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-[#1e2834] rounded-full overflow-hidden">
                          <div className="h-full bg-[#F7F5E9]/30" style={{ width: "8%" }}></div>
                        </div>
                        <span className="text-xs text-[#F7F5E9]">8%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#2C3A4A] p-3 rounded-md border border-[#5FCBC3]/20">
                  <h4 className="text-sm font-medium text-[#F7F5E9]">Signal Properties</h4>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-xs text-[#F7F5E9]/70">Period</p>
                      <p className="text-sm text-[#F7F5E9]">3.2 ± 0.1 days</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#F7F5E9]/70">Depth</p>
                      <p className="text-sm text-[#F7F5E9]">0.8% ± 0.1%</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#F7F5E9]/70">Duration</p>
                      <p className="text-sm text-[#F7F5E9]">2.4 ± 0.3 hours</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#F7F5E9]/70">SNR</p>
                      <p className="text-sm text-[#F7F5E9]">12.6</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent> */}

            {/* <TabsContent value="calculator" className="p-4 space-y-4">
      <div className="space-y-4">
        <div className="bg-[#2C3A4A] p-3 rounded-md border border-[#5FCBC3]/20">
          <div className="flex items-center gap-2 mb-3">
            <Calculator className="h-4 w-4 text-[#B9E678]" />
            <h4 className="text-sm font-medium text-[#F7F5E9]">Planet Calculator</h4>
          </div>

          <div className="space-y-3">
            <Select value={selectedCalculator} onValueChange={(val) => setSelectedCalculator(val as "radius" | "temperature")}>
              <SelectTrigger className="bg-[#1e2834] border-[#5FCBC3]/30 text-[#F7F5E9]">
                <SelectValue placeholder="Select calculator" />
              </SelectTrigger>
              <SelectContent className="bg-[#2C3A4A] border-[#5FCBC3]/30 text-[#F7F5E9]">
                <SelectItem value="radius" className="focus:bg-[#1e2834] focus:text-[#F7F5E9]">
                  Planet Radius
                </SelectItem>
                <SelectItem value="temperature" className="focus:bg-[#1e2834] focus:text-[#F7F5E9]">
                  Planet Temperature
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-[#F7F5E9]/70">
                  {selectedCalculator === "radius" ? "Stellar Radius (R☉)" : "Star Temperature (K)"}
                </label>
                <Input
                  value={calculatorInputs.input1}
                  onChange={(e) => setCalculatorInputs({ ...calculatorInputs, input1: e.target.value })}
                  className="bg-[#1e2834] border-[#5FCBC3]/30 text-[#F7F5E9] h-8"
                  type="number"
                  step="0.01"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-[#F7F5E9]/70">
                  {selectedCalculator === "radius" ? "Flux Differential" : "Orbital Period (Days)"}
                </label>
                <Input
                  value={calculatorInputs.input2}
                  onChange={(e) => setCalculatorInputs({ ...calculatorInputs, input2: e.target.value })}
                  className="bg-[#1e2834] border-[#5FCBC3]/30 text-[#F7F5E9] h-8"
                  type="number"
                  step="0.01"
                />
              </div>
            </div>

            <Button
              onClick={selectedCalculator === "radius" ? calculateRadius : calculateTemperature}
              className="w-full bg-[#5FCBC3] text-[#2C3A4A] hover:bg-[#5FCBC3]/90"
            >
              Calculate
            </Button>

            <div className="bg-[#1e2834] p-2 rounded border border-[#5FCBC3]/20 flex justify-between items-center">
              <span className="text-xs text-[#F7F5E9]/70">Result:</span>
              <span className="text-sm font-medium text-[#F7F5E9] font-mono">{calculatorResult || "—"}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Share your analysis or findings..."
            className="bg-[#2C3A4A] border-[#5FCBC3]/30 text-[#F7F5E9] min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button className="bg-[#5FCBC3] text-[#2C3A4A] hover:bg-[#5FCBC3]/90">Post Analysis</Button>
          </div>
        </div>
      </div>
    </TabsContent> */}
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
    </Card>
    </div>
  );
};