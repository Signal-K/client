import Link from "next/link";
import React from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Login from "../../../pages/login";

const InDepthUserGuideLightkurve: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    if (!session) { return <Login />; };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 font-sans">
            <div className="mb-8">
                <br />
                <div className="flex justify-between">
                    <Link href="/tests/onboarding/planetHunters/2">
                        <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Back</button>
                    </Link>
                    <Link href="/tests/onboarding/planetHunters/4"> {/* Add a component/test that the user has to pass before getting to view the next step. How do we make this persistent though? Maybe just have this for milestones, provided they've updated their basic profile information */}
                        <div className="float-right">
                            <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Next</button>
                        </div>
                    </Link>
                </div><br />
                <h2 className="text-3xl font-bold mb-4 text-primary">Your First Deep Dive: The Planet Hunters Project</h2>
                <p className="text-gray-700">
                    The Kepler Space Telescope and the TESS project have amassed data waiting for eyes like yours. They've been watching stars, noting every flicker, flash, and fade. Your mission? Sift through this data and spot potential exoplanets.
                </p>
                <div className="my-8">
                    <img src="https://exoplanets.nasa.gov/internal_resources/1102" alt="Transit Method" className="w-full" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-primary">Lightkurves - Your analytical ally</h3>
                <p className="text-gray-700">
                    Think of Lightkurve as your cosmic magnifying glass. This Python tool will be your primary companion in analysing light curves. <br />
                        TIC IDs: These are unique labels for stars. It helps us keep track of which star we're analysing. <br />
                        Sectors: Think of these as chapters in a book. Each sector represents a specific time and part of the sky observed by telescopes like Kepler.
                </p><br />
                <iframe title="Embedded cell output" src="https://embed.deepnote.com/50ad3984-69a9-496e-a121-efb59231e7e9/149ecbf466df401e902afc4a543fe729/1b07961e806f4d91a47a297bdb6268ef?height=509.0390625" height="689.0390625" width="100%"/><br />
                <h3 className="text-xl font-bold mb-4 text-primary">Let's review your journey so far:</h3>
                <p className="text-gray-700">
                    1. Analyselight curves using Lightkurve. <br />
                    2. Spot potential exoplanets by looking for dips in star brightness. <br />
                    3. Discuss your findings with the community. <br />
                    4. Vote on the most promising discoveries. <br />
                </p><br />
            </div>
        </div>
    )
}

export default InDepthUserGuideLightkurve;