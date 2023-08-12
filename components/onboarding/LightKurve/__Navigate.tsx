import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Card from "../../Card";

const NavigateComponent: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 font-sans mb-20">
            <h1 className="text-3xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500">Navigating the cosmic ocean</h1>
            <div className="container mx-auto py-8">
                <h2 className="text-2xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500">Welcome back, Star Sailor</h2>
                <p className="text-gray-700">
                    Your journey so far has equipped you with the basic knowledge and introduced you to the classification process of a potential exoplanet. As you venture deeper into the cosmos, a more advanced understanding of celestial phenomena awaits you.
                </p><br />
            </div>
            <div className="mb-10">
                <img
                    src="/assets/Onboarding/Missions/Navigate/NavigateImage1.png"
                    alt="Transit Method"
                    className="w-full"
                />
            </div> <br />
            <div className="">
                <h2 className="text-2xl font-bold mb-4 text-primary bg-gradient-to-r from-gold-500 to-yellow-500">Advanced Celestial Techniques: Phase Folding & Binning</h2><br />
                <p className="text-gray-700">Let’s delve into more sophisticated techniques that astronomers use to identify potential exoplanets:</p><br />

                <img src="/assets/Onboarding/Missions/Navigate/NavigateImage2.png" alt="Transit Method" className="w-full"/>
                <p className="text-gray-700"><span role='alert'>Binning:</span> Reduce the noise and highlight potential signals by grouping data into bins—a crucial technique to fine-tune your discoveries.</p><br />

                <img src="/assets/Onboarding/Missions/Navigate/NavigateImage3.png" alt="Transit Method" className="w-full"/>
                <p className="text-gray-700"><span role='alert'>Phase folding:</span> Enhance the signal of potential planets by aligning repeating signals in a star’s light curve.</p>
            </div><br />
            <Link href='/tests/onboarding/'><button className="btn glass">Complete mission</button></Link>
        </div>
    );
};

export default NavigateComponent;