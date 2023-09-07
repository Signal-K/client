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
        As a Star Sailor, you'll be part of a community of citizen scientists passionate about exploring the mysteries of the universe. Through our training program, you'll learn how to analyse graphs, videos, and data to identify exoplanets - planets that orbit stars beyond our solar system.
        </p> <br />
        <div className="mb-8">
        <blockquote className="italic bg-beige p-4 border-l-4 border-accent">
          <p className="text-gray-700">
          At Star Sailors, everyone has the power to make a difference. That's why our training program is designed to be accessible and engaging for everyone, regardless of their technical background. 
          </p>
        </blockquote>
      </div>
      {/* <div className="bg-white rounded-lg overflow-hidden shadow-lg p-6">
      <p className="mb-4">
      By playing, you can actively contribute to scientific research by classifying objects based on real-world data. The current focus is on the planets mini-game, where you can help identify potential new planets discovered by the TESS telescope. 
      </p>
      <p className="mb-4">
      Step into the boundless expanse of the universe with Star Sailors—a unique platform that not only captivates your imagination but also contributes to astronomical research. Focus your efforts on the Planets mini-game to help pinpoint undiscovered celestial bodies, all while collaborating with a community of dedicated citizen scientists.
      </p>
      <p className="mb-4">
      As you become proficient in classification, accrue valuable items that enable you to colonise new planets.
      </p>
      <p className="mb-4">
      Engage within the Star Sailors community to earn points, redeem rewards, and influence collective discoveries.
      </p>
    </div> */}
        <p className="text-gray-700">
        You'll also learn how to collaborate with your fellow Star Sailors, sharing insights and ideas to uncover the secrets hidden within the data. Together, you'll leverage collective knowledge to make informed classifications and contribute to the collective wisdom of the Star Sailor community by making informed classifications.
        </p> <br />
        {/* <div className="my-8">
        <img src="https://file.notion.so/f/s/93246fc4-b0db-46a7-b488-37a82c7e53d1/Untitled.png?id=f02de9d7-b9a6-41e9-8adc-54b773d5295b&table=block&spaceId=215717d6-87ba-4724-a957-c84891dfbb82&expirationTimestamp=1688104800000&signature=0pxfyuWzoTSrZ0Fcggay1xvDhieon_3npbbrJlHfp9g&downloadName=Untitled.png" alt="Size Estimation" className="w-full" />
        </div> */}
      </div>

      <div className="mb-8">
        {/* <h2 className="text-3xl font-bold mb-4 text-primary">Collaboration</h2> */}
        <blockquote className="italic bg-beige p-4 border-l-4 border-accent">
          <p className="text-gray-700">And the best part? You'll get to vote on the classifications you've helped create! By voting, you'll play an active role in shaping the course of astronomical discoveries.
          </p>
        </blockquote>
      </div>
     {/* Add user profile section, check username :) */}
      <center><Link href="/tests/onboarding/planetHunters/1"><button type="submit" value="Subscribe" name="member[subscribe]" id="member_submit" className="block px-5 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-300 sm:px-10">Begin training</button></Link></center>
    </div>
  );
};

export default Instructions;
