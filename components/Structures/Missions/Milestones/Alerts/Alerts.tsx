import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, startOfDay, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from "lucide-react";

const classificationTypes = [
    'zoodex-burrowingOwl',
    'telescope-minorPlanet',
    'sunspot',
    'satellite-planetFour',
    'planet',
    'lidar-jovianVortexHunter',
    'cloud',
    'balloon-marsCloudShapes',
    'automaton-aiForMars',
];

const AlertComponent = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [alertMessage, setAlertMessage] = useState<string>("");
    const [timeRemaining, setTimeRemaining] = useState<string>("");

    useEffect(() => {
        const fetchClassifications = async () => {
            if (!session?.user) return;

            // Calculate the date range (one week ago to now)
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            const { data, error } = await supabase
                .from('classifications')
                .select('classificationtype, created_at')
                .gte('created_at', oneWeekAgo.toISOString())
                .eq('author', session.user.id);

            if (error) {
                console.error("Error fetching classifications", error);
                return;
            }

            // Get the classification types the user hasn't performed
            const performedClassifications = data?.map((item) => item.classificationtype) || [];
            const unperformedClassifications = classificationTypes.filter(
                (type) => !performedClassifications.includes(type)
            );

            if (unperformedClassifications.length > 0) {
                setAlertMessage(`New asteroid candidate discovered, go to Telescope to review`);
            } else {
                setAlertMessage("You've reviewed all types for the past week!");
            }
        };

        fetchClassifications();
    }, [session]);

    useEffect(() => {
        const calculateTimeRemaining = () => {
            const now = new Date();
            const melbourneTime = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Melbourne" }));
            const nextMidnight = startOfDay(addDays(melbourneTime, 1)); // Get next 00:01 AM Melbourne time
            const remaining = formatDistanceToNow(nextMidnight, { addSuffix: true });
            setTimeRemaining(remaining);
        };

        const interval = setInterval(calculateTimeRemaining, 60000); // Update every minute
        calculateTimeRemaining(); // Initial calculation

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto p-4 bg-gradient-to-b from-[#0f172a] to-[#020617] text-white rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.5)] border border-[#581c87]">
            <div className="flex flex-col items-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#22d3ee] to-[#a855f7]">
                    Daily Alert
                </h2>
                <div className="mt-4 text-center text-[#67e8f9] font-semibold">
                    <p>{alertMessage}</p>
                    <p className="mt-2 text-xs text-gray-500">
                        Time remaining until next event: {timeRemaining}
                    </p>
                </div>
            </div>
            {/* <div className="flex justify-between gap-2 mt-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { /* Add previous event logic 
                    className="border-[#7e22ce] bg-[#1e293b] hover:bg-[#581c87] hover:text-white w-full sm:w-auto"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { /* Add next event logic 
                    className="border-[#7e22ce] bg-[#1e293b] hover:bg-[#581c87] hover:text-white w-full sm:w-auto"
                >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </div> */}
        </div>
    );
};

export default AlertComponent;