import { useState, useEffect } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

export default function ClassificationStats() {
  const supabase = useSupabaseClient();
  const session = useSession();
  
  const [userWeekly, setUserWeekly] = useState(0);
  const [userTotal, setUserTotal] = useState(0);
  const [globalWeekly, setGlobalWeekly] = useState(0);
  const [globalTotal, setGlobalTotal] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user?.id) return;

      const { data: userWeeklyData } = await supabase
        .from("classifications")
        .select("id", { count: "exact" })
        .eq("author", session.user.id)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: userTotalData } = await supabase
        .from("classifications")
        .select("id", { count: "exact" })
        .eq("author", session.user.id);

      const { data: globalWeeklyData } = await supabase
        .from("classifications")
        .select("id", { count: "exact" })
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const { data: globalTotalData } = await supabase
        .from("classifications")
        .select("id", { count: "exact" });

      setUserWeekly(userWeeklyData?.length || 0);
      setUserTotal(userTotalData?.length || 0);
      setGlobalWeekly(globalWeeklyData?.length || 0);
      setGlobalTotal(globalTotalData?.length || 0);
    };

    fetchStats();
  }, [session, supabase]);

  return (
    <div className="bg-card backdrop-blur-lg border border-white/20 shadow-lg p-4 rounded-lg text-white text-center">
      <h2 className="text-lg font-bold">Classification Stats</h2>
      <p className="mt-2">Your Classifications: {userWeekly} this week, {userTotal} total</p>
      <p className="mt-1">All Users: {globalWeekly} this week, {globalTotal} total</p>
    </div>
  );
};