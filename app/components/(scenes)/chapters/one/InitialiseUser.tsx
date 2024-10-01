"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";

import { zoodexDataSources, telescopeDataSources, lidarDataSources } from "@/app/components/(structures)/Data/ZoodexDataSources";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

interface Category {
    title: string;
    description: string;
    details: { name: string; description: string; techId: number; tutorialMission: number; activeStructure: number; identifier: string; }[];
}

const combineCategories = (): Category[] => {
    return [
        {
            title: "Biological Projects", // Zoodex
            description: "Explore biological research projects related to animals and biodiversity.",
            details: zoodexDataSources.flatMap(source => source.items.map(item => ({
                name: item.name,
                description: item.description,
                tutorialMission: item.tutorialMission,
                activeStructure: item.activeStructure,
                identifier: item.identifier,
                techId: item.techId,
            }))),
        },
        {
            title: "Space Investigations", // Telescope
            description: "Dive into astronomical research focused on planets, stars, and cosmic phenomena.",
            details: telescopeDataSources.flatMap(source => source.items.map(item => ({
                name: item.name,
                description: item.description,
                tutorialMission: item.tutorialMission,
                activeStructure: item.activeStructure,
                identifier: item.identifier,
                techId: item.techId,
            }))), 
        },
        {
            title: "Meteorological Studies", // Lidar
            description: "Study weather patterns and cloud formations on various planets.",
            details: lidarDataSources.flatMap(source => source.items.map(item => ({
                name: item.name,
                description: item.description,
                tutorialMission: item.tutorialMission,
                activeStructure: item.activeStructure,
                identifier: item.identifier,
                techId: item.techId,
            }))),
        },
    ];
};

export default function InitialiseChapterOneUser() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet, updatePlanetLocation } = useActivePlanet();

    const [step, setStep] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedMission, setSelectedMission] = useState<{
        [x: string]: any; name: string; tutorialMission: number; activeStructure: number; identifier: string 
} | null>(null);
    const [isManualProgress, setIsManualProgress] = useState(false);
    const [activeTutorialMission, setActiveTutorialMission] = useState<number | null>(null);
    const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

    const categories = combineCategories();

    const introSteps = [
        "Welcome to Star Sailors!",
        "Join us on a journey across the cosmos to discover and catalogue unique anomalies and help real scientists with their research",
        "You'll be starting your training on Earth. You'll be able to choose to work on any projects you'd like - let's pick your first now!"
    ];

    useEffect(() => {
        if (step < introSteps.length && !isManualProgress) {
            const timer = setTimeout(() => setStep(step + 1), 4500);
            return () => clearTimeout(timer);
        }
    }, [step, isManualProgress]);

    const handleBack = () => {
        if (step > 0) {
            setStep(step - 1);
        } else {
            setIsManualProgress(true);
        }

        setSelectedCategory(null);
        setSelectedMission(null);
        setConfirmationMessage(null);
    };

    const handleNext = () => {
        if (step < introSteps.length - 1) {
            setStep(step + 1);
        } else if (step === introSteps.length - 1) {
            setStep(introSteps.length);
        }
    };

    const handleCategoryClick = (category: Category) => {
        setSelectedCategory(category);
        setSelectedMission(null);
        setConfirmationMessage(null);
    };

    const handleMissionSelect = (mission: { name: string; techId: number; tutorialMission: number; activeStructure: number; identifier: string }) => {
        setSelectedMission(mission);
        setActiveTutorialMission(mission.tutorialMission);
        setConfirmationMessage(null);
    };

    const handleBackToCategories = () => {
        setSelectedCategory(null);
    };

    const handleConfirmMission = async () => {
        if (!session?.user?.id || !selectedMission) return;

        const initialiseUserMissionData = {
            user: session.user.id,
            time_of_completion: new Date().toISOString(),
            mission: 10000001,
        };

        const chooseFirstClassificationMissionData = {
            user: session.user.id,
            time_of_completion: new Date().toISOString(),
            mission: 10000002,
        };

        const structureCreationData = {
            owner: session?.user.id,
            item: selectedMission.activeStructure,
            quantity: 1,
            notes: "Created for user's first classification",
            anomaly: activePlanet?.id || 69,
            configuration: {
                "Uses": 10,
                "missions unlocked": [selectedMission.identifier],
            },
        };

        const researchedStructureData = {
            user_id: session?.user.id,
            tech_type: selectedMission.activeStructure,
            tech_id: selectedMission.techId,
            created_at: new Date().toISOString(),
        };

        try {
            updatePlanetLocation(69);
            const { error: missionError1 } = await supabase
                .from('missions')
                .insert([initialiseUserMissionData]);

            if (missionError1) {
                throw missionError1;
            };

            const { error: missionError2 } = await supabase
                .from('missions')
                .insert([chooseFirstClassificationMissionData]);

            if (missionError2) {
                throw missionError2;
            };

            const { error: inventoryError } = await supabase
                .from("inventory")
                .insert([structureCreationData]);

            if (inventoryError) {
                throw inventoryError;
            };

            const { error: researchedError } = await supabase
                .from("researched")
                .insert([researchedStructureData]);

            setConfirmationMessage("Mission confirmed and added successfully!");
        } catch (error: any) {
            setConfirmationMessage(`Error: ${error.message}`);
        };
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
                body {
                    font-family: 'Space Grotesk', sans-serif;
                }
            `}</style>
            <div className="max-w-4xl w-full bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                <div className="p-8 space-y-6">
                    <AnimatePresence mode="wait">
                        {step < introSteps.length ? (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -28 }}
                                transition={{ duration: 0.5 }}
                                className="text-2xl font-light text-center h-20 flex items-center justify-center"
                            >
                                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                                    {introSteps[step]}
                                </span>
                            </motion.div>
                        ) : selectedCategory ? (
                            selectedMission ? (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-3xl font-semibold text-center bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                                        {selectedMission.name}
                                    </h2>
                                    <p className="text-gray-200 text-center">Part of ({selectedCategory.description})</p>
                                    <button
                                        onClick={handleConfirmMission}
                                        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
                                    >
                                        Confirm Mission
                                    </button>
                                    {confirmationMessage && (
                                        <p className="text-center text-yellow-300">{confirmationMessage}</p>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-3xl font-semibold text-center bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                                        Missions in {selectedCategory.title}
                                    </h2>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        {selectedCategory.details.map((mission) => (
                                            <button
                                                key={mission.identifier}
                                                onClick={() => handleMissionSelect(mission)}
                                                className="w-48 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
                                            >
                                                {mission.name}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={handleBackToCategories}
                                        className="mt-6 text-blue-300 hover:text-blue-500 font-medium transition-colors duration-300"
                                    >
                                        Back to Categories
                                    </button>
                                </motion.div>
                            )
                        ) : (
                            <motion.div
                                key="categories"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h2 className="text-3xl font-semibold text-center bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                                    Choose a Category
                                </h2>
                                <div className="flex flex-col space-y-4">
                                    {categories.map((category) => (
                                        <button
                                            key={category.title}
                                            onClick={() => handleCategoryClick(category)}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
                                        >
                                            {category.title}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="flex justify-between p-4 bg-gray-800 border-t border-gray-700">
                    <button onClick={handleBack} className="text-gray-400 hover:text-white transition-colors duration-300">
                        <ChevronLeft className="w-5 h-5 inline" />
                        Back
                    </button>
                    <button onClick={handleNext} className="text-gray-400 hover:text-white transition-colors duration-300">
                        <ChevronRight className="w-5 h-5 inline" />
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};