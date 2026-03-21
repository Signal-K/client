import { getSupabaseBrowserClient } from './supabase/browser'

interface DiscoveryClassification {
  id: number
  created_at: string
  content: string | null
  author: string | null
  classificationtype: string | null
  profiles?: {
    username: string | null
    full_name: string | null
  } | null
}

/**
 * Fetch recent classifications of specific types for the discoveries section
 */
export async function getRecentDiscoveries(): Promise<DiscoveryClassification[]> {
  const supabase = getSupabaseBrowserClient();
  try {
    const { data, error } = await supabase
      .from('classifications')
      .select(`
        id,
        created_at,
        content,
        author,
        classificationtype,
        profiles:author (
          username,
          full_name
        )
      `)
      .in('classificationtype', ['planet', 'telescope-minorPlanet', 'cloud'])
      .order('created_at', { ascending: false })
      .limit(6)

    if (error) {
      console.error('Error fetching recent discoveries:', error)
      return []
    }

    // Transform the data to match our interface
    const transformedData: DiscoveryClassification[] = (data || []).map((item: any) => ({
      id: item.id,
      created_at: item.created_at,
      content: item.content,
      author: item.author,
      classificationtype: item.classificationtype,
      profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
    }))

    return transformedData
  } catch (error) {
    console.error('Error in getRecentDiscoveries:', error)
    return []
  }
}

/**
 * Map classification type to user-friendly discovery type
 */
export function getDiscoveryTypeLabel(classificationType: string | null): string {
  switch (classificationType) {
    case 'planet':
      return 'New Exoplanet Discovered'
    case 'telescope-minorPlanet':
      return 'New Asteroid Detected'
    case 'cloud':
      return 'New Cloud Formation on Mars'
    default:
      return 'New Discovery'
  }
}

/**
 * Generate description for discovery based on classification type
 */
export function getDiscoveryDescription(classificationType: string | null, content: string | null): string {  
  switch (classificationType) {
    case 'planet':
      return `Potentially habitable world identified.`
    case 'telescope-minorPlanet':
      return `Near-Earth object cataloged.`
    case 'cloud':
      return `Atmospheric activity monitored.`
    default:
      return ""
  }
}