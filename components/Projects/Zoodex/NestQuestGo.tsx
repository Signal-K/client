"use client";

import React, { useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { StructureInfo } from "@/components/(structures)/structureInfo";
import ClassificationForm from "@/components/(classifications)/PostForm";
import { NestQuestGoClassificationForm } from "@/components/(classifications)/temp/NestQuestGoForm";

interface ZoodexProps {
  anomalyId: string;
};
 
export const NestQuestGo: React.FC<ZoodexProps> = ({
    anomalyId
}) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/zoodex/zoodex-nestQuestGo/${anomalyId}/1.jpeg`;

    const [part, setPart] = useState(1);
    const [line, setLine] = useState(1);

    const nextLine = () => setLine((prevLine) => prevLine + 1);
    const nextPart = () => {
        setPart(2);
        setLine(1);
    };

    const tutorialContent = (
        <div className="flex flex-col items-start gap-4 pb-4 relative w-full max-w-lg">
            <div className="flex items-center">
                <img
                    src="/assets/Captn.jpg"
                    alt="Captain Cosmos Avatar"
                    className="w-12 h-12 rounded-full bg-[#303F51]"
                />
                <h3 className="text-xl font-bold text-[#85DDA2] mt-2 ml-4">Capt'n Cosmos</h3>
            </div>
            <div className="p-4 bg-[#2C3A4A] border border-[#85DDA2] rounded-md shadow-md relative w-full">
                <div className="relative">
                    <div className="absolute top-1/2 left-[-16px] transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-[#2C3A4A] border-r-8 border-r-transparent"></div>
                    {part === 1 && (
                        <>
                            {line === 1 && (
                                <p className="text-[#EEEAD1]">
                                    Hello, and welcome to the Nest Quest Go Classification
                                </p>
                            )}
                            {line === 2 && (
                                <p className="text-[#EEEAD1]">
                                    We are going to collect the detailed information from this nesting attempt, such as the number of eggs and young. One card represents <strong>ONE nesting attempt.</strong> Each row is one visit to the nest by the observer.
                                </p>
                            )}
                            {line === 3 && (
                                <p className="text-[#EEEAD1]">
                                    We are asking participants to transcribe the <strong>numerics</strong> for the MONTH, DAY, NUMBER OF EGGS, AND NUMBER OF YOUNG.
                                </p>
                            )}
                            {line === 4 && (
                                <p className="text-[#EEEAD1]">
                                    <strong>Number of Eggs and Number of Young</strong> will often have 0 (zeros), blanks, and check marks or other marks. Here is how we would like those transcribed: <br />
                                    - Zeros = 0 <br />
                                    - Blanks = b <br />
                                    - Check Mark or any mark (including Y, N, ?, etc.) = m <br />
                                    - 98 and 99 should be entered as numbers <br />
                                  - Scratched entries should be included, if possible. No need to specify the data is scratched.
                                </p>
                            )}
                            {line === 5 && (
                                <p className="text-[#EEEAD1]">
                                    <strong>IF you get a card with a skipped row,</strong> please feel free to only include the rows of data that are completed. No need to comment that the observer skipped a row or to include a skipped row. <br />
                                    Cards that have rows with scratched out data all the way through should be transcribed as though the scratch out line were not there. We would like to retain this data as much as possible.
                                </p>
                            )}
                            {line === 6 && (
                                <p className="text-[#EEEAD1]">
                                    Some observers put a range for the number of young, especially when they could not see the nest contents clearly. Please err on the conservative side and include the lowest of the number range. <br />
                                    For cards that have a range of dates for one or multiple lines of data such as the one pictured, please use the <strong>LATEST DATE</strong> for that line.
                                </p>
                            )}
                            {line === 7 && (
                                <p className="text-[#EEEAD1]">
                                    Let's get started!
                                </p>
                            )}

                            {line < 7 && (
                                <div className="flex justify-center mt-4 w-full h-64">
                                    {line === 2 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-NestQuestGo/Step1.png"
                                            alt="Step 2"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 3 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-NestQuestGo/Step2.png"
                                            alt="Step 3"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 4 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-NestQuestGo/Step3.png"
                                            alt="Step 4"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 5 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-NestQuestGo/Step4.png"
                                            alt="Step 5"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                    {line === 6 && (
                                        <img
                                            src="/assets/Docs/Zoodex/zoodex-NestQuestGo/Step5.png"
                                            alt="Step 6"
                                            className="max-w-full max-h-full object-contain bg-white"
                                        />
                                    )}
                                </div>
                            )}

                            {line < 7 && (
                                <button onClick={nextLine} className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded">
                                    Next
                                </button>
                            )}
                            {line === 7 && (
                                <button onClick={nextPart} className="mt-4 px-4 py-2 bg-[#D689E3] text-white rounded">
                                    Continue
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="rounded-lg">
            <div className="flex flex-col items-center">
                {part === 1 && (
                    <div className="mb-2">
                        {tutorialContent}
                    </div> 
                )}
                {part === 2 && (
                    <>
                        <div className="mb-2">
                            <StructureInfo structureName="Zoodex" />
                        </div>
                        <div className="max-w-4xl mx-auto rounded-lg bg-[#1D2833] text-[#F7F5E9] rounded-md bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-70">
                            <div className="relative">
                                <div className="absolute inset-0 w-full h-full bg-[#2C4F64] rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0"></div>
                                <div className="bg-white bg-opacity-90">
                                    <img
                                        src={imageUrl}
                                        alt="Nest card picture"
                                        className="relative z-10 w-70 h-70 object-contain"
                                    />
                                </div>
                            </div>
                            {/* <ClassificationForm
                                anomalyId={anomalyId}
                                anomalyType="zoodex-nestQuestGo"
                                missionNumber={3000005}
                                assetMentioned={imageUrl}
                            /> */}
                            <NestQuestGoClassificationForm
                                anomalyId={anomalyId}
                                anomalyType="zoodex-nestQuestGo"
                                missionNumber={3000005}
                                assetMentioned={imageUrl}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};