import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import * as markerjs2 from "markerjs2";

interface ImageProps {
    src: string
};

export default function ImageAnnotation({ src }: ImageProps) {
    const imageRef = useRef<HTMLImageElement>(null);
    const [markerArea, setMarkerArea] = useState<markerjs2.MarkerArea | null>(null);
    const [annotationState, setAnnotationState] = useState<string | null>(null);

    useEffect(() => {
        if (imageRef.current) {
            const ma = new markerjs2.MarkerArea(imageRef.current);
            setMarkerArea(ma);

            // Add render event listener to update the image after annotations
            ma.addEventListener("render", (event) => {
                if (imageRef.current) {
                    setAnnotationState(JSON.stringify(ma.getState()));
                    imageRef.current.src = event.dataUrl;
                }
            });

            // Add close event listener to save the annotation state
            ma.addEventListener("close", () => {
                setAnnotationState(JSON.stringify(ma.getState()));
            });
        }
    }, []);

    // Show MarkerArea to start annotation process
    const showMarkerArea = () => {
        if (markerArea) {
            if (annotationState) {
                markerArea.restoreState(JSON.parse(annotationState)); // Restore previous annotations
            }
            markerArea.show();
        }
    };

    // Download the annotated image
    const downloadImage = () => {
        if (imageRef.current) {
            const dataUrl = imageRef.current.src;
            if (dataUrl.startsWith('data:image')) {
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = 'annotated_image.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                console.error('No base64 data to download');
            }
        }
    };

    return (
        <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>Image</CardTitle>
                <CardDescription>Annotate the image using marker.js</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-10 space-y-4">
                <div className="flex space-x-2">
                    <Button onClick={showMarkerArea}>Start Annotating</Button>
                    <Button onClick={downloadImage} disabled={!annotationState}>Download Annotated Image</Button>
                </div>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                    {/* Ensure this image tag is used for annotation */}
                    <img
                        ref={imageRef}
                        src={src}
                        alt="Annotation"
                        crossOrigin="anonymous"
                        className="max-w-full h-auto"
                    />
                </div>
            </CardContent>
        </Card>
    );
};