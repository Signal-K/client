"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Eye, Play, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { PlanetStats, Landmark, LandmarkEvent } from "@/lib/planet-physics"
import { determinePlanetType } from "@/lib/planet-physics"
import { TerrainPreview } from "./terrain-preview"
import { getInfluenceTypes, getInfluenceTypeName } from "./Landmark-Types"
import { generateRandomCoordinates } from "./landmark-utils";

interface LandmarksTabProps {
  planetStats: PlanetStats
  setPlanetStats: (stats: PlanetStats) => void
}

export function LandmarksTab({ planetStats, setPlanetStats }: LandmarksTabProps) {
  const planetType = determinePlanetType(planetStats.mass, planetStats.radius)
  const isGasGiant = planetType === "gaseous"

  // Track previous planet type to detect changes
  const [previousPlanetType, setPreviousPlanetType] = useState(planetType)

  const [newLandmark, setNewLandmark] = useState<Landmark>({
    classification_id: "",
    type: "",
    visual_effect: "",
    image_link: "",
    coordinates: { x: 0, y: 0, z: 0 },
    influence_radius: 0.5,
    influence_strength: 0.7,
    influence_type: isGasGiant ? "storm" : "mountain",
    category: isGasGiant ? "gaseous" : "terrestrial",
    events: [],
  })

  const [newEvent, setNewEvent] = useState<LandmarkEvent>({
    id: "",
    type: "",
    description: "",
    duration: 5,
    intensity: 0.5,
  })

  const [selectedLandmarkIndex, setSelectedLandmarkIndex] = useState<number>(-1)
  const [showTypeWarning, setShowTypeWarning] = useState(false)

  // Replace the visibleLandmarks filtering with a function that returns all landmarks
  // but marks them as active or inactive
  const landmarks = useState(() => {
    if (!planetStats.landmarks) return []

    return planetStats.landmarks.map((landmark) => {
      // Determine if the landmark is active for the current planet type
      const isActive = isGasGiant ? landmark.category === "gaseous" : landmark.category === "terrestrial"

      return {
        ...landmark,
        isActive,
      }
    })
  })[0]

  // Handle planet type changes
  useEffect(() => {
    if (previousPlanetType !== planetType) {
      setPreviousPlanetType(planetType)

      // Update the new landmark form for the current planet type
      setNewLandmark((prev) => ({
        ...prev,
        influence_type: isGasGiant ? "storm" : "mountain",
        category: isGasGiant ? "gaseous" : "terrestrial",
      }))

      // Reset selected landmark if it's not visible anymore
      if (selectedLandmarkIndex >= 0 && planetStats.landmarks) {
        const selectedLandmark = planetStats.landmarks[selectedLandmarkIndex]
        if (selectedLandmark) {
          const isVisible = isGasGiant
            ? (selectedLandmark.category || "terrestrial") === "gaseous"
            : (selectedLandmark.category || "terrestrial") === "terrestrial"

          if (!isVisible) {
            setSelectedLandmarkIndex(-1)
            setShowTypeWarning(true)
          }
        }
      }
    }
  }, [planetType, previousPlanetType, selectedLandmarkIndex, planetStats.landmarks, isGasGiant])

  // Add a new landmark
  const addLandmark = () => {
    if (!newLandmark.classification_id || !newLandmark.type) return

    // Ensure the landmark has the correct category for the current planet type
    const landmarkToAdd = {
      ...newLandmark,
      category: isGasGiant ? "gaseous" : "terrestrial",
    }

    const landmarks = [
      ...(planetStats.landmarks || []),
      { ...landmarkToAdd, category: landmarkToAdd.category as "terrestrial" | "gaseous" },
    ]
    setPlanetStats({ ...planetStats, landmarks })

    // Reset the form
    setNewLandmark({
      classification_id: "",
      type: "",
      visual_effect: "",
      image_link: "",
      coordinates: { x: 0, y: 0, z: 0 },
      influence_radius: 0.5,
      influence_strength: 0.7,
      influence_type: isGasGiant ? "storm" : "mountain",
      category: isGasGiant ? "gaseous" : "terrestrial",
      events: [],
    })
  }

  // Remove a landmark
  const removeLandmark = (index: number) => {
    if (!planetStats.landmarks) return

    const landmarkToRemove = landmarks[index]
    const actualIndex = planetStats.landmarks.findIndex(
      (l) => l.classification_id === landmarkToRemove.classification_id,
    )

    if (actualIndex === -1) return

    const updatedLandmarks = [...planetStats.landmarks]
    updatedLandmarks.splice(actualIndex, 1)
    setPlanetStats({ ...planetStats, landmarks: updatedLandmarks })

    // Reset selected landmark if it was deleted
    if (selectedLandmarkIndex === index) {
      setSelectedLandmarkIndex(-1)
    } else if (selectedLandmarkIndex > index) {
      setSelectedLandmarkIndex(selectedLandmarkIndex - 1)
    }
  }

  // Update new landmark field
  const updateNewLandmark = (field: keyof Landmark, value: any) => {
    if (field === "coordinates") {
      setNewLandmark({ ...newLandmark, coordinates: { ...newLandmark.coordinates, ...value } })
    } else {
      setNewLandmark({ ...newLandmark, [field]: value })
    }
  }

  // Update existing landmark
  const updateLandmark = (index: number, field: keyof Landmark, value: any) => {
    if (!planetStats.landmarks) return

    const landmarkToUpdate = landmarks[index]
    const actualIndex = planetStats.landmarks.findIndex(
      (l) => l.classification_id === landmarkToUpdate.classification_id,
    )

    if (actualIndex === -1) return

    const updatedLandmarks = [...planetStats.landmarks]

    if (field === "coordinates") {
      updatedLandmarks[actualIndex] = {
        ...updatedLandmarks[actualIndex],
        coordinates: { ...updatedLandmarks[actualIndex].coordinates, ...value },
      }
    } else {
      updatedLandmarks[actualIndex] = {
        ...updatedLandmarks[actualIndex],
        [field]: value,
      }
    }

    setPlanetStats({ ...planetStats, landmarks: updatedLandmarks })
  }

  // Add a new event to the selected landmark
  const addEventToLandmark = () => {
    if (selectedLandmarkIndex === -1 || !newEvent.type || !newEvent.description) return

    if (!planetStats.landmarks) return

    const landmarkToUpdate = landmarks[selectedLandmarkIndex]
    const actualIndex = planetStats.landmarks.findIndex(
      (l) => l.classification_id === landmarkToUpdate.classification_id,
    )

    if (actualIndex === -1) return

    const updatedLandmarks = [...planetStats.landmarks]
    const landmark = updatedLandmarks[actualIndex]

    // Generate a unique ID for the event
    const eventId = `EV-${Math.floor(Math.random() * 900 + 100)}`
    const eventWithId = { ...newEvent, id: eventId }

    // Add the event to the landmark
    updatedLandmarks[actualIndex] = {
      ...landmark,
      events: [...(landmark.events || []), eventWithId],
    }

    setPlanetStats({ ...planetStats, landmarks: updatedLandmarks })

    // Reset the event form
    setNewEvent({
      id: "",
      type: "",
      description: "",
      duration: 5,
      intensity: 0.5,
    })
  }

  // Remove an event from a landmark
  const removeEventFromLandmark = (landmarkIndex: number, eventIndex: number) => {
    if (!planetStats.landmarks) return

    const landmarkToUpdate = landmarks[landmarkIndex]
    const actualIndex = planetStats.landmarks.findIndex(
      (l) => l.classification_id === landmarkToUpdate.classification_id,
    )

    if (actualIndex === -1) return

    const updatedLandmarks = [...planetStats.landmarks]
    const landmark = updatedLandmarks[actualIndex]

    if (!landmark.events) return

    const events = [...landmark.events]
    events.splice(eventIndex, 1)

    updatedLandmarks[actualIndex] = {
      ...landmark,
      events,
    }

    setPlanetStats({ ...planetStats, landmarks: updatedLandmarks })
  }

  return (
    <div className="space-y-6">
      {showTypeWarning && (
        <Alert variant="destructive" className="bg-amber-900/20 border-amber-500/50 text-amber-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some landmarks are hidden because they don't match the current planet type (
            {isGasGiant ? "gaseous" : "terrestrial"}).
            <Button
              variant="link"
              className="p-0 h-auto text-amber-300 hover:text-amber-200"
              onClick={() => setShowTypeWarning(false)}
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-black/60 border-green-500/30 text-green-400">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg tracking-wide">
            LANDMARK DATABASE ({isGasGiant ? "GASEOUS" : "TERRESTRIAL"} PLANET)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-green-300">Current Landmarks</Label>
            {landmarks.length === 0 ? (
              <div className="text-center py-4 border border-dashed border-green-500/30 rounded-md">
                <p className="text-green-500/70">No landmarks registered</p>
              </div>
            ) : (
              <div className="space-y-3">
                {landmarks.map((landmark, index) => (
                  <div
                    key={landmark.classification_id}
                    className={`border ${
                      selectedLandmarkIndex === index ? "border-green-400" : "border-green-500/30"
                    } rounded-md p-3 space-y-2 ${!landmark.isActive ? "opacity-50" : ""}`}
                    onClick={() => setSelectedLandmarkIndex(index)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-green-300">{landmark.classification_id}</span>
                        {!landmark.isActive && (
                          <span className="text-xs bg-amber-900/50 text-amber-300 px-1.5 py-0.5 rounded">
                            {landmark.category === "gaseous" ? "GASEOUS" : "TERRESTRIAL"}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedLandmarkIndex(index)
                          }}
                          className="h-6 w-6 p-0 text-green-400 hover:text-green-300 hover:bg-transparent"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeLandmark(index)
                          }}
                          className="h-6 w-6 p-0 text-green-400 hover:text-red-400 hover:bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <span className="text-green-500/70">Type:</span>
                      <span>{landmark.type}</span>
                      <span className="text-green-500/70">Visual Effect:</span>
                      <span>{landmark.visual_effect || "None"}</span>
                      <span className="text-green-500/70">Coordinates:</span>
                      <span>
                        X: {landmark.coordinates.x.toFixed(2)}, Y: {landmark.coordinates.y.toFixed(2)}, Z:{" "}
                        {landmark.coordinates.z.toFixed(2)}
                      </span>
                      <span className="text-green-500/70">Events:</span>
                      <span>{landmark.events?.length || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedLandmarkIndex !== -1 && landmarks[selectedLandmarkIndex] && (
        <Card className="bg-black/60 border-green-500/30 text-green-400">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg tracking-wide flex items-center justify-between">
              <span>LANDMARK DETAILS: {landmarks[selectedLandmarkIndex].classification_id}</span>
              {!landmarks[selectedLandmarkIndex].isActive && (
                <span className="text-xs bg-amber-900/50 text-amber-300 px-2 py-1 rounded">
                  INACTIVE ({landmarks[selectedLandmarkIndex].category?.toUpperCase()})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="info">
              <TabsList className="bg-black border border-green-500/30">
                <TabsTrigger
                  value="info"
                  className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-300"
                >
                  INFO
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-300"
                >
                  EVENTS
                </TabsTrigger>
                <TabsTrigger
                  value="terrain"
                  className="data-[state=active]:bg-green-900/20 data-[state=active]:text-green-300"
                >
                  TERRAIN
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-green-300">Type</Label>
                    <div className="mt-1 p-2 bg-black/50 border border-green-500/30 rounded">
                      {landmarks[selectedLandmarkIndex].type}
                    </div>
                  </div>
                  <div>
                    <Label className="text-green-300">Visual Effect</Label>
                    <div className="mt-1 p-2 bg-black/50 border border-green-500/30 rounded">
                      {landmarks[selectedLandmarkIndex].visual_effect || "None"}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-green-300">Coordinates</Label>
                    <div className="mt-1 p-2 bg-black/50 border border-green-500/30 rounded">
                      X: {landmarks[selectedLandmarkIndex].coordinates.x.toFixed(2)}, Y:{" "}
                      {landmarks[selectedLandmarkIndex].coordinates.y.toFixed(2)}, Z:{" "}
                      {landmarks[selectedLandmarkIndex].coordinates.z.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-green-300">Category</Label>
                    <div className="mt-1 p-2 bg-black/50 border border-green-500/30 rounded capitalize">
                      {landmarks[selectedLandmarkIndex].category || (isGasGiant ? "gaseous" : "terrestrial")}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="events" className="pt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-green-300">Event List</Label>
                    {!landmarks[selectedLandmarkIndex].events ||
                    landmarks[selectedLandmarkIndex].events?.length === 0 ? (
                      <div className="text-center py-4 border border-dashed border-green-500/30 rounded-md">
                        <p className="text-green-500/70">No events registered for this landmark</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {landmarks[selectedLandmarkIndex].events?.map((event, eventIndex) => (
                          <div key={event.id} className="border border-green-500/30 rounded-md p-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="font-bold">
                                {event.id}: {event.type}
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-5 w-5 p-0 text-green-400 hover:text-green-300 hover:bg-transparent"
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeEventFromLandmark(selectedLandmarkIndex, eventIndex)}
                                  className="h-5 w-5 p-0 text-green-400 hover:text-red-400 hover:bg-transparent"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="mt-1">{event.description}</div>
                            {event.duration && (
                              <div className="mt-1 text-green-500/70">Duration: {event.duration}s</div>
                            )}
                            {event.intensity && (
                              <div className="text-green-500/70">Intensity: {event.intensity.toFixed(1)}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-green-500/30">
                    <Label className="text-green-300">Add New Event</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Type</Label>
                        <Input
                          value={newEvent.type}
                          onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                          className="bg-black border-green-500/30 text-green-400"
                          placeholder="Lightning Strike"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Duration (s)</Label>
                        <Input
                          type="number"
                          value={newEvent.duration}
                          onChange={(e) => setNewEvent({ ...newEvent, duration: Number.parseFloat(e.target.value) })}
                          className="bg-black border-green-500/30 text-green-400"
                          step="0.5"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          className="bg-black border-green-500/30 text-green-400"
                          placeholder="Brief description of the event"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Intensity (0-1)</Label>
                        <Input
                          type="number"
                          value={newEvent.intensity}
                          onChange={(e) => setNewEvent({ ...newEvent, intensity: Number.parseFloat(e.target.value) })}
                          className="bg-black border-green-500/30 text-green-400"
                          min="0"
                          max="1"
                          step="0.1"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={addEventToLandmark}
                      className="w-full mt-2 bg-green-700 hover:bg-green-600 text-black"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Event
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="terrain" className="pt-4">
                <div className="space-y-4">
                  {!landmarks[selectedLandmarkIndex].isActive && (
                    <Alert variant="default" className="bg-amber-900/20 border-amber-500/50 text-amber-300">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        This landmark is inactive because it's a {landmarks[selectedLandmarkIndex].category} landmark on
                        a {isGasGiant ? "gaseous" : "terrestrial"} planet. The terrain preview shows how it would appear
                        on a {landmarks[selectedLandmarkIndex].category} planet.
                      </AlertDescription>
                    </Alert>
                  )}
                  <TerrainPreview landmark={landmarks[selectedLandmarkIndex]} planetStats={planetStats} />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Influence Type</Label>
                      <Select
                        value={landmarks[selectedLandmarkIndex].influence_type || (isGasGiant ? "storm" : "mountain")}
                        onValueChange={(value) => updateLandmark(selectedLandmarkIndex, "influence_type", value)}
                      >
                        <SelectTrigger className="bg-black border-green-500/30 text-green-400">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-green-500/30 text-green-400">
                          {getInfluenceTypes(landmarks[selectedLandmarkIndex].category).map((type) => (
                            <SelectItem key={type} value={type}>
                              {getInfluenceTypeName(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Influence Radius</Label>
                      <Input
                        type="number"
                        value={landmarks[selectedLandmarkIndex].influence_radius || 0.5}
                        onChange={(e) =>
                          updateLandmark(selectedLandmarkIndex, "influence_radius", Number.parseFloat(e.target.value))
                        }
                        className="bg-black border-green-500/30 text-green-400"
                        step="0.1"
                      />
                    </div>

                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Influence Strength</Label>
                      <Slider
                        defaultValue={[Number(landmarks[selectedLandmarkIndex].influence_strength || 0.7) * 100]}
                        max={100}
                        step={1}
                        onValueChange={(value) =>
                          updateLandmark(selectedLandmarkIndex, "influence_strength", value[0] / 100)
                        }
                        className="text-green-400"
                      />
                      <div className="text-xs text-green-500/70">
                        {(landmarks[selectedLandmarkIndex].influence_strength || 0.7).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <Card className="bg-black/60 border-green-500/30 text-green-400">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg tracking-wide">
            ADD NEW {isGasGiant ? "GASEOUS" : "TERRESTRIAL"} LANDMARK
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-green-300">Classification ID</Label>
                <Input
                  value={newLandmark.classification_id}
                  onChange={(e) => updateNewLandmark("classification_id", e.target.value)}
                  className="bg-black border-green-500/30 text-green-400"
                  placeholder="LM-001"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-green-300">Type</Label>
                <Input
                  value={newLandmark.type}
                  onChange={(e) => updateNewLandmark("type", e.target.value)}
                  className="bg-black border-green-500/30 text-green-400"
                  placeholder={isGasGiant ? "Storm System" : "Mountain Range"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-green-300">Visual Effect</Label>
              <Input
                value={newLandmark.visual_effect}
                onChange={(e) => updateNewLandmark("visual_effect", e.target.value)}
                className="bg-black border-green-500/30 text-green-400"
                placeholder={isGasGiant ? "Lightning" : "Glowing"}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-green-300">Image Link</Label>
              <Input
                value={newLandmark.image_link}
                onChange={(e) => updateNewLandmark("image_link", e.target.value)}
                className="bg-black border-green-500/30 text-green-400"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-green-300">Coordinates</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateNewLandmark("coordinates", generateRandomCoordinates())}
                  className="h-6 text-xs border-green-500/30 text-green-400 hover:bg-green-900/20"
                >
                  Random
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">X</Label>
                  <Input
                    type="number"
                    value={newLandmark.coordinates.x}
                    onChange={(e) => updateNewLandmark("coordinates", { x: Number.parseFloat(e.target.value) })}
                    className="bg-black border-green-500/30 text-green-400"
                    step="0.1"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Y</Label>
                  <Input
                    type="number"
                    value={newLandmark.coordinates.y}
                    onChange={(e) => updateNewLandmark("coordinates", { y: Number.parseFloat(e.target.value) })}
                    className="bg-black border-green-500/30 text-green-400"
                    step="0.1"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Z</Label>
                  <Input
                    type="number"
                    value={newLandmark.coordinates.z}
                    onChange={(e) => updateNewLandmark("coordinates", { z: Number.parseFloat(e.target.value) })}
                    className="bg-black border-green-500/30 text-green-400"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-green-300">Influence Radius</Label>
                <Input
                  type="number"
                  value={newLandmark.influence_radius || 0.5}
                  onChange={(e) => updateNewLandmark("influence_radius", Number.parseFloat(e.target.value))}
                  className="bg-black border-green-500/30 text-green-400"
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-green-300">Influence Strength</Label>
                <Input
                  type="number"
                  value={newLandmark.influence_strength || 0.7}
                  onChange={(e) => updateNewLandmark("influence_strength", Number.parseFloat(e.target.value))}
                  className="bg-black border-green-500/30 text-green-400"
                  step="0.1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-green-300">Influence Type</Label>
              <Select
                value={newLandmark.influence_type || (isGasGiant ? "storm" : "mountain")}
                onValueChange={(value) => updateNewLandmark("influence_type", value)}
              >
                <SelectTrigger className="bg-black border-green-500/30 text-green-400">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-black border-green-500/30 text-green-400">
                  {getInfluenceTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {getInfluenceTypeName(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={addLandmark} className="w-full mt-2 bg-green-700 hover:bg-green-600 text-black">
              <Plus className="h-4 w-4 mr-2" />
              Add {isGasGiant ? "Gaseous" : "Terrestrial"} Landmark
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}