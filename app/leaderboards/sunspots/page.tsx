"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import MainHeader from "@/src/components/layout/Header/MainHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Trophy, Shield, SunIcon } from "lucide-react";
import UseDarkMode from "@/src/shared/hooks/useDarkMode";

interface LeaderboardEntry {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  count: number;
}

export default function SunspotLeaderboardPage() {
  const supabase = useSupabaseClient();
  const { isDark, toggleDarkMode } = UseDarkMode();
  
  const [probeLeaders, setProbeLeaders] = useState<LeaderboardEntry[]>([]);
  const [classificationLeaders, setClassificationLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboards() {
      setLoading(true);
      
      try {
        // Fetch probe deployment leaders
        const { data: probeData, error: probeError } = await supabase
          .from('defensive_probes')
          .select(`
            user_id,
            count,
            profiles!inner (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .order('count', { ascending: false });

        if (probeError) throw probeError;

        // Aggregate probe counts by user
        const probeMap = new Map<string, LeaderboardEntry>();
        probeData?.forEach((entry: any) => {
          const userId = entry.user_id;
          const profile = entry.profiles;
          
          if (probeMap.has(userId)) {
            const existing = probeMap.get(userId)!;
            existing.count += entry.count || 0;
          } else {
            probeMap.set(userId, {
              user_id: userId,
              username: profile.username || 'Anonymous',
              full_name: profile.full_name || 'Unknown',
              avatar_url: profile.avatar_url,
              count: entry.count || 0,
            });
          }
        });

        // Sort and take top 10
        const probeLeaderboard = Array.from(probeMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setProbeLeaders(probeLeaderboard);

        // Fetch classification leaders
        const { data: classData, error: classError } = await supabase
          .from('classifications')
          .select(`
            author,
            profiles!inner (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('classificationtype', 'sunspot');

        if (classError) throw classError;

        // Aggregate classification counts by user
        const classMap = new Map<string, LeaderboardEntry>();
        classData?.forEach((entry: any) => {
          const userId = entry.author;
          const profile = entry.profiles;
          
          if (classMap.has(userId)) {
            const existing = classMap.get(userId)!;
            existing.count += 1;
          } else {
            classMap.set(userId, {
              user_id: userId,
              username: profile.username || 'Anonymous',
              full_name: profile.full_name || 'Unknown',
              avatar_url: profile.avatar_url,
              count: 1,
            });
          }
        });

        // Sort and take top 10
        const classLeaderboard = Array.from(classMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setClassificationLeaders(classLeaderboard);

      } catch (error) {
        console.error('Error fetching leaderboards:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboards();
  }, [supabase]);

  const getAvatarUrl = (entry: LeaderboardEntry) => {
    if (entry.avatar_url) {
      return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${entry.avatar_url}`;
    }
    // Use DiceBear robot API as fallback
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${entry.user_id}`;
  };

  const getMedalColor = (index: number) => {
    if (index === 0) return "text-yellow-400";
    if (index === 1) return "text-gray-400";
    if (index === 2) return "text-orange-600";
    return "text-gray-600";
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col">
      <MainHeader
        isDark={isDark}
        onThemeToggle={toggleDarkMode}
        notificationsOpen={false}
        onToggleNotifications={() => {}}
        activityFeed={[]}
        otherClassifications={[]}
      />

      <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6 pt-24">
        <Card className="border-[#78cce2]/30 bg-gradient-to-br from-orange-500/10 to-yellow-500/10">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Sunspot Mission Leaderboards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="probes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="probes" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Probe Launchers
                </TabsTrigger>
                <TabsTrigger value="classifications" className="flex items-center gap-2">
                  <SunIcon className="w-4 h-4" />
                  Classifiers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="probes" className="mt-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : (
                  <div className="space-y-2">
                    {probeLeaders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No probe deployments yet. Be the first!
                      </div>
                    ) : (
                      probeLeaders.map((entry, index) => (
                        <div
                          key={entry.user_id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-background/60 border border-[#78cce2]/20 hover:border-[#78cce2]/40 transition-colors"
                        >
                          <div className={`text-2xl font-bold w-8 text-center ${getMedalColor(index)}`}>
                            {index < 3 ? <Trophy className="w-6 h-6 inline" /> : `#${index + 1}`}
                          </div>
                          <img
                            src={getAvatarUrl(entry)}
                            alt={entry.username}
                            className="w-12 h-12 rounded-full border-2 border-[#78cce2]/30"
                          />
                          <div className="flex-1">
                            <div className="font-semibold">{entry.username}</div>
                            <div className="text-sm text-muted-foreground">{entry.full_name}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-[#78cce2]">{entry.count}</div>
                            <div className="text-xs text-muted-foreground">probes</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="classifications" className="mt-4">
                {loading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : (
                  <div className="space-y-2">
                    {classificationLeaders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No classifications yet. Be the first!
                      </div>
                    ) : (
                      classificationLeaders.map((entry, index) => (
                        <div
                          key={entry.user_id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-background/60 border border-[#78cce2]/20 hover:border-[#78cce2]/40 transition-colors"
                        >
                          <div className={`text-2xl font-bold w-8 text-center ${getMedalColor(index)}`}>
                            {index < 3 ? <Trophy className="w-6 h-6 inline" /> : `#${index + 1}`}
                          </div>
                          <img
                            src={getAvatarUrl(entry)}
                            alt={entry.username}
                            className="w-12 h-12 rounded-full border-2 border-[#78cce2]/30"
                          />
                          <div className="flex-1">
                            <div className="font-semibold">{entry.username}</div>
                            <div className="text-sm text-muted-foreground">{entry.full_name}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-orange-400">{entry.count}</div>
                            <div className="text-xs text-muted-foreground">classifications</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
