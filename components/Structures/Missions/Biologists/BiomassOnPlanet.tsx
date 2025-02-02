import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { TreeDeciduousIcon } from "lucide-react";
import { useActivePlanet } from "@/context/ActivePlanet";

const BiomassStats = () => {
    const supabase = useSupabaseClient();
    const session = useSession();

    const { activePlanet } = useActivePlanet();

    const [totalBio, setTotalBio] = useState(0);
    const [recentBio, setRecentBio] = useState(0);
    const [onlyMine, setOnlyMine] = useState(false);
    const [onPlanet, setOnPlanet] = useState(false);

    useEffect(() => {
        if (!session) {
            return;
        };

        const fetchBioCount = async () => {
            const query = supabase
                .from("classifications")
                .select("id, created_at")
                .eq("classificationtype", "zoodex-planktonPortal") // add others

            if (onlyMine) {
                query.eq("author", session.user.id);
            };

            if (onPlanet) {
                query.eq("anomaly", activePlanet.id); // fix to show the classificationConfiguration instead
            };

            const { data, error } = await query;
            
            if ( error ) {
                return;
            } ;

            setTotalBio(data.length);

            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            const recentCount = data.filter((entry) => new Date(entry.created_at) > oneYearAgo).length;
            setRecentBio(recentCount);
        };

        fetchBioCount();
    })

    const bioScore = Math.min(100, (recentBio / 50) * 100); // Update this to be based on biomass weight, not quantity
    const biomassLevel = bioScore > 5 ? "Intelligent Life" : bioScore > 3 ? "Fauna" : bioScore > 2 ? "Flora" : bioScore > 0 ? "Bacterium" : "Null";

    return (
        <Card className="p-4 w-full max-w-md bg-card border shadow-md rounded-lg">
            <CardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-blue-500 clex items-center gap-2">
                        <TreeDeciduousIcon className="w-5 h-5" /> Total biomass
                    </h2>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">Only my discoveries</span>
                        <Switch checked={onlyMine} onCheckedChange={setOnlyMine} />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">Only on Planet: {activePlanet}</span>
                        <Switch checked={onPlanet} onCheckedChange={setOnPlanet} />
                    </div>
                </div>
                <p className="text-xl font-bold text-green-400">{totalBio}</p>
                <div>
                    <p className="text-sm text-gray-500">Biomass score: {biomassLevel}</p>
                    <Progress value={bioScore} className="h-2 bg-green-500" />
                </div>
            </CardContent>
        </Card>
    )
};

export default BiomassStats;