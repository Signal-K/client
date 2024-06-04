import { useActivePlanet } from "@/context/ActivePlanet";
import { useProfileContext } from "@/context/UserProfile";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

interface UserProfile {
    username: string;
    full_name: string;
    location: number;
    id: string;
    avatar_url: string;
    faction: string;
};

export default function FillInProfile() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();
    // const { userProfile } = useProfileContext();

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const fetchProfileData = async () => {
        if (!session) {
            return null;
        };

        try {
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("username, full_name, avatar_url, location, username")
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
    }, [session])

    return (
        <section className="w-full py-12 md:py-24 lg:py-32">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8">Step 2: Complete your profile</h1>
            {/* {userProfile && <ProfileCard User={userProfile} />} */}
            {/* {activePlanet?.id} */}
            <div className="flex items-center h-screen w-full justify-center">
            <div className="max-w-xs">
                <div className="bg-white shadow-xl rounded-lg py-3">
                    <div className="photo-wrapper p-2">
                        <img className="w-32 h-32 rounded-full mx-auto" src="https://www.gravatar.com/avatar/2acfb745ecf9d4dccb3364752d17f65f?s=260&d=mp" alt="John Doe" />
                    </div>
                    <div className="p-2">
                        <h3 className="text-center text-xl text-gray-900 font-medium leading-8">{userProfile?.id}</h3>
                        <div className="text-center text-gray-400 text-xs font-semibold">
                            <p>{userProfile?.username}</p>
                        </div>
                        <table className="text-xs my-3">
                            <tbody><tr>
                                <td className="px-2 py-2 text-gray-500 font-semibold">Address</td>
                                <td className="px-2 py-2"></td>
                            </tr>
                            <tr>
                                <td className="px-2 py-2 text-gray-500 font-semibold">Phone</td>
                                <td className="px-2 py-2">+977 9955221114</td>
                            </tr>
                            <tr>
                                <td className="px-2 py-2 text-gray-500 font-semibold">Email</td>
                                <td className="px-2 py-2">john@exmaple.com</td>
                            </tr>
                        </tbody></table>

                        <div className="text-center my-3">
                            <a className="text-xs text-indigo-500 italic hover:underline hover:text-indigo-600 font-medium" href="#">View Profile</a>
                        </div>

                    </div>
                </div>
            </div>
        </div>
        </section>
    ); // Reward: spaceship
};

interface User {
    id: string;
    username: string;
    full_name: string;
    location: number;
}

function ProfileCard({ User }: { User: User }) {
    return (
        <div className="flex items-center h-screen w-full justify-center">
            <div className="max-w-xs">
                <div className="bg-white shadow-xl rounded-lg py-3">
                    <div className="photo-wrapper p-2">
                        <img className="w-32 h-32 rounded-full mx-auto" src="https://www.gravatar.com/avatar/2acfb745ecf9d4dccb3364752d17f65f?s=260&d=mp" alt="John Doe" />
                    </div>
                    <div className="p-2">
                        <h3 className="text-center text-xl text-gray-900 font-medium leading-8">{User.id}</h3>
                        <div className="text-center text-gray-400 text-xs font-semibold">
                            <p>{User.id}</p>
                        </div>
                        <table className="text-xs my-3">
                            <tbody><tr>
                                <td className="px-2 py-2 text-gray-500 font-semibold">Address</td>
                                <td className="px-2 py-2"></td>
                            </tr>
                            <tr>
                                <td className="px-2 py-2 text-gray-500 font-semibold">Phone</td>
                                <td className="px-2 py-2">+977 9955221114</td>
                            </tr>
                            <tr>
                                <td className="px-2 py-2 text-gray-500 font-semibold">Email</td>
                                <td className="px-2 py-2">john@exmaple.com</td>
                            </tr>
                        </tbody></table>

                        <div className="text-center my-3">
                            <a className="text-xs text-indigo-500 italic hover:underline hover:text-indigo-600 font-medium" href="#">View Profile</a>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

interface ProfileData {
    username: string;
    full_name: string;
    avatar_url: string;
    address: string;
    // location: number;
};

export function UserProfileData() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const { userProfile } = useProfileContext();
    const [profileData, setProfileData] = useState<ProfileData>({
        username: '',
        full_name: '',
        avatar_url: '',
        address: '',
        // location: activePlanet.id,
    });
    
    const [email, setEmail] = useState<string>("");

    useEffect(() => {
        if (session) {
            fetchUser();
            setEmail(session.user.email || "");
        };
    }, [session]);

    async function fetchUser() {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session?.user?.id)
            .single();

        if (error) {
            console.error("Error fetching user data: ", error);
        } else if (data) {
            setProfileData(data);
        };
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfileData((prevState: any) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data, error } = await supabase
            .from("profiles")
            .update({
                username: profileData.username,
                full_name: profileData.full_name,
                avatar_url: profileData.avatar_url,
                address: profileData.address
            })
            .eq("id", session?.user?.id);
    
        if (error) {
            console.error("Error updating profile data: ", error.message);
        } else if (data) {
            setProfileData(data[0]);
        }
    };
     

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>ID:</label>
                    <input type="text" value={session?.user?.id} readOnly />
                </div>
                <div>
                    <label>Email:</label>
                    <input type="text" value={email} readOnly />
                </div>
                <div>
                    <label>Username:</label>
                    <input type="text" name="username" value={profileData.username} onChange={handleChange} />
                </div>
                <div>
                    <label>Full Name:</label>
                    <input type="text" name="full_name" value={profileData.full_name} onChange={handleChange} />
                </div>
                <div>
                    <label>Avatar URL:</label>
                    <input type="text" name="avatar_url" value={profileData.avatar_url} onChange={handleChange} />
                </div>
                <div>
                    <label>Address:</label>
                    <input type="text" name="address" value={profileData.address} onChange={handleChange} />
                </div>
                <button onClick={handleSubmit} type="submit">Update Profile</button>
            </form>
        </div>
    );
}