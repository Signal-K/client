"use client";

import React, { useEffect, useRef, useState } from "react";
import useSound from "use-sound";
import Webcam from "react-webcam";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const Camera = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const webcamRef = useRef<Webcam>(null);
    // const [play] = useSound("/assets/audio/snap.mp3");

    const [loadingContent, setLoadingContent] = useState(false);
    const [buttonPressed, setButtonPressed] = useState(false);
    const [captureImage, setCaptureImage] = useState<string | null>(null);

    const takeScreenshot = async () => {
        if (loadingContent || buttonPressed) return;

        setButtonPressed(true);
        setTimeout(() => {
            setButtonPressed(false);
            setLoadingContent(true);
        }, 200);

        // play();
        const imageSrc = webcamRef.current?.getScreenshot();
        if (imageSrc) {
            // const resizedImage = await resizeImage(imageSrc);
            // await uploadImageToSupabase(resizedImage);
        }
    }
}