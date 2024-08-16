import React from 'react';
import { CreateFirstBaseClassification, CreateCloudClassification, CreateFirstMeteorologyClassification } from '@/Classifications/ClassificationForm';
import CreateBaseClassification from '@/Classifications/ClassificationForm';
import { useActivePlanet } from '@/context/ActivePlanet';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import ClassificationForm from '@/app/(create)/(classifications)/PostForm';

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
            <CreateFirstBaseClassification assetMentioned={imageUrl} />
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
export const TelescopeClassification: React.FC<TelescopeProps> = ({ anomalyid }) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/anomalies/${anomalyid || activePlanet?.id}/Binned.png`;

    return (
        <div className="rounded-lg"> {/* bg-white w-full max-w-lg mx-auto shadow-lg overflow-hidden */}
            <div className="flex flex-col items-center">
                {/* <img src={structure.icon_url} alt={structure.name} className="w-24 h-24 mb-2" /> */}
                <img src='https://github.com/Signal-K/client/blob/initialClassification/public/assets/Inventory/Structures/TelescopeReceiver.png?raw=true' alt='telescope' className="w-24 h-24 mb-2" /> {/* Structure 101 */}
                <div className='relative'>
                <div className='absolute inset-0 w-full h-full bg-blue-400 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-0'></div>
                    <img src={imageUrl} alt={`Active Planet ${activePlanet?.id}`} className="relative z-10 w-128 h-128" />
                </div>
                <ClassificationForm anomalyId={anomalyid} anomalyType='planet' missionNumber={1370103} assetMentioned={imageUrl} />
            </div>
        </div>
    ); 
};