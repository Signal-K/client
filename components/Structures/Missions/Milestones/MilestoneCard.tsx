import { Card, CardContent } from "@/components/ui/card";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { GlassWaterIcon, PawPrintIcon, SnowflakeIcon } from "lucide-react";

const MilestoneCard = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const milestones = [
        { icon: <PawPrintIcon className="w-5 h-5" />, text: "Find 3 desert creatures" },
        { icon: <SnowflakeIcon className="w-5 h-5" />, text: "Find ice on a planet" },
        { icon: <GlassWaterIcon className="w-5 h-5" />, text: "Find a planet in the habitable zone" }
    ];

    return (
        <Card className="p-4 w-full max-w-md bg-card border shadow-md rounded-lg">
            <CardContent className="flex flex-col gap-4">
                <h1 className="text-xl font-semibold text-blue-600">Weekly Missions</h1>
                <ul className="space-y-2">
                    {milestones.map((milestone, index) => (
                        <li key={index} className="flex items-center gap-2 text-green-700">
                            {milestone.icon}
                            <p>{milestone.text}</p>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};

export default MilestoneCard;