import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Utility function to get the deployment date for fast deploy users
 * If user has no classifications (fast deploy), returns date 1 day ago
 * Otherwise returns current date
 */
export async function getDeploymentDate(
  supabase: SupabaseClient,
  userId: string
): Promise<{ date: string; isFastDeploy: boolean }> {
  try {
    // Check if user has fast deploy enabled (no classifications made)
    const { count: userClassificationCount } = await supabase
      .from('classifications')
      .select('id', { count: 'exact', head: true })
      .eq('author', userId);

    const isFastDeployEnabled = (userClassificationCount || 0) === 0;
    
    // Set deployment date - one day prior for fast deploy, current time otherwise
    const now = new Date();
    const deploymentDate = isFastDeployEnabled 
      ? new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 day ago
      : now;
    
    const deploymentDateISO = deploymentDate.toISOString();
    
    console.log("Deployment date:", deploymentDateISO, isFastDeployEnabled ? "(fast deploy)" : "(normal)");
    
    return {
      date: deploymentDateISO,
      isFastDeploy: isFastDeployEnabled
    };
  } catch (error) {
    console.error('Error checking fast deploy status:', error);
    // Fallback to current date if there's an error
    return {
      date: new Date().toISOString(),
      isFastDeploy: false
    };
  }
}