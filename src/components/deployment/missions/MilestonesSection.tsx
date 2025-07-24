"use client";

import { Calendar, Target, Trophy } from "lucide-react";

interface MilestonesSectionProps {
  weeklyMissions: {
    id: number;
    user?: string;
    target?: number;
    milestone?: { id: number; title: string; description: string; experience?: number };
    status?: 'in-progress' | 'completed' | 'pending';
    progress?: number;
  }[];
  userMissionsLoading: boolean;
}

export default function MilestonesSection({ 
  weeklyMissions, 
  userMissionsLoading 
}: MilestonesSectionProps) {
  return (
    <section className="rounded-2xl border bg-background/30 backdrop-blur-sm border-[#78cce2]/30 text-card-foreground shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="text-primary" />
          <div>
            <h3 className="font-semibold text-lg">Weekly Milestones</h3>
            <p className="text-sm text-muted-foreground">
              Complete challenges to earn experience and unlock new features
            </p>
          </div>
        </div>
      </div>

      {userMissionsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="bg-background/50 rounded-lg p-4">
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : weeklyMissions.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
          <Target className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            No active milestones
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            Complete more classifications to unlock weekly challenges
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {weeklyMissions.map((mission) => (
            <div
              key={mission.id}
              className="bg-background/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {mission.status === 'completed' ? (
                      <Trophy className="text-green-500" size={16} />
                    ) : (
                      <Target className="text-blue-500" size={16} />
                    )}
                    <h4 className="font-medium text-sm">
                      {mission.milestone?.title || 'Milestone'}
                    </h4>
                    {mission.status === 'completed' && (
                      <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {mission.milestone?.description || 'Complete this milestone to earn rewards'}
                  </p>
                  
                  {mission.progress !== undefined && mission.status !== 'completed' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground font-medium">
                          {Math.round(mission.progress)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(mission.progress, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {mission.milestone?.experience && (
                  <div className="ml-4 text-right">
                    <div className="text-xs text-muted-foreground">Reward</div>
                    <div className="text-sm font-medium text-primary">
                      +{mission.milestone.experience} XP
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Information about milestones */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-2">📈 How Milestones Work</h4>
        <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <p>• Complete classifications to unlock weekly challenges</p>
          <p>• Earn experience points to advance your research level</p>
          <p>• Higher levels unlock new structures and capabilities</p>
          <p>• Milestones reset weekly with fresh objectives</p>
        </div>
      </div>
    </section>
  );
}
