"use client";

import { useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';
import Webcam from "react-webcam";
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ChevronRight, Camera } from 'lucide-react';

const STRUCTURE_OPTIONS: Record<string, string[]> = {
    Telescope: ["Sunspot", "Asteroid", "Planet", "Star", "Nebula", "Crater"],
    LIDAR: ["Planetary Cloud", "Neutrino", "Earth Cloud", "Surface"],
    Zoodex: ["Bird", "Penguin", "Owl", "Other Animal"],
};

const FreeformUploadData = () => {
    const supabase = useSupabaseClient(); 
    const session = useSession();

    const webcamRef = useRef<Webcam>(null);
    const [loadingContent, setLoadingContent] = useState(false);
    const [buttonPressed, setButtonPressed] = useState(false);
    const [captureImage, setCaptureImage] = useState<string | null>(null);
    const [uploadData, setUploadData] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [comment, setComment] = useState<string>("");
    const [cloudName, setCloudName] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [anomalyType, setAnomalyType] = useState<string>("");
    const [structure, setStructure] = useState<string>("");
    const [uploads, setUploads] = useState<string[]>([]);
    const [showForm, setShowForm] = useState(false);

    const takeScreenshot = async () => {
        if (loadingContent || buttonPressed) return;
        setButtonPressed(true); 
        setTimeout(() => {
            setButtonPressed(false);
            setLoadingContent(true);
        }, 200);

        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            const resizedImage = await resizeImage(imageSrc);
            setCaptureImage(resizedImage);
            setShowForm(true);
        }
    };

    const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (loadingContent || buttonPressed) return;
      setButtonPressed(true);
      setLoadingContent(true);
      
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = async () => {
          const resizedImage = await resizeImage(reader.result as string);
          setCaptureImage(resizedImage);
          setShowForm(true);
          setButtonPressed(false);
          setLoadingContent(false);
        };
        reader.readAsDataURL(file);
      } else {
        setButtonPressed(false);
        setLoadingContent(false);
      }
    };

    const handleSubmitClassification = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!captureImage && comment.trim() === "") {
            console.error("You must upload a file or add a comment.");
            return;
        }

        let imageUrl = captureImage;
        if (captureImage) {
            const file = await convertBase64ToFile(captureImage, 'screenshot.jpg');
            const fileName = `${Date.now()}-${session?.user?.id}-${file.name}`;
            try {
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('media')
                    .upload(fileName, file);

                if (uploadError) {
                    console.error('Upload error:', uploadError.message);
                } else if (uploadData) {
                    imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${uploadData.path}`;
                }
            } catch (err) {
                console.error('Unexpected error during file upload:', err);
            }
        }

        const classificationConfiguration = {
            media: imageUrl ? { uploadUrl: imageUrl } : null,
            comment: comment,
            cloudName: cloudName,
            location: location,
            anomalyType: anomalyType,
            structure: structure,
        };

        try {
            const { data, error } = await supabase
                .from('uploads')
                .insert({
                    content: comment || null,
                    author: session?.user?.id,
                    source: 'freeform',
                    file_url: imageUrl ? imageUrl : null,
                    configuration: classificationConfiguration,
                });
        
            if (error) {
                console.error('Supabase error:', error.message);
            } else {
                console.log('Classification added successfully', data);
                // Reset form and go back to camera view
                setShowForm(false);
                setCaptureImage(null);
                setComment("");
                setCloudName("");
                setLocation("");
                setAnomalyType("");
                setStructure("");
            }
        } catch (err) {
            console.error('Unexpected error during classification insert:', err);
        }
    };

    return (
        <div className="bg-[#2C4F64] flex items-center justify-center w-full h-screen">
            <div className="w-full h-full bg-[#FF695D] p-4 md:p-8">
                {!showForm ? (
                    <div className="space-y-4">
                        <div className="bg-[#5FCBC3] rounded-lg p-4 h-[calc(100%-80px)] mb-4">
                            <Webcam
                                ref={webcamRef}
                                forceScreenshotSourceSize={true}
                                screenshotFormat="image/jpeg"
                                videoConstraints={{ facingMode: "environment" }}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Button onClick={takeScreenshot} className="bg-[#2C4F64] text-white hover:bg-[#1E3D4F]">
                                <Camera className="mr-2 h-4 w-4" /> Capture
                            </Button>
                            <Label htmlFor="file-upload" className="w-full">
                                <Button type="button" className="w-full bg-[#2C4F64] text-white hover:bg-[#1E3D4F]">
                                    <Upload className="mr-2 h-4 w-4" /> Upload
                                </Button>
                            </Label>
                            <Input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={uploadImage}
                                className="hidden"
                            />
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmitClassification} className="space-y-4 h-full flex flex-col">
                        <div className="bg-[#5FCBC3] rounded-lg p-4 h-40 mb-4">
                            {captureImage && (
                                <img src={captureImage} alt="Captured" className="w-full h-full object-cover rounded" />
                            )}
                        </div>
                        <Input
                            type="text"
                            placeholder="Name of data point/content/post"
                            value={cloudName}
                            onChange={(e) => setCloudName(e.target.value)}
                            className="bg-white text-[#2C4F64] placeholder:text-[#2C4F64]/70"
                        />
                        <Input
                            type="text"
                            placeholder="Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="bg-white text-[#2C4F64] placeholder:text-[#2C4F64]/70"
                        />
                        <div className="grid grid-cols-1 gap-4">
                            <Label htmlFor="anomalyType" className="text-white">Structure/Project group</Label>
                            <select
                                id="anomalyType"
                                value={anomalyType}
                                onChange={(e) => setAnomalyType(e.target.value)}
                                className="bg-white text-[#2C4F64] rounded p-2"
                            >
                                <option value="" disabled>Select Structure</option>
                                {Object.keys(STRUCTURE_OPTIONS).map((structure) => (
                                    <option key={structure} value={structure}>{structure}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <Label htmlFor="structure" className="text-white">Anomaly</Label>
                            <select
                                id="structure"
                                value={structure}
                                onChange={(e) => setStructure(e.target.value)}
                                className="bg-white text-[#2C4F64] rounded p-2"
                                disabled={!anomalyType}
                            >
                                <option value="" disabled>Select anomaly/entity type</option>
                                {anomalyType && STRUCTURE_OPTIONS[anomalyType].map((struct) => (
                                    <option key={struct} value={struct}>{struct}</option>
                                ))}
                            </select>
                        </div>
                        <textarea
                            placeholder="Add additional comments (optional)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="bg-white text-[#2C4F64] placeholder:text-[#2C4F64]/70 p-2 rounded-md w-full flex-grow"
                        />
                        <Button type="submit" className="w-full bg-[#2C4F64] text-white hover:bg-[#1E3D4F]">
                            <ChevronRight className="mr-2 h-4 w-4" />
                            Submit
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FreeformUploadData;

function resizeImage(base64Str: string, maxWidth = 512, maxHeight = 512): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const widthRatio = maxWidth / img.width;
            const heightRatio = maxHeight / img.height;
            const bestRatio = Math.min(widthRatio, heightRatio);
            const newWidth = img.width * bestRatio;
            const newHeight = img.height * bestRatio;
            canvas.width = newWidth;
            canvas.height = newHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, newWidth, newHeight);
            resolve(canvas.toDataURL());
        };
    });
};

function convertBase64ToFile(base64Str: string, filename: string): Promise<File> {
    return fetch(base64Str)
        .then((res) => res.arrayBuffer())
        .then((buf) => new File([buf], filename, { type: 'image/jpeg' }));
};

