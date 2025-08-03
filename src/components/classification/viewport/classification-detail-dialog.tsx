"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
  Calendar,
  User,
  FileText,
  ImageIcon,
  Star,
  Zap,
  Target,
  Disc,
} from "lucide-react";
import Link from "next/link";

interface DatabaseClassification {
  id: number;
  created_at: string;
  content: string | null;
  author: string | null;
  anomaly: number | null;
  media: any;
  classificationtype: string | null;
  classificationConfiguration: any;
}

interface ClassificationDetailDialogProps {
  showDetailDialog: boolean;
  setShowDetailDialog: (show: boolean) => void;
  selectedClassification: DatabaseClassification | null;
  config: "telescope" | "weather" | "rover";
}

export function ClassificationDetailDialog({
  showDetailDialog,
  setShowDetailDialog,
  selectedClassification,
  config,
}: ClassificationDetailDialogProps) {
  if (!selectedClassification) return null;

  const getTypeIcon = (type: string | null) => {
    switch (type) {
      case "planet":
        return <Star className="h-5 w-5" />;
      case "sunspot":
        return <Zap className="h-5 w-5" />;
      case "asteroid":
        return <Target className="h-5 w-5" />;
      case "disk":
        return <Disc className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string | null) => {
    const colors = {
      telescope: {
        planet: "bg-blue-500",
        sunspot: "bg-orange-500",
        asteroid: "bg-purple-500",
        disk: "bg-green-500",
      },
      weather: {
        planet: "bg-red-500",
        sunspot: "bg-yellow-500",
        asteroid: "bg-pink-500",
        disk: "bg-cyan-500",
      },
      rover: {
        planet: "bg-yellow-500",
        sunspot: "bg-amber-500",
        asteroid: "bg-orange-500",
        disk: "bg-lime-500",
      },
    };
    return colors[config][type as keyof (typeof colors)[typeof config]] || "bg-gray-500";
  };

  const getConfigColors = () => {
    switch (config) {
      case "telescope":
        return {
          bg: "backdrop-blur-sm",
          bgStyle: { backgroundColor: "rgba(0, 80, 102, 0.95)" },
          border: "border",
          borderStyle: { borderColor: "rgba(120, 204, 226, 0.3)" },
          text: "font-mono",
          textStyle: { color: "#e4eff0" },
          accent: "font-mono",
          accentStyle: { color: "#78cce2" },
          card: "backdrop-blur-sm",
          cardStyle: { backgroundColor: "rgba(0, 36, 57, 0.8)", borderColor: "rgba(120, 204, 226, 0.3)" },
        };
      case "weather":
        return {
          bg: "bg-[#3B2F2F]",
          border: "border-[#5D4E4E]",
          text: "text-[#F4ECEC]",
          accent: "text-[#C08888]",
          card: "bg-[#4E3B3B]",
        };
      case "rover":
        return {
          bg: "bg-[#3B3B2F]",
          border: "border-[#5D5D4E]",
          text: "text-[#F4F4EC]",
          accent: "text-[#C0C088]",
          card: "bg-[#4E4E3B]",
        };
    }
  };

  const colors = getConfigColors();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const parseMedia = (media: any) => {
    if (!media) return [];
    try {
      if (typeof media === "string") {
        return JSON.parse(media);
      }
      return Array.isArray(media) ? media : [];
    } catch {
      return [];
    }
  };

  const mediaArray = parseMedia(selectedClassification.media);
  const firstImage = mediaArray.find((item: any) => item?.type === "image");

  const isPlanet = selectedClassification.classificationtype === "planet";
  const classificationId = selectedClassification.id;

  return (
    <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
      <DialogContent 
        className={`${colors.bg} ${colors.border} ${colors.text} max-w-2xl max-h-[80vh] overflow-y-auto`}
        style={config === "telescope" ? { ...colors.bgStyle, ...colors.borderStyle, ...colors.textStyle } : {}}
      >
        <DialogHeader>
          <DialogTitle 
            className={`flex items-center gap-2 ${colors.text}`}
            style={config === "telescope" ? colors.textStyle : {}}
          >
            {getTypeIcon(selectedClassification.classificationtype)}
            Classification Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 
                className={`text-lg font-semibold ${colors.text}`}
                style={config === "telescope" ? colors.textStyle : {}}
              >
                Classification #{classificationId}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" style={config === "telescope" ? { color: "#4e7988" } : { color: "rgb(156 163 175)" }} />
                  <span 
                    className={colors.accent}
                    style={config === "telescope" ? colors.accentStyle : {}}
                  >
                    {formatDate(selectedClassification.created_at)}
                  </span>
                </div>
                {selectedClassification.author && (
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" style={config === "telescope" ? { color: "#4e7988" } : { color: "rgb(156 163 175)" }} />
                    <span 
                      className={colors.accent}
                      style={config === "telescope" ? colors.accentStyle : {}}
                    >
                      User {selectedClassification.author.slice(0, 8)}...
                    </span>
                  </div>
                )}
              </div>
            </div>
            {selectedClassification.classificationtype && (
              <Badge className={`${getTypeColor(selectedClassification.classificationtype)} text-white`}>
                {selectedClassification.classificationtype.toUpperCase()}
              </Badge>
            )}
          </div>

          {/* Media Display */}
          {firstImage && (
            <div 
              className={`${colors.card} p-4 rounded-lg border`}
              style={config === "telescope" ? { ...colors.cardStyle, borderColor: "rgba(120, 204, 226, 0.3)" } : {}}
            >
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="h-4 w-4" style={config === "telescope" ? { color: "#4e7988" } : { color: "rgb(156 163 175)" }} />
                <span 
                  className={`${colors.accent} text-sm font-medium`}
                  style={config === "telescope" ? colors.accentStyle : {}}
                >
                  Associated Media
                </span>
              </div>
              <div className="relative">
                <img
                  src={firstImage.url || "/placeholder.svg?height=200&width=300"}
                  alt="Classification media"
                  className="w-full max-w-md mx-auto rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder.svg?height=200&width=300";
                  }}
                />
              </div>
              {mediaArray.length > 1 && (
                <div 
                  className="mt-2 text-xs"
                  style={config === "telescope" ? { color: "#4e7988" } : { color: "rgb(156 163 175)" }}
                >
                  +{mediaArray.length - 1} more media items
                </div>
              )}
            </div>
          )}

          {/* Content */}
          {selectedClassification.content && (
            <div 
              className={`${colors.card} p-4 rounded-lg border`}
              style={config === "telescope" ? { ...colors.cardStyle, borderColor: "rgba(120, 204, 226, 0.3)" } : {}}
            >
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4" style={config === "telescope" ? { color: "#4e7988" } : { color: "rgb(156 163 175)" }} />
                <span 
                  className={`${colors.accent} text-sm font-medium`}
                  style={config === "telescope" ? colors.accentStyle : {}}
                >
                  Classification Notes
                </span>
              </div>
              <p 
                className={`text-sm leading-relaxed ${colors.text}`}
                style={config === "telescope" ? colors.textStyle : {}}
              >
                {selectedClassification.content}
              </p>
            </div>
          )}

          {/* Technical Details */}
          <div 
            className={`${colors.card} p-4 rounded-lg border`}
            style={config === "telescope" ? { ...colors.cardStyle, borderColor: "rgba(120, 204, 226, 0.3)" } : {}}
          >
            <h4 
              className={`${colors.accent} text-sm font-medium mb-3`}
              style={config === "telescope" ? colors.accentStyle : {}}
            >
              Technical Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span 
                  className="block"
                  style={config === "telescope" ? { color: "#4e7988" } : { color: "rgb(156 163 175)" }}
                >
                  Anomaly ID:
                </span>
                <div 
                  className={colors.text}
                  style={config === "telescope" ? colors.textStyle : {}}
                >
                  {selectedClassification.anomaly || "Unknown"}
                </div>
              </div>
              <div>
                <span 
                  className="block"
                  style={config === "telescope" ? { color: "#4e7988" } : { color: "rgb(156 163 175)" }}
                >
                  Classification Type:
                </span>
                <div 
                  className={`capitalize ${colors.text}`}
                  style={config === "telescope" ? colors.textStyle : {}}
                >
                  {selectedClassification.classificationtype || "Unknown"}
                </div>
              </div>
            </div>
            {selectedClassification.classificationConfiguration && (
              <div className="mt-3">
                <span 
                  className="text-xs block"
                  style={config === "telescope" ? { color: "#4e7988" } : { color: "rgb(156 163 175)" }}
                >
                  Configuration:
                </span>
                <pre 
                  className="text-xs mt-1 p-2 rounded overflow-x-auto font-mono"
                  style={config === "telescope" ? { 
                    backgroundColor: "rgba(0, 0, 0, 0.3)", 
                    color: "#78cce2",
                    border: "1px solid rgba(120, 204, 226, 0.3)"
                  } : { backgroundColor: "rgba(0, 0, 0, 0.2)" }}
                >
                  {JSON.stringify(selectedClassification.classificationConfiguration, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap justify-end gap-2">
            <Link href={`/posts/${classificationId}`}>
              <Button 
                className="font-mono text-sm"
                style={config === "telescope" ? {
                  backgroundColor: "#78cce2",
                  color: "#002439",
                } : {}}
                onMouseEnter={config === "telescope" ? (e) => {
                  (e.target as HTMLElement).style.backgroundColor = "#e4eff0"
                } : undefined}
                onMouseLeave={config === "telescope" ? (e) => {
                  (e.target as HTMLElement).style.backgroundColor = "#78cce2"
                } : undefined}
              >
                View
              </Button>
            </Link>
            {isPlanet && (
              <>
                <Link href={`/${classificationId}/survey`}>
                  <Button 
                    className="font-mono text-sm"
                    style={config === "telescope" ? {
                      backgroundColor: "#4e7988",
                      color: "#e4eff0",
                    } : {}}
                    onMouseEnter={config === "telescope" ? (e) => {
                      (e.target as HTMLElement).style.backgroundColor = "#78cce2"
                      ;(e.target as HTMLElement).style.color = "#002439"
                    } : undefined}
                    onMouseLeave={config === "telescope" ? (e) => {
                      (e.target as HTMLElement).style.backgroundColor = "#4e7988"
                      ;(e.target as HTMLElement).style.color = "#e4eff0"
                    } : undefined}
                  >
                    Analyse behaviour
                  </Button>
                </Link>
                <Link href={`/planets/paint/${classificationId}`}>
                  <Button 
                    className="font-mono text-sm"
                    style={config === "telescope" ? {
                      backgroundColor: "#005066",
                      color: "#e4eff0",
                    } : {}}
                    onMouseEnter={config === "telescope" ? (e) => {
                      (e.target as HTMLElement).style.backgroundColor = "#78cce2"
                      ;(e.target as HTMLElement).style.color = "#002439"
                    } : undefined}
                    onMouseLeave={config === "telescope" ? (e) => {
                      (e.target as HTMLElement).style.backgroundColor = "#005066"
                      ;(e.target as HTMLElement).style.color = "#e4eff0"
                    } : undefined}
                  >
                    Customise
                  </Button>
                </Link>
              </>
            )}
            <Button
              onClick={() => setShowDetailDialog(false)}
              variant="outline"
              className={`${colors.border} ${colors.text} font-mono`}
              style={config === "telescope" ? {
                ...colors.borderStyle,
                ...colors.textStyle,
                backgroundColor: "transparent"
              } : {}}
              onMouseEnter={config === "telescope" ? (e) => {
                (e.target as HTMLElement).style.backgroundColor = "rgba(120, 204, 226, 0.2)"
              } : undefined}
              onMouseLeave={config === "telescope" ? (e) => {
                (e.target as HTMLElement).style.backgroundColor = "transparent"
              } : undefined}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};