"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import {
  Calculator,
  ChevronDown,
  MessageSquare,
  Send,
  Share2,
  ThumbsUp,
  X,
} from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/src/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog"
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea" 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"
import { useSession } from "@/src/lib/auth/session-context"
import { AvatarGenerator } from "@/src/components/profile/setup/Avatar"
import { PostCardSingleProps, CommentProps } from "./PostSingle"
import SurveyorCalculator from "./Surveyor/CalculatorSurveyor";
import { SurveyorCommentList } from "../comments/CommentListById"

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
  const session = useSession()

  const [voteCount, setVoteCount] = useState(votes)
  const [isSharing, setIsSharing] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const shareCardRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleVoteClick = async () => {
    if (!session) return

    try {
      const response = await fetch("/api/gameplay/social/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classificationId,
          anomalyId,
          voteType: "up",
        }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result?.error || "Failed to vote")
      if (result?.alreadyVoted) return
      setVoteCount((prev) => prev + 1)
      if (onVote) onVote()
    } catch (error: any) {
      console.error("Error voting:", error)
    }
  }

  const goToNextImage = () =>
    setCurrentIndex((prev) => (prev + 1) % images.length)
  const goToPreviousImage = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    )

  const handleShare = async () => {
    if (!shareCardRef.current) return

    setIsSharing(true)
    const safeTitle = title || "Classification"

    const imgs = Array.from(
      shareCardRef.current.querySelectorAll("img")
    )

    const loadPromises = imgs.map(
      (img: HTMLImageElement) =>
        new Promise<void>((resolve, reject) => {
          if (img.complete) return resolve()
          img.onload = () => resolve()
          img.onerror = () =>
            reject(new Error("Image failed to load"))
        })
    )

    try {
      await Promise.all(loadPromises)

      const { default: html2canvas } = await import("html2canvas")
      const canvas = await html2canvas(shareCardRef.current, {
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
      })

      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement("a")
          link.href = URL.createObjectURL(blob)
          link.download = `${safeTitle
            .toLowerCase()
            .replace(/\s+/g, "-")}-share.png`
          link.click()
        }
      }, "image/png")
    } catch (err) {
      console.error("Error sharing post:", err)
    } finally {
      setIsSharing(false)
    }
  }

  return (
    <div
      className="flex items-center justify-center w-full px-4 overflow-hidden"
      ref={shareCardRef}
    >
      <Card className="w-full max-w-4xl md:w-4/5 bg-white border border-[#D8DEE9] shadow-2xl rounded-xl overflow-y-auto">
        <CardHeader className="flex flex-row items-center gap-3 p-4 border-b border-gray-200 bg-gray-50">
          {session && <AvatarGenerator author={session.user.id} />}
          <div className="flex flex-col">
            <p className="text-sm font-medium text-gray-800">
              {session?.user.id}
            </p>
            <p className="text-xs text-green-600">
              {classificationType.toUpperCase()} Classification
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div
            className="relative overflow-hidden bg-white cursor-pointer"
            onClick={() => setIsLightboxOpen(true)}
          >
            {images.length > 0 && (
              <div className="">
                <img
                  src={images[currentIndex]}
                  alt={`Image ${currentIndex + 1}`}
                  className="w-full max-h-[80px] object-contain cursor-pointer rounded-lg transition-all duration-200"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={goToPreviousImage}
                      className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-[#4C566A]/60 text-white rounded-full p-2"
                    >
                      &#8592;
                    </button>
                    <button
                      onClick={goToNextImage}
                      className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-[#4C566A]/60 text-white rounded-full p-2"
                    >
                      &#8594;
                    </button>
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentIndex(index)}
                          className={`h-2 w-2 rounded-full transition ${
                            currentIndex === index
                              ? "bg-[#5E81AC]"
                              : "bg-[#D8DEE9]"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="p-4 bg-gradient-to-b from-gray-50 to-white">
            <p className="text-sm text-gray-800 line-clamp-6 min-h-[3rem]">{content}</p>
          </div>
        </CardContent>

        <CardFooter className="p-3 pt-0 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleVoteClick}
            className="text-gray-700 hover:text-green-600 hover:bg-gray-100"
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            <span className="text-xs">{voteCount}</span>
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
                    onClick={() =>
                      navigator.clipboard.writeText(
                        `https://starsailors.space/posts/${classificationId}`
                      )
                    }
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

        {classificationType === "planet" && (
          <div className="p-4 border-t border-gray-200 bg-white">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Surveyor Tools</h3>
            <SurveyorCalculator classificationId={classificationId.toString()} />
            <SurveyorCommentList classificationId={classificationId.toString()} />
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
      </Card>
    </div>
  )
}
