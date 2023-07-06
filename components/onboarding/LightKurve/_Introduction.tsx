import Link from 'next/link';
import React from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Login from '../../../pages/login';

const ExoPlanetDetective: React.FC = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    if (!session) { return <Login />; };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 font-sans">
            <div className="mb-8">
                <br />
                <div className="flex justify-between">
                    <Link href="/tests/onboarding/">
                        <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Back</button>
                    </Link>
                    <Link href="/tests/onboarding/planetHunters/2"> {/* Add a component/test that the user has to pass before getting to view the next step. How do we make this persistent though? Maybe just have this for milestones, provided they've updated their basic profile information */}
                        <div className="float-right">
                            <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Next</button>
                        </div>
                    </Link>
                </div><br />
                <h2 className="text-3xl font-bold mb-4 text-primary">What is Star Sailors?</h2>
                <p className="text-gray-700">
                    Welcome to "Star Sailors", your gateway to the universe! This unique blend of gameplay and scientific exploration offers you an opportunity to dive deep into the realm of astronomical research. Every action you take here, from analysing data to discussing findings, has real-world implications for understanding our cosmos.
                </p>
                <div className="my-8">
                    <img src="https://static.wixstatic.com/media/f45460_a693cf6ffe7343dd8e6e00ab6ff580f4~mv2.jpg/v1/crop/x_0,y_87,w_688,h_329/fill/w_600,h_284,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/imageedit_4_5482369061.jpg" alt="Transit Method" className="w-full" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-primary">Your Mission: Be An Exoplanet Detective</h3>
                <p className="text-gray-700">
                    You're not just a gamer in Star Sailors; you're an exoplanet detective. As the name suggests, your role is to detect and classify exoplanets — planets that orbit stars beyond our solar system. <br />
                    It's all about analysing light! By studying light patterns from distant stars, you'll search for the tell-tale signs of these hidden celestial bodies. But don’t worry; even if you’re new to this, our training and tools will make you an expert in no time.
                </p><br />
                <h3 className="text-xl font-bold mb-4 text-primary">The Tools of the Trade: Understanding Light Curves</h3>
                <p className="text-gray-700">
                    Light Curves are graphs that show the brightness of a star over time. When a planet crosses in front of a star (from our viewpoint), it causes a tiny drop in the star's light. These 'dips' in brightness are the clues we're after.
                </p><br />
                <div className="my-8">
                    <img src="https://static.wixstatic.com/media/f45460_a952e953f59b4765b343715e472cd336~mv2.png/v1/fill/w_600,h_600,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/Big_Planet%202.png" alt="Transit Method" className="w-full" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-primary">Our primary tool - the transit method</h3>
                <p className="text-gray-700">
                    Imagine you're looking at a distant streetlight. Suddenly, a bird flies by, and the light dims momentarily before shining bright again. On a cosmic scale, this momentary dimming is what we're looking for — but instead of birds, we're spotting planets! <br />
                    Size Matters: The amount of dimming hints at the planet. A big planet, like Jupiter, will cause a bigger drop in light, while a smaller planet, like Earth, will create a more subtle dip.
                </p><br />
                <h3 className="text-xl font-bold mb-4 text-primary">The human touch - why we need you</h3>
                <p className="text-gray-700">
                    In the era of supercomputers and AI, you might wonder: Why involve humans? Here's the deal: <br />
                    Computers are great at spotting regular patterns but can sometimes overlook unusual ones. Especially for longer-period planets, the human eye and intuition can be invaluable. By blending computational precision with human insight, we ensure no exoplanet goes unnoticed.
                </p><br />
                <h3 className="text-xl font-bold mb-4 text-primary">The human touch - why we need you</h3>
                <p className="text-gray-700">
                    In the era of supercomputers and AI, you might wonder: Why involve humans? Here's the deal: <br />
                    Computers are great at spotting regular patterns but can sometimes overlook unusual ones. Especially for longer-period planets, the human eye and intuition can be invaluable. By blending computational precision with human insight, we ensure no exoplanet goes unnoticed.
                </p><br />

                Your journey in Star Sailors is not a solitary one:

1. **Collaboration**: Engage in team discussions, share observations, and debate theories with fellow sailors.
2. **Voting**: After discussions, cast your vote on potential discoveries contributing to the community’s collective intelligence.
            </div>
        </div>
    )
}

export default ExoPlanetDetective;