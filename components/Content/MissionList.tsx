import {
    CardTitle,
    CardDescription,
    CardHeader,
    CardContent,
    CardFooter,
    Card,
} from "@/ui/Card";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

export default function MissionList() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [profileData, setProfileData] = useState<{ location: any } | null>(
        null
    );

    const [missions, setMissions] = useState([
        { name: "Pick your home planet", completed: false },
        { name: "Build your first rover", completed: false },
        { name: "Collect your first resources", completed: false },
        { name: "Build your first structure", completed: false },
        { name: "Make your first classification", completed: false },
    ]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("location")
                    .eq("id", session?.user?.id)
                    .single();

                if (profileError) {
                    throw profileError;
                }

                if (profile) {
                    setProfileData(profile);
                }
            } catch (error: any) {
                console.error("Error fetching profile data: ", error.message);
            }
        }

        if (session) {
            fetchData();
        }
    }, [supabase, session]);

    useEffect(() => {
        async function checkRoverStatus() {
            try {
                if (!session?.user?.id) return;

                const { data: userItems, error: userItemsError } = await supabase
                    .from("inventoryUSERS")
                    .select("*")
                    .eq("owner", session.user.id)
                    .eq("notes", "first rover created by user");

                if (userItemsError) {
                    throw userItemsError;
                }

                const roverCreated = !!userItems && userItems.length > 0;

                if (profileData) {
                    const { location } = profileData;
                    setMissions((prevMissions) => {
                        const updatedMissions = [...prevMissions];
                        // Update mission 1 based on location
                        updatedMissions[0].completed = !!location;
                        // Update mission 2 based on rover creation and location
                        updatedMissions[1].completed =
                            !!location && roverCreated;
                        return updatedMissions;
                    });
                }
            } catch (error: any) {
                console.error("Error checking rover status:", error.message);
            } finally {
                setLoading(false);
            }
        }

        checkRoverStatus();
    }, [supabase, session?.user?.id, profileData]);

    return (
        <>
            <CardHeader>
                <CardTitle>To-Do List</CardTitle>
                <CardDescription>Missions to become a Star Sailor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto max-h-[480px] pr-4">
                {missions.map((mission, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <LinkIcon
                                className={`w-5 h-5 text-gray-500 ${
                                    mission.completed ? "line-through" : ""
                                } hover:text-gray-900 dark:hover:text-gray-50`}
                            />
                            <p
                                className={`${
                                    mission.completed
                                        ? "line-through text-gray-500 dark:text-gray-400"
                                        : ""
                                }`}
                            >
                                {mission.name}
                            </p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </>
    );
}

function LinkIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
    );
};