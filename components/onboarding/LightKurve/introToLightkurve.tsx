import Link from 'next/link';
import React from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Login from '../../../pages/login';

const IntroToLightkurve: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  if (!session) {
    return <Login />
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 font-sans">
      <div className="mb-8">
      <br />
      <div className="flex justify-between">
  <Link href="/tests/onboarding/planetHunters/1">
    <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Back</button>
  </Link>
  <Link href="/tests/onboarding/planetHunters/3"> {/* Add a component/test that the user has to pass before getting to view the next step. How do we make this persistent though? Maybe just have this for milestones, provided they've updated their basic profile information */}
    <div className="float-right">
      <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Next</button>
    </div>
  </Link>
</div><br />
        <h2 className="text-3xl font-bold mb-4 text-primary">
          How do we look at the data from these telescopes?
        </h2>
        {/* <iframe title="Embedded cell output" src="https://embed.deepnote.com/50ad3984-69a9-496e-a121-efb59231e7e9/631fb065957043e38cfe0db4261051c6/f7d1222c160444109b4afa48c74c46cb?height=736" height="736" width="500"/> */}
        <h3 className="text-xl font-bold mb-4 text-primary">What is a Tic ID?</h3>
        <p className="text-gray-700">TIC IDs are unique identifiers assigned to individual stars or other astronomical objects within the game. These IDs allow players to locate and interact with specific celestial entities, providing a sense of realism and accuracy in the virtual universe.</p><br />
        
        <h3 className="text-xl font-bold mb-4 text-primary">What is a Light Curve?</h3>
        <p className="text-gray-700">Light curves represent the brightness variations of astronomical objects over time. In Star Sailors, light curves are used to simulate the natural changes in luminosity exhibited by stars, planets, and other celestial bodies. By analyzing the light curves of various objects, players can gain insights into their characteristics, such as their size, composition, and potential anomalies.</p> <br />

        <h3 className="text-xl font-bold mb-4 text-primary">Exploring curves</h3>
        <p className="text-gray-700">These code blocks demonstrate how to search, download, plot, normalize, and stitch light curves associated with a specific TIC ID in Star Sailors. The analysis of light curves allows players to explore and understand the behavior of celestial objects within the game's virtual universe. When exploring the planets, you'll be observing the graphs and visual data this code generates for your chosen planet</p> <br />

        <h5 className="text-md font-bold mb-4 text-primary">Installing lightkurve package</h5>
        <p className="text-gray-700">This line installs the Lightkurve package, a powerful tool for working with light curves in astronomy, which will be used in subsequent code blocks.</p> <br />
        <center><iframe title="Embedded cell output" src="https://embed.deepnote.com/50ad3984-69a9-496e-a121-efb59231e7e9/631fb065957043e38cfe0db4261051c6/f7d1222c160444109b4afa48c74c46cb" height="125" width="625"/></center><br />
        
        <h5 className="text-md font-bold mb-4 text-primary">Searching & downloading lightcurves</h5>
        <p className="text-gray-700">Here, we search for light curves associated with a specific TIC ID, 'TIC 470710327', collected by the SPOC (Science Processing Operations Center) and from sector 18.</p> <br /> {/* The light curve data is then downloaded and stored in the 'lc' variable. -> save this for the in-depth tutorial which covers coding/scripting */}
        <center><iframe title="Embedded cell output" src="https://embed.deepnote.com/50ad3984-69a9-496e-a121-efb59231e7e9/631fb065957043e38cfe0db4261051c6/4d718dccb37f436586045be95902a568?height=173" height="180" width="625"/></center><br />
        
        <h5 className="text-md font-bold mb-4 text-primary">Plotting available data</h5>
        <p className="text-gray-700">This code block retrieves all available light curve data for the given TIC ID. It displays information about the available data, including the sector and author.</p> <br />
        <center><iframe title="Embedded cell output" src="https://embed.deepnote.com/50ad3984-69a9-496e-a121-efb59231e7e9/631fb065957043e38cfe0db4261051c6/c813b2ebdebd45a2a431696f0e67dcd8" height="360.1875" width="650"/></center><br />

        <h5 className="text-md font-bold mb-4 text-primary">Downloading multiple curves (same TIC ID)</h5>
        <p className="text-gray-700">In this block, a subset of the available light curves (first four sectors) is selected and downloaded as a collection using the 'download_all()' method. The downloaded light curve collection is stored in the 'lc_collection' variable.</p> <br />
        <center><iframe title="Embedded cell output" src="https://embed.deepnote.com/50ad3984-69a9-496e-a121-efb59231e7e9/631fb065957043e38cfe0db4261051c6/72c56e417abe439a98c6bc95f3c8d0d4?height=365.984375" height="500.1875" width="650"/></center><br />






        {/* <div className="my-8">
        <img src="https://static.wixstatic.com/media/f45460_a693cf6ffe7343dd8e6e00ab6ff580f4~mv2.jpg/v1/crop/x_0,y_87,w_688,h_329/fill/w_600,h_284,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/imageedit_4_5482369061.jpg" alt="Transit Method" className="w-full" />
        </div> */}
      </div>
      <div className="flex justify-between">
  <Link href="/tests/onboarding/planetHunters/1">
    <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Back</button>
  </Link>
  <Link href="/tests/onboarding/planetHunters/3">
    <div className="float-right">
      <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Next</button>
    </div>
  </Link>

  <Link href="/tests/planets"> {/* Add a component/test that the user has to pass before getting to view the next step. How do we make this persistent though? Maybe just have this for milestones, provided they've updated their basic profile information */}
      <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Play</button>
  </Link>
</div><br />
    </div>
  );
};

export default IntroToLightkurve;