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
              { !session && (
                <Login />                
              )}
              { session && (
                <><IndexAuth />
                  <Instructions />
                </>
              )}
            </CoreLayout>
        </>
    )
}