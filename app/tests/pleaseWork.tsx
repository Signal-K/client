"use client";

import { useState, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";

export default function ChatGPTImageClassifier() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [useWebcam, setUseWebcam] = useState(false);
  const webcamRef = useRef<Webcam | null>(null);

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setImage(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Capture image from webcam
  const captureWebcamImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setPreview(imageSrc);
        setImage(null); // Prevent file-based upload conflict
      }
    }
  };

  // Send image for classification
  const sendImage = async () => {
    if (!preview) return;
  
    setLoading(true);
    setResponse(null);
  
    const formData = new FormData();
  
    if (image) {
      // If file upload is used
      formData.append("file", image);
    } else {
      // Convert base64 to Blob for webcam image
      const blob = await fetch(preview).then((res) => res.blob());
      formData.append("file", blob);
    }
  
    try {
      const res = await axios.post("/api/zoodex/upload-image/gpt", formData);
      
      console.log("Full API Response:", res.data); // Log full response
  
      if (res.data.refresh) {
        window.location.reload();
        return;
      }
      
      setResponse(res.data);
    } catch (error) {
      console.error("Error fetching classification:", error);
      setResponse({ error: "Error: Unable to get classification." });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="max-w-lg mx-auto p-4 bg-gray-800 text-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">AI Image Classifier</h2>

      <div className="mb-4 flex justify-between">
        <button
          className={`px-4 py-2 rounded-md ${
            useWebcam ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
          } text-white`}
          onClick={() => setUseWebcam(false)}
        >
          Upload Image
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            useWebcam ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-600"
          } text-white`}
          onClick={() => setUseWebcam(true)}
        >
          Use Webcam
        </button>
      </div>

      {useWebcam ? (
        <div className="flex flex-col items-center">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="mb-4 w-full h-auto rounded-md"
          />
          <button
            onClick={captureWebcamImage}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md"
          >
            Capture Image
          </button>
        </div>
      ) : (
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-4 w-full text-sm bg-gray-900 p-2 border border-gray-700 rounded-md"
        />
      )}

      {preview && (
        <div className="mb-4">
          <img src={preview} alt="Captured preview" className="w-full h-auto rounded-md" />
        </div>
      )}

      <button
        onClick={sendImage}
        disabled={!preview || loading}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50"
      >
        {loading ? "Processing..." : "Classify Image"}
      </button>

      {response && !response.error && (
  <div className="mt-4 p-3 bg-gray-700 rounded-md">
    <strong>Common Name:</strong> {response.common_name} <br />
    <strong>Scientific Name:</strong> {response.genus} {response.species} <br />
    <strong>Kingdom:</strong> {response.kingdom} <br />
    <strong>Phylum:</strong> {response.phylum} <br />
    <strong>Class:</strong> {response.class} <br />
    <strong>Order:</strong> {response.order} <br />
    <strong>Family:</strong> {response.family} <br />

    {response.traits && (
      <>
        <strong>Traits:</strong>
        <ul className="list-disc pl-4">
        {Object.entries(response.traits).map(([trait, value]) => (
  <li key={trait}>
    <strong>{trait}:</strong> {String(value)}
  </li>
))}
        </ul>
      </>
    )}

    {response.compatible_biomes && response.compatible_biomes.length > 0 && (
      <>
        <strong>Compatible Biomes:</strong>
        <ul className="list-disc pl-4">
          {response.compatible_biomes.map((biome: string, index: number) => (
            <li key={index}>{biome}</li>
          ))}
        </ul>
      </>
    )}

    <strong>Conservation Status:</strong> {response.conservation_status}
  </div>
)}

      {response?.error && <p className="mt-4 text-red-500">{response.error}</p>}
    </div>
  );
};