"use client";

import { createContext, useState, useEffect, ReactNode, useContext, Dispatch, SetStateAction } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { UserProfile } from "@/types/User";

type UserProfileContextType = {
    userProfile: UserProfile | null;
    setUserProfile: Dispatch<SetStateAction<UserProfile | null>>;
};

const UserProfileContext = createContext<UserProfileContextType>({
    userProfile: null,
    setUserProfile: () => {}
});

export const UserProfileContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const fetchProfileData = async () => {
        if (!session) {
            return null;
        };

        try {
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("username, full_name, avatar_url, faction, classificationPoints")
                .eq("id", session?.user?.id)
                .single();
            
            if (profileError) {
                throw profileError;
            };

            if (profileData) {
                console.log("User Profile: ", userProfile);
                setUserProfile(profileData as UserProfile);
            };
        } catch (error: any) {
            console.error("Error fetching data from user profile via context: ", error);
        };
    };

    useEffect(() => {
        fetchProfileData();
        console.log("User Profile: ", userProfile);
    }, [session]);

    return (
        <UserProfileContext.Provider value={{ userProfile, setUserProfile }}>
            {children}
        </UserProfileContext.Provider>
    );
};

export const useProfileContext = () => useContext(UserProfileContext);
