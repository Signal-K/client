"use client";

import { useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';
import Webcam from "react-webcam";
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { useActivePlanet } from '@/src/core/context/ActivePlanet';
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Upload, ChevronRight } from "lucide-react";

const CloudUploadEarthCameraComponent = () => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const webcamRef = useRef<Webcam>(null);
    const [loadingContent, setLoadingContent] = useState(false);
    const [buttonPressed, setButtonPressed] = useState(false);
    const [captureImage, setCaptureImage] = useState<string | null>(null);
    const [uploadData, setUploadData] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [comment, setComment] = useState<string>("");
    const [cloudName, setCloudName] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [uploads, setUploads] = useState<string[]>([]);
    const [showCommentBox, setShowCommentBox] = useState(false); 

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
            const file = await convertBase64ToFile(resizedImage, 'screenshot.jpg');
            await uploadImageToSupabase(file);
        };
    };

    const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (loadingContent || buttonPressed) return;
        setButtonPressed(true);
        setTimeout(() => {
            setButtonPressed(false);
            setLoadingContent(true);
        }, 200);
        const files = e.target.files;
        if (files && files.length > 0) { 
            const fileArray = Array.from(files);
            for (const file of fileArray) {
                await uploadImageToSupabase(file);
            };
        };
    };

    const uploadImageToSupabase = async (file: File) => {
        if (!session || !activePlanet) return;
        setIsUploading(true);
        const fileName = `${Date.now()}-${session.user.id}-${file.name}`;
        try {
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('media')
                .upload(fileName, file);

            if (uploadError) {
                console.error('Upload error:', uploadError.message);
            } else if (uploadData) {
                const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${uploadData.path}`;
                const { data: uploadEntry, error: entryError } = await supabase
                    .from('uploads')
                    .insert({
                        author: session.user.id,
                        location: activePlanet.id,
                        source: 'webcam',
                        file_url: url,
                        configuration: JSON.stringify({ filename: fileName }),
                    })
                    .single();

                if (!entryError) {
                    setUploadData(uploadEntry);
                    setUploads(prev => [...prev, url]);
                    setCaptureImage(url);
                    setShowCommentBox(true);
                };
            };
        } catch (err) {
            console.error('Unexpected error during file upload:', err);
        } finally {
            setIsUploading(false);
            setLoadingContent(false);
        };
    };

    const handleSubmitClassification = async (event: React.FormEvent) => {
        event.preventDefault();
        if (uploads.length === 0) return;
        const media = { uploadUrl: uploads[0] };
        const classificationConfiguration = {
            media: media,
            comment: comment,
            cloudName: cloudName,
            location: location,
        };
        try {
            const { data, error } = await supabase
                .from("classifications")
                .insert({
                    content: comment || null,
                    author: session?.user?.id,
                    anomaly: activePlanet?.id,
                    media: JSON.stringify(media),
                    classificationtype: "userUpload-lidar-EarthCloud",
                    classificationConfiguration: classificationConfiguration,
                });
            if (!error) console.log("Classification added successfully", data);
        } catch (err) {
            console.error("Unexpected error during classification insert:", err);
        }
    };

    return (
        <div className="bg-[#2C4F64] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#FF695D] rounded-3xl p-8 shadow-lg">
                {!showCommentBox ? (
                    <>
                        <div className="bg-[#5FCBC3] rounded-lg p-4 aspect-square mb-4">
                            {captureImage ? (
                                <img src={captureImage} alt="Captured" className="w-full h-full object-cover rounded" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#2C4F64] text-white">
                                    <Webcam
                                        ref={webcamRef}
                                        forceScreenshotSourceSize={true}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{ facingMode: "environment" }}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Button onClick={takeScreenshot} className="bg-[#2C4F64] text-white hover:bg-[#1E3D4F]">
                                Capture
                            </Button>
                            <Label htmlFor="file-upload" className="w-full">
                                <Button className="w-full bg-[#2C4F64] text-white hover:bg-[#1E3D4F]">
                                    <Upload className="mr-2 h-4 w-4" /> Upload
                                </Button>
                                <Input
                                    id="file-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={uploadImage}
                                    className="hidden"
                                />
                            </Label>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmitClassification} className="space-y-4">
                        <img src={captureImage || undefined} alt="Captured" className="w-full h-full object-cover rounded" />
                        <Input
                            type="text"
                            placeholder="Name of cloud"
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
                        <Input
                            type="text"
                            placeholder="Add additional comments (optional)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="bg-white text-[#2C4F64] placeholder:text-[#2C4F64]/70"
                        />
                        <Button type="submit" className="w-full bg-[#2C4F64] text-white hover:bg-[#1E3D4F]">
                            <ChevronRight className="mr-2 h-4 w-4" /> Submit
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CloudUploadEarthCameraComponent;

function resizeImage(base64Str: string, maxWidth = 512, maxHeight = 512): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            if (width > height && width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
            } else if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
    });
}

function convertBase64ToFile(base64Str: string, fileName: string): Promise<File> {
    return fetch(base64Str)
        .then((res) => res.arrayBuffer())
        .then((buffer) => new File([buffer], fileName, { type: 'image/jpeg' }));
};
