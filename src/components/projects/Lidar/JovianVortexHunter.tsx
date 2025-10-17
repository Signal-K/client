'use client';

import React, { useState, useEffect } from "react"; 
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import ImageAnnotator from "../(classifications)/Annotating/Annotator";
import { Button } from "@/src/components/ui/button";
import TutorialContentBlock, { createTutorialSlides } from "../TutorialContentBlock";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; 

type Anomaly = {
  id: number;
  anomalySet: string;
  content?: any;
};

interface Props {
    anomalyid: number;
};

export function StarterJovianVortexHunter({
    anomalyid
}: Props) {
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/telescope/lidar-jovianVortexHunter/${anomalyid}.png`;
    const [showTutorial, setShowTutorial] = useState(false);

    // Tutorial slides for Jovian Vortex Hunter
    const tutorialSlides = createTutorialSlides([
        {
            title: "Jovian Vortex Hunter - Gas Giant Atmosphere Analysis",
            text: "Welcome! In this workflow, you will be identifying the type of atmosphere feature visible in satellite images of gas giants in your network. The images you will see are cropped from your automated satellite data, and correspond to an area of ~7000x7000km on nearby gaseous planets.",
            image: "/assets/Docs/Satellites/JovianVortexHunter/Step1.png"
        },
        {
            title: "Four Main Categories",
            text: "There are four main categories that we are interested in. The first three (vortex, turbulent region and cloud bands) are discrete atmospheric features. The last option is for when the image either shows no large scale structure, or if it is unclear.",
            image: "/assets/Docs/Satellites/JovianVortexHunter/Step2.png"
        },
        {
            title: "Identifying Vortices",
            text: "A vortex is an atmospheric feature that is generally round/elliptical in shape. On Earth, an example is a hurricane/cyclone/typhoon. On gaseous planets, there are examples of both cyclones and anti-cyclones (spin in the opposite direction of cyclones), and they appear in a variety of sizes and colours. If you see any feature that has a compact oval shape, select this option.",
            image: "/assets/Docs/Satellites/JovianVortexHunter/Step3.png"
        },
        {
            title: "Turbulent Features",
            text: "Turbulent features are ubiquitous on gas giants. These are cloud structures that don't have a definite shape, but form lots of curls and swirls. Sometimes these structures swirl inwards and appear to form vortices, as shown below. These images should be labelled with the vortices option and the turbulent region option.",
            image: "/assets/Docs/Satellites/JovianVortexHunter/Step4.png"
        },
        {
            title: "Cloud Bands",
            text: "Sometimes, there are gradients in color that are mostly horizontal in direction. These are the separation between different cloud bands (usually near the equator).",
            image: "/assets/Docs/Satellites/JovianVortexHunter/Step5.png"
        },
        {
            title: "No Visible Structure",
            text: "Sometimes, there might be no features of interest in the image. In this case, select the no visible structure option.",
            image: "/assets/Docs/Satellites/JovianVortexHunter/Step6.png"
        },
        {
            title: "Multiple Classifications",
            text: "Don't forget that you can select multiple options. Now, let's get started!",
            image: "/assets/Docs/Satellites/JovianVortexHunter/Step7.png"
        }
    ]);

    const [currentSlide, setCurrentSlide] = useState(0);
    
    const nextSlide = () => {
        if (currentSlide < tutorialSlides.length - 1) {
            setCurrentSlide(prev => prev + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    return (
        <div className="rounded-lg">
            <div className="mb-4">
                <Button onClick={() => setShowTutorial(!showTutorial)} variant="outline">
                    {showTutorial ? 'Hide Tutorial' : 'Show Tutorial'}
                </Button>
            </div>

            {/* Tutorial slides - shown when user clicks button */}
            {showTutorial ? (
                <div className="w-full max-w-3xl mx-auto bg-[#1D2833] rounded-lg p-4">
                    <h2 className="text-lg font-bold text-white mb-2">
                        {tutorialSlides[currentSlide].title}
                    </h2>
                    
                    {tutorialSlides[currentSlide].image && (
                        <div className="mb-3">
                            <img 
                                src={tutorialSlides[currentSlide].image} 
                                alt={tutorialSlides[currentSlide].title}
                                className="w-full max-h-[300px] object-contain rounded-lg"
                            />
                        </div>
                    )}
                    
                    <p className="text-white/90 text-sm mb-4 leading-relaxed">
                        {tutorialSlides[currentSlide].text}
                    </p>

                    <div className="flex justify-between items-center">
                        <Button 
                            onClick={prevSlide} 
                            disabled={currentSlide === 0}
                            variant="outline"
                            size="sm"
                        >
                            Previous
                        </Button>
                        
                        <span className="text-white text-sm">
                            {currentSlide + 1} / {tutorialSlides.length}
                        </span>
                        
                        {currentSlide < tutorialSlides.length - 1 ? (
                            <Button onClick={nextSlide} variant="default" size="sm">
                                Next
                            </Button>
                        ) : (
                            <Button onClick={() => setShowTutorial(false)} variant="default" size="sm">
                                Start Classification
                            </Button>
                        )}
                    </div>
                </div>
            ) : (
                /* Classification Interface - only shown when tutorial is hidden */
                <div className="flex flex-col items-center">
                    <div className="w-full max-w-4xl">
                        <ImageAnnotator
                            anomalyId={anomalyid.toString()}
                            anomalyType="lidar-jovianVortexHunter"
                            missionNumber={20000007}
                            assetMentioned={imageUrl}
                            initialImageUrl={imageUrl}
                            annotationType="JVH"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export function LidarJVHSatelliteWithId() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [parentClassificationId, setParentClassificationId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showTutorial, setShowTutorial] = useState<boolean>(false);

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

    async function fetchAnomaly() {
        if (!session) {
            setLoading(false);
            return;
        }

        try {
            const { data: anomalyData, error: anomalyError } = await supabase
                .from('anomalies')
                .select('*')
                .eq('author', session.user.id)
                .eq('anomalySet', 'lidar-jovianVortexHunter')
                .limit(1)
                .maybeSingle();

            if (anomalyError) throw anomalyError;

            if (anomalyData) {
                setAnomaly(anomalyData);
                setImageUrl(`${supabaseUrl}/storage/v1/object/public/telescope/lidar-jovianVortexHunter/${anomalyData.id}.png`);
            } else {
                setAnomaly(null);
                setImageUrl(null);
            }
        } catch (error: any) {
            console.error('Error fetching anomaly:', error.message);
            setAnomaly(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAnomaly();
    }, [session, supabase]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!anomaly || !imageUrl) {
        return <p>No anomaly found.</p>;
    }

    const startTutorial = () => setShowTutorial(true);

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#E5EEF4] to-[#D8E5EC] px-4 py-6 overflow-hidden">
            <div className="w-full max-w-4xl h-full flex flex-col rounded-xl bg-white shadow-lg p-4 overflow-hidden">
                <div className="mb-4">
                    <Button onClick={startTutorial} variant="outline">
                        Show Tutorial
                    </Button>
                </div>
                
                {showTutorial && <StarterJovianVortexHunter anomalyid={Number(anomaly.id)} />}

                {!showTutorial && (
                    <ImageAnnotator
                        anomalyId={anomaly.id.toString()}
                        anomalyType="lidar-jovianVortexHunter"
                        missionNumber={200000072}
                        assetMentioned={imageUrl}
                        structureItemId={3105}
                        initialImageUrl={imageUrl}
                        annotationType="JVH"
                        parentClassificationId={parentClassificationId ?? undefined}
                    />
                )}
            </div>
        </div>
    );
};