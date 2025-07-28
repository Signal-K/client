"use client";

import Link from "next/link";
import { User, Settings, AlertCircle } from "lucide-react";

interface ProfileSetupSectionProps {
  session: any;
  profile: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  } | null;
  profileCreated: boolean;
  hasMadeClassifications: boolean;
}

export default function ProfileSetupSection({
  session,
  profile,
  profileCreated,
  hasMadeClassifications,
}: ProfileSetupSectionProps) {
  const needsSetup = !profileCreated || !profile?.username;

  return (
    <section className="rounded-2xl border bg-background/30 backdrop-blur-sm border-[#78cce2]/30 text-card-foreground shadow p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="text-primary" />
          <div>
            <h3 className="font-semibold text-lg">Profile Setup</h3>
            <p className="text-sm text-muted-foreground">
              Complete your profile to access all platform features
            </p>
          </div>
        </div>
        {needsSetup && (
          <AlertCircle className="text-yellow-500" size={20} />
        )}
      </div>

      {needsSetup ? (
        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  Profile Setup Required
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                  To unlock all features and track your progress, please complete your profile setup.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={profile?.username ? "text-green-600" : "text-gray-400"}>
                      {profile?.username ? "✓" : "○"}
                    </span>
                    <span>Choose a unique username</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={profile?.full_name ? "text-green-600" : "text-gray-400"}>
                      {profile?.full_name ? "✓" : "○"}
                    </span>
                    <span>Add your display name</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={hasMadeClassifications ? "text-green-600" : "text-gray-400"}>
                      {hasMadeClassifications ? "✓" : "○"}
                    </span>
                    <span>Make your first classification</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/account"
              className="flex-1 text-center text-sm font-medium rounded-lg px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              Complete Profile
            </Link>
            {!hasMadeClassifications && (
              <Link
                href="/planets"
                className="flex-1 text-center text-sm font-medium rounded-lg px-4 py-2 border border-gray-300 dark:border-gray-600 text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Start Classifying
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <User className="text-green-600 dark:text-green-400" size={16} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                  Profile Complete! 🎉
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                  Welcome, <strong>{profile?.username || profile?.full_name}</strong>! 
                  Your profile is set up and ready to go.
                </p>
                <div className="flex items-center gap-4 text-xs text-green-600 dark:text-green-400">
                  <span className="flex items-center gap-1">
                    ✓ Username: {profile?.username}
                  </span>
                  {profile?.full_name && (
                    <span className="flex items-center gap-1">
                      ✓ Display name: {profile.full_name}
                    </span>
                  )}
                  {hasMadeClassifications && (
                    <span className="flex items-center gap-1">
                      ✓ Active researcher
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/account"
              className="flex items-center gap-2 text-sm font-medium rounded-lg px-4 py-2 border border-gray-300 dark:border-gray-600 text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <Settings size={16} />
              Manage Profile
            </Link>
            <Link
              href="/planets"
              className="flex-1 text-center text-sm font-medium rounded-lg px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 transition"
            >
              Continue Research
            </Link>
          </div>
        </div>
      )}

      {/* Profile Benefits */}
      <div className="bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-2">🌟 Profile Benefits</h4>
        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          <p>• Track your research progress and contributions</p>
          <p>• Unlock achievements and milestone rewards</p>
          <p>• Access advanced features and equipment</p>
          <p>• Join the community of citizen scientists</p>
        </div>
      </div>
    </section>
  );
}
