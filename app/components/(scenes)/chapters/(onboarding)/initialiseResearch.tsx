"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";

const content = [
    "Great work on your first classification! Now, let's take the next step in advancing your research. Here's what you can do next: ",

    "You can unlock new structures to participate in different project groups - click on the Research Station, then select 'Research Technology' from the menu. Spend your classification points to unlock new structures to enhance your research abilities.",
    "You can keep working in your current discipline and discover new things - select the module you want to upgrade, and click the 'Research' button within that structure. This will allow you to unlock more modules to classify.",
    "Continue your current research and make some more classifications with your current area of interest.",

    "You can research new structures and modules whenever you'd like. More content is constantly being added to Star Sailors, so check back on your planet regularly.",
];

export default function IntroduceUserToResearch({ closeModal }: { closeModal: () => void }) {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const [page, setPage] = useState(0);
    const [textContent, setText] = useState("");

    const textSpeed = 15;

    useEffect(() => {
        setText("");
        const text = content[page];
        let i = 0;
        const intervalId = setInterval(() => {
            setText(text.slice(0, i));
            i++;
            if (i > text.length) clearInterval(intervalId);
        }, textSpeed);

        return () => clearInterval(intervalId);
    }, [page]);

    const handleNext = () => {
        if (page < content.length - 1) {
            setPage(page + 1);
        }
    };

    const handlePrevious = () => {
        if (page > 0) {
            setPage(page - 1);
        }
    };

    const handleFinish = async () => {
        if (!session) {
            return;
        }

        const researchStructureData = {
            owner: session?.user?.id,
            item: 3106,
            quantity: 1,
            notes: "Completed after the user was introduced to research",
            anomaly: activePlanet?.id || 69,
            configuration: {
                "Uses": 100,
            },
        };

        const initialiseResearchMissionData = {
            user: session.user.id,
            time_of_completion: new Date().toISOString(),
            mission: 10000000410,
        };

        try {
            const { error: inventoryError } = await supabase
                .from("inventory")
                .insert([researchStructureData]);

            if (inventoryError) {
                throw inventoryError;
            }

            const { error: missionError1 } = await supabase
                .from('missions')
                .insert([initialiseResearchMissionData]);

            if (missionError1) {
                throw missionError1;
            }

            // Close the modal after successful insertions
            closeModal();
        } catch (error: any) {
            console.error("Error adding research structure to inventory: ", error.message);
        }
    };

    return (
        <div className="flex items-center justify-center bg-[#2C4F64] text-[#85DDA2] p-4">
            <div className="w-full max-w-2xl bg-[#2C4F64] border-2 border-[#5FCBC3] rounded-lg p-8 shadow-lg">
                <motion.div
                    key={page}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="h-48 flex items-center justify-center text-center text-xl"
                >
                    {textContent}
                </motion.div>
                <div className="flex justify-between mt-8">
                    <button
                        onClick={handlePrevious}
                        disabled={page === 0}
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-[#5FCBC3] text-[#2C4F64] disabled:opacity-50"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="text-[#5FCBC3]">
                        {page + 1} / {content.length}
                    </div>
                    <button
                        onClick={handleNext}
                        disabled={page === content.length - 1}
                        className="flex items-center justify-center w-12 h-12 rounded-full bg-[#5FCBC3] text-[#2C4F64] disabled:opacity-50"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {page === content.length - 1 && (
                    <button
                        onClick={handleFinish}
                        className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
                    >
                        Continue your research
                    </button>
                )}
            </div>
        </div>
    );
};