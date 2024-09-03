import React, { useState } from 'react';
// import { CreateFirstBaseClassification } from '../../_[archive]/Classifications/ClassificationForm';
import { useActivePlanet } from '@/context/ActivePlanet';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import ClassificationForm from '../../(create)/(classifications)/PostForm';

// Define the `TransitingTelescopeClassifyPlanet` component
export const TransitingTelescopeClassifyPlanet: React.FC = () => {
    const { activePlanet } = useActivePlanet();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/anomalies/${activePlanet?.id}/phased.png`;

    return (
        <div className="flex flex-col items-center">
            <img src={imageUrl} alt={`Active Planet ${activePlanet?.id}`} className="w-32 h-32 mb-4" />
            <p>Your mission is to analyze the phase-folded lightcurve of your home planet. Look closely at the pattern of dips and variations in brightness. This information helps determine if the planet is real.</p>
            <p>Here are some tips for classifying:</p>
            <ul className="list-disc pl-5 mb-4">
                <li>Look for Regular Dips: These dips often indicate a planet passing in front of its star. The regularity can confirm its orbit.</li>
                <li>Assess the Shape: A sharp, symmetrical dip is typical of a planet transit. Asymmetrical or irregular shapes might suggest other phenomena.</li>
            </ul>
            <p>Use these criteria to decide if the lightcurve reveals a legitimate planet. Write a post and click share when you're ready to submit your findings. Happy exploring!</p>
            {/* <CreateFirstBaseClassification assetMentioned={imageUrl} /> */}
        </div>
    );
};

// Define the `TransitingTelescopeSpecialisedGraphs` component
export const TransitingTelescopeSpecialisedGraphs: React.FC = () => {
    return (
        <div className="flex flex-col items-center">
            <p>Access advanced graphs and analytics for your lightcurves, adding more data and content to your new planet.</p>
            {/* Replace with actual specialized graphs content */}
        </div>
    );
};

// Define the `TransitingTelescopeExplorePlanets` component
export const TransitingTelescopeExplorePlanets: React.FC = () => {
    return (
        <div className="flex flex-col items-center">
            <p>Use your telescope to find other planet candidates and begin classifying them.</p>
            {/* Replace with actual exploration content */}
        </div>
    );
};

// Define the `TransitingTelescopeMyDiscoveries` component
export const TransitingTelescopeMyDiscoveries: React.FC = () => {
    return (
        <div className="flex flex-col items-center">
            <p>View all your discoveries and classified lightcurves.</p>
            {/* Replace with actual discoveries content */}
        </div>
    );
};

// Define the `TransitingTelescopeTutorial` component
export const TransitingTelescopeTutorial: React.FC = () => {
    return (
        <div className="flex flex-col items-center">
            <p>Learn how to use the telescope and classify lightcurves.</p>
            {/* Replace with actual tutorial content */}
        </div>
    );
};

interface TelescopeProps {
    anomalyid: string;
};

// For the onboarding mission - please re-asses after
interface TelescopeProps {
    anomalyid: string;
};

export const TelescopeClassification: React.FC<TelescopeProps> = ({ anomalyid }) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/anomalies/${anomalyid || activePlanet?.id}/Binned.png`;

    // State for managing onboarding/tutorial steps
    const [part, setPart] = useState(1);
    const [line, setLine] = useState(1);

    // Function to handle advancing the line
    const nextLine = () => {
        setLine(prevLine => prevLine + 1);
    };

    // Function to handle advancing to the next part
    const nextPart = () => {
        setPart(2);
        setLine(1);
    };

    // Onboarding/tutorial panel content
    const tutorialContent = (
        <div className="p-4 bg-blue-100 border border-blue-300 rounded-md shadow-md">
            {part === 1 && (
                <>
                    {line === 1 && <p>Hello there! To start your journey, you'll need to discover your first planet.</p>}
                    {line === 2 && <p>To determine if a planet is real, you'll need to examine a lightcurve and identify patterns in dips and variations.</p>}
                    {line === 3 && <p>Look for regular dips—these often signal a planet passing in front of its star and can confirm its orbit.</p>}
                    {line === 4 && <p>Pay attention to the shape of these dips: a sharp, symmetrical dip usually indicates a genuine planet transit...</p>}
                    {line === 5 && <p>...While asymmetrical or irregular shapes might suggest something else.</p>}
                    {line === 6 && <p>Let's give it a try! Identify the dips in this lightcurve:</p>}
                    {line < 6 && (
                        <button onClick={nextLine} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Next</button>
                    )}
                    {line === 6 && (
                        <button onClick={nextPart} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Continue</button>
                    )}
                </>
            )}
            {part === 2 && (
                <>
                    {line === 1 && <p>Great job! Once you've identified your planet, you can share your findings with the rest of the space sailors community.</p>}
                    {line === 1 && (
                        <button onClick={() => {/* Handle finish action here */}} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">Finish</button>
                    )}
                </>
            )}
        </div>
    );

    return (
        <div className="rounded-lg">
            <div className="flex flex-col items-center">
                {part === 1 && (
                    <div className="mb-4">{tutorialContent}</div>
                )}
                {part === 2 && (
                    <>
                        <div className="mb-4">
                            <img
                                src='https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/TelescopeReceiver.png?raw=true'
                                alt='telescope'
                                className="w-24 h-24 mb-2"
                            />
                        </div>
                        <div className='relative'>
                            <div className='absolute inset-0 w-full h-full bg-blue-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0'></div>
                            <img
                                src={imageUrl}
                                alt={`Active Planet ${activePlanet?.id}`}
                                className="relative z-10 w-128 h-128"
                            />
                        </div>
                        <ClassificationForm anomalyId={anomalyid} anomalyType='planet' missionNumber={1370103} assetMentioned={imageUrl} />
                        {tutorialContent}
                    </>
                )}
            </div>
        </div>
    );
};