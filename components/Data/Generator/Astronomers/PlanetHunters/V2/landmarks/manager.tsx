"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  type Landmark,
  type LandmarkType,
  LANDMARK_COLORS,
  LANDMARK_ICONS,
  LANDMARK_DESCRIPTIONS,
} from "@/utils/landmark-types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Plus, MapPin } from "lucide-react";

interface LandmarkManagerProps {
  landmarks: Landmark[]
  onLandmarksChange: (landmarks: Landmark[]) => void
  onLandmarkSelect?: (landmark: Landmark) => void
  selectedLandmarkId?: string
};

export function LandmarkManager({
  landmarks,
  onLandmarksChange,
  onLandmarkSelect,
  selectedLandmarkId,
}: LandmarkManagerProps) {
  const [newLandmarkName, setNewLandmarkName] = useState("")
  const [newLandmarkType, setNewLandmarkType] = useState<LandmarkType>("mountain")
  const [newLandmarkDescription, setNewLandmarkDescription] = useState("")
  const [isAddingLandmark, setIsAddingLandmark] = useState(false)

  const handleAddLandmark = () => {
    if (!newLandmarkName) return

    const newLandmark: Landmark = {
      id: `custom-${Date.now()}`,
      name: newLandmarkName,
      type: newLandmarkType,
      position: {
        x: Math.random(), // Random position for now - in a real app, you'd let users place it
        y: Math.random(),
      },
      size: 0.2,
      elevation: 0, // This would be determined by the position on the planet
      description: newLandmarkDescription || LANDMARK_DESCRIPTIONS[newLandmarkType],
      color: LANDMARK_COLORS[newLandmarkType],
    }

    onLandmarksChange([...landmarks, newLandmark])

    // Reset form
    setNewLandmarkName("")
    setNewLandmarkDescription("")
    setIsAddingLandmark(false)
  }

  const handleRemoveLandmark = (id: string) => {
    onLandmarksChange(landmarks.filter((landmark) => landmark.id !== id))
  }

  const handleSelectLandmark = (landmark: Landmark) => {
    if (onLandmarkSelect) {
      onLandmarkSelect(landmark)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#5FCBC3]">Landmarks ({landmarks.length})</h3>
        <Button
          size="sm"
          variant="outline"
          className="text-[#5FCBC3] border-[#5FCBC3]"
          onClick={() => setIsAddingLandmark(!isAddingLandmark)}
        >
          {isAddingLandmark ? <X size={16} /> : <Plus size={16} />}
          {isAddingLandmark ? "Cancel" : "Add Landmark"}
        </Button>
      </div>

      {isAddingLandmark && (
        <div className="space-y-3 p-3 bg-[#2A2A2A] rounded-md">
          <div className="space-y-1">
            <Label htmlFor="landmark-name" className="text-sm text-[#5FCBC3]">
              Name
            </Label>
            <Input
              id="landmark-name"
              value={newLandmarkName}
              onChange={(e) => setNewLandmarkName(e.target.value)}
              placeholder="Enter landmark name"
              className="bg-[#1E1E1E] border-[#3A3A3A] text-white"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="landmark-type" className="text-sm text-[#5FCBC3]">
              Type
            </Label>
            <Select value={newLandmarkType} onValueChange={(value) => setNewLandmarkType(value as LandmarkType)}>
              <SelectTrigger id="landmark-type" className="bg-[#1E1E1E] border-[#3A3A3A] text-white">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-[#2A2A2A] border-[#3A3A3A] text-white">
                {Object.entries(LANDMARK_COLORS).map(([type, color]) => (
                  <SelectItem key={type} value={type}>
                    <div className="flex items-center">
                      <span className="mr-2" style={{ color }}>
                        {LANDMARK_ICONS[type as LandmarkType]}
                      </span>
                      <span className="capitalize">{type}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="landmark-description" className="text-sm text-[#5FCBC3]">
              Description (Optional)
            </Label>
            <Textarea
              id="landmark-description"
              value={newLandmarkDescription}
              onChange={(e) => setNewLandmarkDescription(e.target.value)}
              placeholder={LANDMARK_DESCRIPTIONS[newLandmarkType]}
              className="bg-[#1E1E1E] border-[#3A3A3A] text-white h-20 resize-none"
            />
          </div>

          <Button
            onClick={handleAddLandmark}
            className="w-full bg-[#5FCBC3] hover:bg-[#4DBAA9] text-black"
            disabled={!newLandmarkName}
          >
            Add Landmark
          </Button>
        </div>
      )}

      {landmarks.length > 0 ? (
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {landmarks.map((landmark) => (
              <div
                key={landmark.id}
                className={`flex items-center justify-between p-2 rounded-md ${
                  selectedLandmarkId === landmark.id ? "bg-[#2C4F64]" : "bg-[#2A2A2A] hover:bg-[#3A3A3A]"
                } cursor-pointer transition-colors`}
                onClick={() => handleSelectLandmark(landmark)}
              >
                <div className="flex items-center space-x-2">
                  <span style={{ color: landmark.color }} className="text-lg">
                    {LANDMARK_ICONS[landmark.type]}
                  </span>
                  <div>
                    <div className="font-medium">{landmark.name}</div>
                    <div className="text-xs text-gray-400 capitalize">{landmark.type}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSelectLandmark(landmark)
                    }}
                  >
                    <MapPin size={16} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveLandmark(landmark.id)
                    }}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No landmarks added yet. Add some landmarks to track interesting features on your planet.
        </div>
      )}
    </div>
  );
};