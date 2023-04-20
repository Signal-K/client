import { useSession } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React from "react";
import CoreLayout from "../components/Core/Layout";
import UserOnboarding from "../components/onboarding";
import { SocialGraphHomeNoSidebar } from "./posts";

export default function Home() {
    const session = useSession();
    // add an iframe/ref to super.so dashboard

    return (
        <>
            <CoreLayout>      
    {/*<div className="max-w-2xl mx-auto py-8">
      <div className="flex items-center mb-8">
        <img src="https://via.placeholder.com/150" alt="Profile" className="rounded-full h-24 w-24 mr-4" />
        <div>
          <h1 className="text-2xl font-bold">John Doe</h1>
          <p className="text-lg text-gray-500">johndoe@example.com</p>
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4">Address</h2>
        <p className="text-lg">123 Main St.</p>
        <p className="text-lg">Anytown, USA 12345</p>
      </div>
    </div>*/}


            <div className="max-w-md mx-auto py-5">
      <h1 className="text-4xl font-bold mb-8">Welcome to Star Sailors!</h1>
      <p className="text-lg mb-4">
      Our game is a unique and engaging experience that allows you to contribute to real-world scientific research projects by collecting and classifying objects based on real-world data. Currently, we're working on a planets mini-game where you can help identify potential new planets discovered by the TESS telescope.
      </p>
      <p className="text-lg mb-4">
      To get started, simply log in to the Star Sailors website and navigate to the <Link href="/planets">planets</Link> page. You'll be presented with different objects that may or may not be planets, along with relevant information to help you make an informed decision. Once you've made your decision, you can create a post about it and invite other users to vote on whether they agree with your assessment.
      </p><br />
      <p className="text-lg mb-4">
      As you participate in the game and contribute your expertise, you'll earn points that can be redeemed for rewards and recognition within the Star Sailors community. 
      </p>
    </div>
                <SocialGraphHomeNoSidebar /> 
                <UserOnboarding />         
            </CoreLayout>
        </>
    )
}