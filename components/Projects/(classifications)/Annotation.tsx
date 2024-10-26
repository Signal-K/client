import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import * as markerjs2 from "markerjs2";

interface ImageProps {
    src: string;
    onUpload: (dataUrl: string) => Promise<void>;
}

export default function ImageAnnotation({ src, onUpload }: ImageProps) {
    const imageRef = useRef<HTMLImageElement>(null);
    const [markerArea, setMarkerArea] = useState<markerjs2.MarkerArea | null>(null);
    const [annotationState, setAnnotationState] = useState<string | null>(null);

    useEffect(() => {
        if (imageRef.current) {
            const ma = new markerjs2.MarkerArea(imageRef.current);
            setMarkerArea(ma);

            ma.addEventListener("render", (event) => {
                if (imageRef.current) {
                    setAnnotationState(JSON.stringify(ma.getState()));
                    imageRef.current.src = event.dataUrl;
                }
            });

            ma.addEventListener("close", () => {
                setAnnotationState(JSON.stringify(ma.getState()));
            });

            ma.show(); // Automatically show the marker area when initialized
        }
    }, []);

    const showMarkerArea = () => {
        if (markerArea) {
            if (annotationState) {
                markerArea.restoreState(JSON.parse(annotationState));
            }
            markerArea.show();
        }
    };

    const downloadImage = async () => {
        if (imageRef.current) {
            const dataUrl = imageRef.current.src; // Get the annotated image data URL
            await onUpload(dataUrl);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Annotate Image</CardTitle>
                <CardDescription>Click the button to start annotating the image.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center">
                    <img
                        src={src}
                        alt="Annotated Image"
                        ref={imageRef}
                        className="w-full h-auto max-w-md rounded-md"
                    />
                    <Button className="mt-4" onClick={showMarkerArea}>Annotate</Button>
                    <Button className="mt-2" onClick={downloadImage}>Upload Annotation</Button>
                </div>
            </CardContent>
        </Card>
    );
}