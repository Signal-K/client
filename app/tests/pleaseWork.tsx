"use client";

import { useState, useRef } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { Button } from "@/components/ui/button";
import { MailIcon, RecycleIcon } from "lucide-react";

export default function ChatGPTImageClassifier() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const { activePlanet } = useActivePlanet();

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [useWebcam, setUseWebcam] = useState(false);
  const [location, setLocation] = useState<string>("");
  const [comment, setComment] = useState<string>("");
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

  // Upload image to Supabase
  const uploadImageToSupabase = async (file: File) => {
    if (!image) return;
    setLoading(true);

    const fileName = `${Date.now()}-${file.name}`;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        return;
      };

      if (uploadData) {
        const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/uploads/${uploadData.path}`;
        
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
          .single();

        if (entryError) {
          console.error("Entry error:", entryError.message);
        } else {
          console.log("Upload entry:", uploadEntry);
        };
      };
    } catch (err) {
      console.error("Unexpected error during file upload:", err);
    } finally {
      setLoading(false);
    };
  };

  const saveLifeEntity = async () => {
    if (!session) {
      return;
    };

    try {
      const {
        data: entityEntry, error: entityError
      } = await supabase
        .from('zoo')
        .insert({
          author: session?.user?.id,
          owner: session?.user?.id,
          location: activePlanet.id, // fill this in
          configuration: null, // fill this in
          uploaded: '' // fill this in
        })
    } catch (err: any) {
      
    }
  }

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
      <div className="mt-4">
        <p className="text-blue-300">Your location</p>
        <input
          type="text"
          placeholder="Enter your location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-2 bg-gray-900 text-white border border-gray-700 rounded-md"
        />
        <p className='text-blue-300'>Any additional comments</p>
        <textarea
          placeholder="Add a comment (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full mt-2 p-2 bg-gray-900 text-white border border-gray-700 rounded-md"
        />
      </div>

      <button
        onClick={() => uploadImageToSupabase(image!)}
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload Image"}
      </button>

      {/* After we add the entry to uploads */}
      <div className="mt-4">
        <h3 className="text-md text-blue-400">Decision time (rename this)</h3>
        <Button
          variant='outline'
          className="border-2 border-black hover:translate-y-[-2px] hover:translate-x-[2px] transitio-all hover:shadow-none"
          // onClick={}
          // Functionality - add a new value to the 'zoo' table
        >
          Send entity to your greenhouse (first station, then go from there)
          <MailIcon className="h-8 w-8 text-blue-200" />
        </Button>
        <Button
          variant='outline'
          className="border-2 border-black hover:translate-y-[-2px] hover:translate-x-[2px] transition-all hover:shadow-none"
          // onClick={}
          // Functionality - update entry in `uploads` table to set `Archived` to True (boolean)
        >
          Release "KINGDOM"
          <RecycleIcon className="h-8 w-8 text-blue-200" />
        </Button>
      </div>
    </div>
  );
};