"use client";

import { useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';
import Webcam from "react-webcam";
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

const Camera = () => {
  const supabase = useSupabaseClient();

  const webcamRef = useRef<Webcam>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);
  const [captureImage, setCaptureImage] = useState<string | null>(null);
  const [play] = useSound('/snap.mp3');

  const takeScreenshot = async () => {
    if (loadingContent || buttonPressed) return;

    setButtonPressed(true);
    setTimeout(() => {
      setButtonPressed(false);
      setLoadingContent(true);
    }, 200);

    play();
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      const resizedImage = await resizeImage(imageSrc);
      await uploadImageToSupabase(resizedImage);
    }
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (loadingContent || buttonPressed) return;

    setButtonPressed(true);
    setTimeout(() => {
      setButtonPressed(false);
      setLoadingContent(true);
    }, 200);

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64Image = await convertFileToBase64(file);
      await uploadImageToSupabase(base64Image);
    }
  };

  const uploadImageToSupabase = async (base64Image: string) => {
    const { data, error } = await supabase.storage.from('your-bucket-name').upload(`images/${Date.now()}.jpg`, base64Image, {
      contentType: 'image/jpeg',
      upsert: true,
    });

    if (error) {
      console.error('Error uploading image:', error.message);
    } else {
      console.log('Image uploaded:', data);
      // setCaptureImage(URL.createObjectURL(base64Image)); // Preview image after upload
    }
    setLoadingContent(false);
  };

  return (
    <>
      <div className="relative w-full h-64">
        <div className={`w-full h-full ${buttonPressed ? 'opacity-50' : ''}`}>
          {loadingContent ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
              style={{
                backgroundImage: `url(${captureImage})`,
              }}
            />
          ) : (
            <Webcam
              onClick={() => {
                // trigger input file upload 
                const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                fileInput?.click();
              }}
              ref={webcamRef}
              forceScreenshotSourceSize={true}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                facingMode: "environment",
              }}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>
      {/* input file upload that is hidden and triggered if someone clicks on the webcam */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        onChange={uploadImage} 
        className="hidden" 
      />

      <div className="text-center mt-4">
        {loadingContent ? (
          <div className="flex flex-col items-center">
            <div className="mt-4 animate-bounce">
              <div className="loader" />
              <div className="loader" />
              <div className="loader" />
            </div>
            <span>
              <div className="text-lg font-semibold">Processing</div>
            </span>
          </div>
        ) : (
          <div>
            <div className="text-2xl font-bold">Camera</div>
            <div className="text-lg text-gray-500">Capture a photo of anything</div>
          </div>
        )}
      </div>
      {/* <PhotoFooter takeScreenshot={takeScreenshot} /> */}
    </>
  );
};

export default Camera;

// Function to resize the image
function resizeImage(base64Str: string, maxWidth = 512, maxHeight = 512): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = maxWidth;
      const MAX_HEIGHT = maxHeight;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpg", 0.8));
    };
  });
}

// Function to convert a file to a Base64 string
async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}