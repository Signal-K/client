import Link from 'next/link';
import React from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Login from '../../../pages/login';

const IntroToLightkurve: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  // if (!session) {
  //   return <Login />
  // }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 font-sans">
      <div className="mb-8">
      <br />
      <div className="flex justify-between">
  <Link legacyBehavior href ="/tests/onboarding/planetHunters/1">
    <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Back</button>
  </Link>
  <Link legacyBehavior href ="/tests/onboarding/planetHunters/3"> {/* Add a component/test that the user has to pass before getting to view the next step. How do we make this persistent though? Maybe just have this for milestones, provided they've updated their basic profile information */}
    <div className="float-right">
      <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Next</button>
    </div>
  </Link>
</div><br />
        <h2 className="text-3xl font-bold mb-4 text-primary">
          Introduction to Lightkurve
        </h2>
        {/* <iframe title="Embedded cell output" src="https://embed.deepnote.com/50ad3984-69a9-496e-a121-efb59231e7e9/631fb065957043e38cfe0db4261051c6/f7d1222c160444109b4afa48c74c46cb?height=736" height="736" width="500"/> */}
        <h3 className="text-xl font-bold mb-4 text-primary">What is Lightkurve?</h3>
        <p className="text-gray-700">Lightkurve is a powerful Python package designed for working with Kepler and TESS mission data. It provides a user-friendly interface for retrieving, analyzing, and visualizing light curves from these space-based observatories. In this notebook, we will explore the basics of Lightkurve and learn how to load and visualize light curves. We will start by loading a sample light curve from the Kepler mission.</p><br />
        
        <h3 className="text-xl font-bold mb-4 text-primary">Identifying celestial objects using TIC IDs</h3>
        <p className="text-gray-700">TIC IDs (Target Identifier for Computation) are unique identifiers assigned to individual stars and other celestial objects. They serve as a standardized way to refer to specific astronomical targets. In our case, we are working with Tic IDs related to stars within the Star Sailors game universe.</p> <br />
        <h3 className="text-xl font-bold mb-4 text-primary">Observing periods using sectors</h3>
        <p className="text-gray-700">In astronomical missions like Kepler and TESS, the observations are divided into sectors. Each sector represents a specific period of time during which the telescope observes a particular region of the sky. These sectors are sequentially numbered, allowing astronomers to organize and reference the data collected during specific observing periods.</p> <br />
        <h3 className="text-xl font-bold mb-4 text-primary">Analysing light curves</h3>
        <p className="text-gray-700">Lightkurve is a Python package designed for working with time series data, specifically light curves from space-based telescopes. It provides a range of tools and functionalities to analyze and visualize light curves effectively.
Now, let's dive into the basics of Lightkurve by loading and visualizing a light curve corresponding to a specific Tic ID and sector.</p><br />

<center><iframe title="Embedded cell output" src="https://embed.deepnote.com/50ad3984-69a9-496e-a121-efb59231e7e9/bf7ad22fd19341d0a5738169228b6279/b4d63c1675d2440894536c3528b25585?height=530.609375" height="730.609375" width="800"/></center><br />

        <h3 className="text-xl font-bold mb-4 text-primary">Normalising light curves</h3>
        <p className="text-gray-700">Light curves often exhibit variations in their overall brightness due to factors like instrumental effects or the star's intrinsic variability. To analyze the intrinsic properties of the star, it is common to normalize the light curve by dividing each data point by the median flux value. Here, we normalize the light curve obtained for the Tic ID 'TIC 470710327' in sector 18 using Lightkurve's built-in 'normalize()' method. This normalization allows us to focus on the relative changes in the star's brightness, enabling a more accurate analysis.</p> <br />

        <center><iframe title="Embedded cell output" src="https://embed.deepnote.com/50ad3984-69a9-496e-a121-efb59231e7e9/bf7ad22fd19341d0a5738169228b6279/3c14a302235b4f798a8d700155ee1833?height=614.1875" height="514.1875" width="600"/></center><br />
        <center><iframe title="Embedded cell output" src="https://embed.deepnote.com/50ad3984-69a9-496e-a121-efb59231e7e9/bf7ad22fd19341d0a5738169228b6279/d9ebb33fcad346d9aeab389280e3ab3e?height=650.1875" height="560.1875" width="650"/></center><br />
        <center><iframe title="Embedded cell output" src="https://embed.deepnote.com/50ad3984-69a9-496e-a121-efb59231e7e9/bf7ad22fd19341d0a5738169228b6279/d8a68cfac5c74d36bf478cea51a05f31?height=560.1875" height="410.1875" width="500"/></center><br />





        {/* <div className="my-8">
        <img src="https://static.wixstatic.com/media/f45460_a693cf6ffe7343dd8e6e00ab6ff580f4~mv2.jpg/v1/crop/x_0,y_87,w_688,h_329/fill/w_600,h_284,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/imageedit_4_5482369061.jpg" alt="Transit Method" className="w-full" />
        </div> */}
      </div>
      <div className="flex justify-between">
  <Link legacyBehavior href ="/tests/onboarding/planetHunters/1">
    <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Back</button>
  </Link>
  <Link legacyBehavior href ="/tests/onboarding/planetHunters/3">
    <div className="float-right">
      <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Next</button>
    </div>
  </Link>

  <Link legacyBehavior href ="/tests/planets"> {/* Add a component/test that the user has to pass before getting to view the next step. How do we make this persistent though? Maybe just have this for milestones, provided they've updated their basic profile information */}
      <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Play</button>
  </Link>
</div><br />
    </div>
  );
};

export default IntroToLightkurve;