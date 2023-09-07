import React, { createRef, useEffect, useRef } from "react";
import html2canvas from 'html2canvas';
import { useScreenshot, createFileName } from 'use-react-screenshot';

interface UnityScreenshotProps {
    unityContainerId: string;
};

const UnityScreenshot: React.FC<UnityScreenshotProps> = ({ unityContainerId }) => {
    const screenshotRef = useRef<HTMLCanvasElement | null>(null);
    const ref = createRef();
    const [image, takeScreenshot] = useScreenshot({
        type: "image/jpeg",
        quality: 1.0,
    })

    const download = ( image, { name = "img", extension = "jpg" } = {}) => {
        const a = document.createElement('a');
        a.href = image;
        a.download = createFileName(extension, name);
        a.click();
    };

    const downloadScreenshot = () => takeScreenshot(ref.current).then(download);
    
    const captureScreenshot = () => {
        if (!screenshotRef.current) { return; };
        console.log("Clicked")

        html2canvas(document.getElementById(unityContainerId) as HTMLElement).then((canvas) => {
            const screenshotDataUrl = canvas.toDataURL();
            // Move the data url to state in separate function
        });
    };

    useEffect(() => {
        console.log(screenshotRef);
    }, []);

    return (
        <div>
            <div id={unityContainerId}></div>
            <button onClick={captureScreenshot}>Capture Screenshot</button>
            {screenshotRef.current && <img src={screenshotRef.current.toDataURL()} />}
        </div>
    );
};

export default UnityScreenshot;