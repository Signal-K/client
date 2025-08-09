// utils/auth.ts - Helper functions for anonymous authentication

import { User } from "@supabase/auth-helpers-nextjs";

/**
 * Check if the current user is anonymous
 * @param user - Supabase user object
 * @returns boolean indicating if user is anonymous
 */
export function isAnonymousUser(user: User | null): boolean {
  return user?.is_anonymous === true;
}

/**
 * Get user display information based on account type
 * @param user - Supabase user object
 * @returns object with display name and status
 */
export function getUserDisplayInfo(user: User | null) {
  if (!user) {
    return { displayName: "Guest", isAnonymous: false, status: "logged_out" };
  }
  
  if (isAnonymousUser(user)) {
    return { 
      displayName: "Guest User", 
      isAnonymous: true, 
      status: "anonymous",
      canUpgrade: true
    };
  }
  
  return { 
    displayName: user.email || "User", 
    isAnonymous: false, 
    status: "authenticated",
    canUpgrade: false
  };
}

/**
 * Check if user should see upgrade prompts
 * @param user - Supabase user object
 * @param classificationsCount - Number of classifications made
 * @param timeSpent - Minutes spent on platform
 * @returns boolean indicating if upgrade prompt should show
 */
export function shouldShowUpgradePrompt(
  user: User | null,
  classificationsCount: number = 0,
  timeSpent: number = 0
): boolean {
  if (!isAnonymousUser(user)) return false;
  
  // Show prompt after meaningful engagement
  return (
    classificationsCount >= 3 || 
    timeSpent >= 10
  );
}

/**
 * Helper to get anonymous user limitations
 * @returns object describing limitations for anonymous users
 */
export function getAnonymousUserLimitations() {
  return {
    canClassify: true,
    canDiscoverAnomalies: true,
    canAccessLeaderboard: false, // Could be limited
    canReceiveNotifications: false,
    canSyncAcrossDevices: false,
    dataRetention: "session", // vs "permanent" for registered users
    maxClassifications: null, // Could implement limits
  };
}

/**
 * Helper for RLS policy checks in database queries
 * @returns SQL condition to check if user is anonymous
 */
export function getAnonymousUserSQLCondition() {
  return `(auth.jwt() ->> 'is_anonymous')::boolean IS true`;
}

/**
 * Helper for RLS policy checks for permanent users only
 * @returns SQL condition to exclude anonymous users
 */
export function getPermanentUserSQLCondition() {
  return `(auth.jwt() ->> 'is_anonymous')::boolean IS NOT true OR (auth.jwt() ->> 'is_anonymous') IS NULL`;
}
