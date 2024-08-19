import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import CoreLayout from "../../components/Core/Layout";
//import UserOnboarding from "../components/onboarding/comments";
import { Database } from "../../utils/database.types";
import DbHeader from "../../components/Backend/Header";
import Login from "../login";
import IndexAuth from "../../components/Core/indexAuth";
import Instructions from "../../components/onboarding";

type Profiles = Database['public']['Tables']['profiles']['Row'];

export default function Home() {
    const session = useSession();
    const supabase = useSupabaseClient();
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>(null);
    const [showProfile, setShowProfile] = useState(false);

    // add an iframe/ref to super.so dashboard

    async function logoutUser () { 
      const { error } = await supabase.auth.signOut() 
    }

    const [profile, setProfile] = useState(null);
    const [username, setUsername] = useState<Profiles['username']>(null);

    return (
        <>
            <CoreLayout>
            <div className="bg-gray-100">
      {/* Header */}
      <header className="bg-white py-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-semibold text-gray-800 text-center">
            Welcome to Star Sailors
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Game Card 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-center">
              <img
                className="h-24"
                src="/images/game1.png"
                alt="Game 1"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mt-4">
              Game 1
            </h2>
            <p className="text-gray-600 mt-2">
              Game 1 description goes here. Lorem ipsum dolor sit amet,
              consectetur adipiscing elit. Aliquam convallis vehicula erat, ac
              efficitur risus consectetur vel.
            </p>
          </div>

          {/* Game Card 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-center">
              <img
                className="h-24"
                src="/images/game2.png"
                alt="Game 2"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mt-4">
              Game 2
            </h2>
            <p className="text-gray-600 mt-2">
              Game 2 description goes here. Sed eu mi euismod, laoreet magna
              sed, tempor orci. Sed fermentum lacus nec rhoncus tincidunt.
            </p>
          </div>

          {/* Game Card 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-center">
              <img
                className="h-24"
                src="/images/game3.png"
                alt="Game 3"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mt-4">
              Game 3
            </h2>
            <p className="text-gray-600 mt-2">
              Game 3 description goes here. Duis eu purus eu tellus iaculis
              consectetur. Ut gravida ex ac ante egestas, eget cursus mi
              fringilla.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto text-center">
          <p>&copy; 2023 Star Sailors. All rights reserved.</p>
        </div>
      </footer>
    </div>
            </CoreLayout>
        </>
    );
}