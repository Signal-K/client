import Link from 'next/link';
import React from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import Login from '../../../pages/login';

const Stitching: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  if (!session) {
    return <Login />
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 font-sans">
      <div className="mb-8">
      <br />
        <h2 className="text-3xl font-bold mb-4 text-primary">
          How do I play Star Sailors?
        </h2>
        {/* <iframe title="Embedded cell output" src="https://embed.deepnote.com/50ad3984-69a9-496e-a121-efb59231e7e9/631fb065957043e38cfe0db4261051c6/f7d1222c160444109b4afa48c74c46cb?height=736" height="736" width="500"/> */}
        <h3 className="text-xl font-bold mb-4 text-primary">Planet dumps</h3>
        <p className="text-gray-700">Every week, we add another set of planetary candidates to our database from the TESS Telescope. You're free to continue with the previous set, of course</p><br />
        
        <h3 className="text-xl font-bold mb-4 text-primary">Picking a planet</h3>
        <p className="text-gray-700">To choose a planet to classify, just go to the Planets button in the menu, and click on an object you find interesting. You'll see a discussion board for each planet, as well as a 3D visual representation and a set of light curves, unique to that planet.</p> <br />

        <p className="text-gray-700">It's quite simple. Just look at the curves, and make an estimation as to the likelihood of the anomaly being a planet based on the patterns in each graph. Write down your answer in the discussion section.</p> <br />

{/* Add section about voting, replying, etc */}




        {/* <div className="my-8">
        <img src="https://static.wixstatic.com/media/f45460_a693cf6ffe7343dd8e6e00ab6ff580f4~mv2.jpg/v1/crop/x_0,y_87,w_688,h_329/fill/w_600,h_284,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/imageedit_4_5482369061.jpg" alt="Transit Method" className="w-full" />
        </div> */}
      </div>
      <div className="flex justify-between">
  <Link legacyBehavior href ="/tests/onboarding/planetHunters/3">
    <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Back</button>
  </Link>
  <Link legacyBehavior href ="/tests/planets">
    <div className="float-right">
      <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Play</button>
    </div>
  </Link>

  {/* <Link legacyBehavior href ="/tests/planets"> {/* Add a component/test that the user has to pass before getting to view the next step. How do we make this persistent though? Maybe just have this for milestones, provided they've updated their basic profile information 
      <button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Play</button>
  </Link> */}
</div><br />
    </div>
  );
};

export default Stitching;