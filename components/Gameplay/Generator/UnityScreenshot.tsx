import React, { useEffect, useRef } from "react";
import html2canvas from 'html2canvas';

interface UnityScreenshotProps {
    unityContainerId: string;
};

const UnityScreenshot: React.FC<UnityScreenshotProps> = ({ unityContainerId }) => {
    const screenshotRef = useRef<HTMLCanvasElement | null>(null);
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
    }, [screenshotRef]);

    return (
        <div>
            <div id={unityContainerId}></div>
            <button onClick={captureScreenshot}>Capture Screenshot</button>
            {screenshotRef.current && <img src={screenshotRef.current.toDataURL()} />}
        </div>
    );
};

export default UnityScreenshot;