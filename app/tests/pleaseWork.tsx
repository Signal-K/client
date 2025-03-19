"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Webcam from "react-webcam"
import axios from "axios"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import { useActivePlanet } from "@/context/ActivePlanet"

export default function ChatGPTImageClassifier() {
  const supabase = useSupabaseClient()
  const session = useSession()

  const { activePlanet } = useActivePlanet()

  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [useWebcam, setUseWebcam] = useState(false)
  const [location, setLocation] = useState<string>("")
  const [comment, setComment] = useState<string>("")
  const webcamRef = useRef<Webcam | null>(null)
  const [scanPosition, setScanPosition] = useState(0)

  // Animation for scanner line
  useEffect(() => {
    if (!loading) return

    let animationId: number
    let position = 0
    const animate = () => {
      position = (position + 1) % 100
      setScanPosition(position)
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [loading])

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setImage(file)

    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  // Capture image from webcam
  const captureWebcamImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      if (imageSrc) {
        setPreview(imageSrc)
        setImage(null) // Prevent file-based upload conflict
      }
    }
  }

  // Send image for classification
  const sendImage = async () => {
    if (!preview) return

    setLoading(true)
    setResponse(null)

    const formData = new FormData()

    if (image) {
      // If file upload is used
      formData.append("file", image)
    } else {
      // Convert base64 to Blob for webcam image
      const blob = await fetch(preview).then((res) => res.blob())
      formData.append("file", blob)
    }

    try {
      const res = await axios.post("/api/zoodex/upload-image/gpt", formData)

      console.log("Full API Response:", res.data) // Log full response

      if (res.data.refresh) {
        window.location.reload()
        return
      }

      setResponse(res.data)
    } catch (error) {
      console.error("Error fetching classification:", error)
      setResponse({ error: "Error: Unable to get classification." })
    } finally {
      setLoading(false)
    }
  }

  // Upload image to Supabase
  const uploadImageToSupabase = async (file: File) => {
    if (!image) return
    setLoading(true)

    const fileName = `${Date.now()}-${file.name}`

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage.from("uploads").upload(fileName, file)

      if (uploadError) {
        console.error("Upload error:", uploadError.message)
        return
      }

      if (uploadData) {
        const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${uploadData.path}`

        const { data: uploadEntry, error: entryError } = await supabase
          .from("uploads")
          .insert({
            author: session?.user?.id,
            location: activePlanet?.id || 30,
            content: comment,
            file_url: fileUrl,
            configuration: response,
            source: "Webcam",
          })
          .single()

        if (entryError) {
          console.error("Entry error:", entryError.message)
        } else {
          console.log("Upload entry:", uploadEntry)
        }
      }
    } catch (err) {
      console.error("Unexpected error during file upload:", err)
    } finally {
      setLoading(false)
    }
  }

  const saveLifeEntity = async () => {
    if (!session) {
      return
    }

    try {
      const { data: entityEntry, error: entityError } = await supabase.from("zoo").insert({
        author: session?.user?.id,
        owner: session?.user?.id,
        location: activePlanet.id, // fill this in
        configuration: null, // fill this in
        uploaded: "", // fill this in
      })
    } catch (err: any) {}
  }

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col bg-gradient-to-b from-red-700 to-red-900 overflow-hidden">
      {/* Decorative elements - bolts and mechanical details */}
      <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-gray-800 border-2 border-gray-600 shadow-inner flex items-center justify-center">
        <div className="w-3 h-0.5 bg-gray-500 absolute"></div>
        <div className="w-0.5 h-3 bg-gray-500 absolute"></div>
      </div>
      <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gray-800 border-2 border-gray-600 shadow-inner flex items-center justify-center">
        <div className="w-3 h-0.5 bg-gray-500 absolute"></div>
        <div className="w-0.5 h-3 bg-gray-500 absolute"></div>
      </div>

      {/* Circuit board lines */}
      <div className="absolute top-0 left-1/4 w-0.5 h-16 bg-blue-400/20"></div>
      <div className="absolute top-0 right-1/4 w-0.5 h-24 bg-blue-400/20"></div>
      <div className="absolute bottom-0 left-1/3 w-0.5 h-20 bg-blue-400/20"></div>
      <div className="absolute bottom-0 right-1/3 w-0.5 h-12 bg-blue-400/20"></div>

      <div className="absolute top-20 left-0 h-0.5 w-20 bg-blue-400/20"></div>
      <div className="absolute top-28 right-0 h-0.5 w-16 bg-blue-400/20"></div>
      <div className="absolute bottom-24 left-0 h-0.5 w-24 bg-blue-400/20"></div>
      <div className="absolute bottom-16 right-0 h-0.5 w-20 bg-blue-400/20"></div>

      {/* Header with glowing effect */}
      <div className="p-6 flex items-center justify-center relative z-10">
        <div className="flex items-center bg-gray-900/50 px-6 py-2 rounded-full backdrop-blur-sm border border-gray-700">
          <div
            className="w-6 h-6 bg-white rounded-full mr-3"
            style={{ boxShadow: "0 0 10px rgba(255,255,255,0.7)" }}
          ></div>
          <h2 className="text-2xl font-bold text-white tracking-wider">Pokédex</h2>
        </div>

        {/* Status lights */}
        <div className="absolute top-6 right-6 flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500" style={{ animation: "pulse 2s infinite" }}></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500" style={{ animation: "pulse 2s infinite 0.5s" }}></div>
          <div className="w-3 h-3 rounded-full bg-green-500" style={{ animation: "pulse 2s infinite 1s" }}></div>
        </div>
      </div>

      {/* Main content - circular viewfinder */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div className="w-full max-w-md aspect-square relative flex items-center justify-center mx-auto">
          {/* Mechanical ring with bolts */}
          <div className="absolute inset-0 rounded-full bg-gray-800 flex items-center justify-center">
            {/* Decorative bolts around the ring */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-4 h-4 rounded-full bg-gray-600 border border-gray-500 flex items-center justify-center"
                style={{
                  transform: `rotate(${i * 45}deg) translateY(-50%) translateX(${i % 2 === 0 ? -1 : 1}px)`,
                  top: `${50 + 46 * Math.sin((i * Math.PI) / 4)}%`,
                  left: `${50 + 46 * Math.cos((i * Math.PI) / 4)}%`,
                }}
              >
                <div className="w-2 h-0.5 bg-gray-400" style={{ transform: `rotate(${i * 45}deg)` }}></div>
              </div>
            ))}
          </div>

          {/* Black outer ring with tech details */}
          <div className="absolute inset-[5%] rounded-full bg-black flex items-center justify-center overflow-hidden">
            {/* Tech pattern on black ring */}
            <div className="absolute top-1/4 left-0 w-full h-0.5 bg-gray-800"></div>
            <div className="absolute bottom-1/4 left-0 w-full h-0.5 bg-gray-800"></div>
            <div className="absolute left-1/4 top-0 h-full w-0.5 bg-gray-800"></div>
            <div className="absolute right-1/4 top-0 h-full w-0.5 bg-gray-800"></div>
          </div>

          {/* Inner viewfinder with glowing border */}
          <div
            className="absolute inset-[15%] rounded-full overflow-hidden bg-white border-4 border-yellow-400"
            style={{ boxShadow: "0 0 15px rgba(234,179,8,0.5)" }}
          >
            {useWebcam ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{
                  facingMode: "environment",
                }}
              />
            ) : preview ? (
              <img src={preview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <div className="text-gray-500 text-center p-4 flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <p className="text-sm">Upload an image or switch to camera</p>
                </div>
              </div>
            )}

            {/* Scanning animation when loading */}
            {loading && (
              <div className="absolute inset-0 bg-blue-400/10">
                <div
                  className="absolute w-full h-1 bg-blue-400/70"
                  style={{
                    top: `${scanPosition}%`,
                    boxShadow: "0 0 10px rgba(59,130,246,0.7)",
                  }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Scan button with mechanical housing */}
        <div className="mt-8 mb-4 relative">
          <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-full bg-gray-900"></div>
          {useWebcam ? (
            <button
              onClick={captureWebcamImage}
              className="relative w-24 h-24 rounded-full bg-gradient-to-br from-white to-gray-200 text-black font-medium flex items-center justify-center shadow-lg hover:from-gray-100 hover:to-gray-300 transition-colors border-4 border-gray-300 z-10"
            >
              <span className="text-lg">scan</span>
            </button>
          ) : preview ? (
            <button
              onClick={sendImage}
              disabled={loading}
              className="relative w-24 h-24 rounded-full bg-gradient-to-br from-white to-gray-200 text-black font-medium flex items-center justify-center shadow-lg hover:from-gray-100 hover:to-gray-300 transition-colors border-4 border-gray-300 z-10 disabled:opacity-50"
            >
              <span className="text-lg">{loading ? "..." : "scan"}</span>
            </button>
          ) : (
            <label className="relative w-24 h-24 rounded-full bg-gradient-to-br from-white to-gray-200 text-black font-medium flex items-center justify-center shadow-lg hover:from-gray-100 hover:to-gray-300 transition-colors border-4 border-gray-300 z-10 cursor-pointer">
              <span className="text-lg">upload</span>
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          )}
        </div>
      </div>

      {/* Camera toggle with mechanical look */}
      <div className="p-6 flex justify-center">
        <div className="bg-gray-800 p-1 rounded-full shadow-inner">
          <button
            onClick={() => setUseWebcam(!useWebcam)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              useWebcam
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                : "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
            }`}
          >
            {useWebcam ? "Upload Image" : "Use Camera"}
          </button>
        </div>
      </div>

      {/* Bottom panel with mechanical details */}
      <div className="h-8 bg-gray-800 flex items-center justify-between px-4 mt-2">
        <div className="flex space-x-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-gray-600"></div>
          ))}
        </div>
        <div className="h-1 flex-1 mx-4 bg-gray-700 rounded-full overflow-hidden">
          <div className="w-1/3 h-full bg-blue-500/50"></div>
        </div>
        <div className="flex space-x-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-gray-600"></div>
          ))}
        </div>
      </div>

      {/* Results panel - only show when we have results */}
      {response && !response.error && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-gray-900 text-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border border-gray-700"
            style={{ boxShadow: "0 0 20px rgba(59,130,246,0.3)" }}
          >
            {/* Mechanical header with bolts */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-blue-400">Classification Results</h3>
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-700 border border-gray-600"></div>
                <div className="w-3 h-3 rounded-full bg-gray-700 border border-gray-600"></div>
              </div>
            </div>

            <div className="space-y-3 text-gray-300">
              <p>
                <strong className="text-blue-400">Common Name:</strong> {response.common_name}
              </p>
              <p>
                <strong className="text-blue-400">Scientific Name:</strong> {response.genus} {response.species}
              </p>
              <p>
                <strong className="text-blue-400">Kingdom:</strong> {response.kingdom}
              </p>
              <p>
                <strong className="text-blue-400">Phylum:</strong> {response.phylum}
              </p>
              <p>
                <strong className="text-blue-400">Class:</strong> {response.class}
              </p>
              <p>
                <strong className="text-blue-400">Order:</strong> {response.order}
              </p>
              <p>
                <strong className="text-blue-400">Family:</strong> {response.family}
              </p>

              {response.traits && (
                <div>
                  <strong className="text-blue-400">Traits:</strong>
                  <ul className="list-disc pl-4 mt-1">
                    {Object.entries(response.traits).map(([trait, value]) => (
                      <li key={trait}>
                        <strong>{trait}:</strong> {String(value)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {response.compatible_biomes && response.compatible_biomes.length > 0 && (
                <div>
                  <strong className="text-blue-400">Compatible Biomes:</strong>
                  <ul className="list-disc pl-4 mt-1">
                    {response.compatible_biomes.map((biome: string, index: number) => (
                      <li key={index}>{biome}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p>
                <strong className="text-blue-400">Conservation Status:</strong> {response.conservation_status}
              </p>
            </div>

            <div className="mt-6 space-y-4 pt-4 border-t border-gray-700">
              <input
                type="text"
                placeholder="Enter your location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              />

              <textarea
                placeholder="Add a comment (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white"
              />

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (image) uploadImageToSupabase(image)
                    setResponse(null)
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md disabled:opacity-50 hover:from-blue-500 hover:to-blue-600 transition-colors"
                >
                  {loading ? "Uploading..." : "Save"}
                </button>

                <button
                  onClick={() => setResponse(null)}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {response?.error && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-gray-900 text-white rounded-xl p-6 max-w-md w-full border border-red-800"
            style={{ boxShadow: "0 0 20px rgba(220,38,38,0.3)" }}
          >
            <h3 className="text-xl font-bold mb-4 text-red-500">Error</h3>
            <p>{response.error}</p>
            <button
              onClick={() => setResponse(null)}
              className="mt-4 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* QR code icon in bottom right with mechanical housing */}
      <div className="absolute bottom-4 right-4">
        <div className="w-12 h-12 bg-gray-800 rounded-md flex items-center justify-center border-2 border-gray-700 shadow-lg">
          <div className="w-8 h-8 grid grid-cols-2 grid-rows-2 gap-1">
            <div className="bg-white"></div>
            <div className="bg-white"></div>
            <div className="bg-white"></div>
            <div className="bg-white"></div>
          </div>
        </div>
      </div>

      {/* Add keyframes for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};