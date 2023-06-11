import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import React from 'react';
import Login from '../../pages/login';
import { useDarkMode } from '../Globals/DarkModeToggle';
import Link from 'next/link';

const Instructions: React.FC = () => {
  // User prefs
  const supabase = useSupabaseClient();
  const session = useSession();

  // Styling hooks
 const [isDarkMode, toggleDarkMode] = useDarkMode();
 
  if (!session) {
    return (
      <Login />
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 font-sans">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4 text-primary">
          Welcome to the Star Sailors training program!
        </h2>
        {/* <button onClick={toggleDarkMode}>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button> */}
        <p className="text-gray-700">
          There's a number of exciting research projects you're going to be able to contribute to!
        </p> <br />
        <p className="text-gray-700">
        Welcome to "Star Sailors," an exciting realm of citizen science where you'll embark on a captivating journey as a star sailor. Immerse yourself in our training program, which will guide you through various projects focused on scientific research. Get ready to explore the vast expanse of space and contribute to unraveling the mysteries of the universe.
        </p> <br />
        {/* <div className="my-8">
        <img src="https://file.notion.so/f/s/93246fc4-b0db-46a7-b488-37a82c7e53d1/Untitled.png?id=f02de9d7-b9a6-41e9-8adc-54b773d5295b&table=block&spaceId=215717d6-87ba-4724-a957-c84891dfbb82&expirationTimestamp=1688104800000&signature=0pxfyuWzoTSrZ0Fcggay1xvDhieon_3npbbrJlHfp9g&downloadName=Untitled.png" alt="Size Estimation" className="w-full" />
        </div> */}
        <p className="text-gray-700">
        In the training program, you'll become skilled at analyzing graphs, videos, and data to identify exoplanets—planets that orbit stars beyond our solar system. Through informative tutorials, you'll learn to decipher the intricate patterns and anomalies within the graphs, gaining expertise in making informed classifications.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4 text-primary">Collaboration</h2>
        <blockquote className="italic bg-beige p-4 border-l-4 border-accent">
          <p className="text-gray-700">
          Collaboration is at the heart of the training program. Engage in discussions with fellow star sailors, sharing insights and exchanging ideas. Together, you'll uncover the secrets hidden within the data. Consensus is sought through collaborative decision-making, allowing the community to leverage collective knowledge.
          </p>
        </blockquote>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-4 text-primary">Voting</h2>
        <blockquote className="italic bg-beige p-4 border-l-4 border-accent">
          <p className="text-gray-700">
          Once discussions have taken place, it's time to cast your vote. By voting, you contribute to the collective wisdom of the star sailor community, bringing us closer to understanding the cosmos. This user flow of data analysis, discussion, and voting forms the core of the training program, which remains consistent across all projects within "Star Sailors."
          </p>
        </blockquote>
      </div>

      <div>
        <p className="text-gray-700">
        Prepare for an extraordinary journey as a Star Sailor, where your contributions as a citizen scientist will shape the course of astronomical discoveries. Welcome aboard this cosmic adventure!
        </p>
      </div><br /><br />
     {/* Add user profile section, check username :) */}
      <center><Link href="/tests/onboarding/planetHunters/1"><button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Begin training</button></Link></center>
    </div>
  );
};

export default Instructions;
