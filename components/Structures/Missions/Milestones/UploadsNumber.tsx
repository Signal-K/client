import React, { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export default function MyUploads() {
    const supabase = useSupabaseClient();
    const session = useSession();

    const [userWeekly, setUserWeekly] = useState<number>(0);
    const [userTotal, setUserTotal] = useState<number>(0);
    const [communityWeekly, setCommunityWeekly] = useState<number>(0);
    const [communityTotal, setCommunityTotal] = useState<number>(0);

    const [loading, setLoading] = useState<boolean | null>(false);

    useEffect(() => {
        const fetchStats = async () => {
            if (!session) {
                return;
                setLoading(false);
            };

            setLoading(true);

            const {
                data: userWeeklyData
            } = await supabase
                .from("uploads")
                .select("id", {
                    count: 'exact',
                })
                .eq('author', session.user.id)
                .eq("source", 'webcam')
                .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

            const {
                data: userTotalData
            } = await supabase
                .from("uploads")
                .select("id", {
                    count: 'exact',
                })
                .eq('author', session.user.id)
                .eq('source', 'webcam');

            const { data: communityWeelyData } = await supabase
                .from("uploads")
                .select("id", {
                    count: 'exact',
                })
                .eq('source', 'webcam')
                .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

            const {
                data: communityTotalData
            } = await supabase
                .from("uploads")
                .select("id", {
                    count: 'exact',
                })
                .eq('source', 'webcam')

            setUserWeekly(userWeeklyData?.length || 0);
            setUserTotal(userTotalData?.length || 0);
            setCommunityWeekly(communityWeelyData?.length || 0);
            setCommunityTotal(communityTotalData?.length || 0);
        };

        fetchStats();
    }, [session, supabase]);

    if (loading) {
        return (
            <div className="">
                Loading...
            </div>
        );
    };

    return (
        <div className="bg-card backdrop-blur-lg border border-white/20 shadow-lg p-4 rounded-lg text-white text-center">
            <h2 className="text-lg font-bold">Your uploads</h2>
            <p className="mt-2">Your uploads: {userWeekly} this week, {userTotal} overall.</p>
            <p className="mt-1">All users: {communityWeekly} this week, {communityTotal} overall.</p>
        </div>
    );
};