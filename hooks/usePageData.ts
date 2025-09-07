// Utility to group classifications by type and extract annotationOptions
export function useGroupedClassifications(classifications: Classification[]) {
  // Group by classificationtype
  const grouped: Record<string, Classification[]> = {};
  classifications.forEach((c) => {
    if (!grouped[c.classificationtype || "unknown"]) {
      grouped[c.classificationtype || "unknown"] = [];
    }
    grouped[c.classificationtype || "unknown"].push(c);
  });

  // Extract annotationOptions for each classification
  const withAnnotations = Object.entries(grouped).map(([type, entries]) => ({
    type,
    entries: entries.map((c) => {
      let annotationOptions: string[] = [];
      if (c.classificationConfiguration && typeof c.classificationConfiguration === "object") {
        if (Array.isArray(c.classificationConfiguration.annotationOptions)) {
          annotationOptions = c.classificationConfiguration.annotationOptions;
        }
      }
      return { ...c, annotationOptions };
    }),
  }));
  return withAnnotations;
}
import { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { subDays } from "date-fns";

export interface CommentVote {
  type: "comment" | "vote";
  created_at: string;
  content?: string;
  vote_type?: string;
  classification_id: number;
}

export interface Classification {
  id: number;
  classificationtype: string | null;
  content: string | null;
  created_at: string;
  anomaly: {
    content: string | null;
  } | null;
  classificationConfiguration?: {
    annotationOptions?: string[];
    [key: string]: any;
  };
}

export interface LinkedAnomaly {
  id: number;
  anomaly_id: number;
  date: string;
  automaton?: string; // Added automaton field
  unlocked?: boolean; // Added unlocked field
  anomaly: {
    id: number | null; // Added id field
    content: string | null;
    anomalytype: string | null;
    anomalySet: string | null;
  } | null;
}

interface OtherClassification {
  id: number;
  classificationtype: string | null;
  content: string | null;
  author: string;
  created_at: string;
}

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  classificationPoints: number | null;
}

interface PlanetClassification {
  id: number;
  anomaly: {
    content: string | null;
  } | null;
}

export function usePageData() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [linkedAnomalies, setLinkedAnomalies] = useState<LinkedAnomaly[]>([]);
  const [activityFeed, setActivityFeed] = useState<CommentVote[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [otherClassifications, setOtherClassifications] = useState<OtherClassification[]>([]);
  const [incompletePlanet, setIncompletePlanet] = useState<Classification | null>(null);
  const [planetTargets, setPlanetTargets] = useState<{ id: number; name: string }[]>([]);
  const [visibleStructures, setVisibleStructures] = useState({
    telescope: true,
    satellites: true,
    rovers: false,
    balloons: false
  });
  const [loading, setLoading] = useState(true);

  const fetchPlanets = async () => {
    if (!session?.user?.id) return;

    const userId = session.user.id;
    const { data } = await supabase
      .from("classifications")
      .select("id, anomaly:anomaly(content)")
      .eq("author", userId)
      .eq("classificationtype", "planet");

    const planetClassifications = data as PlanetClassification[] | null;
    const planetIds = (planetClassifications ?? []).map((c) => c.id);

    if (planetIds.length === 0) {
      setPlanetTargets([]);
      return;
    }

    // Step 2: Fetch comments with category 'Radius'
    const { data: radiusComments } = await supabase
      .from("comments")
      .select("classification_id")
      .eq("category", "Radius")
      .in("classification_id", planetIds);

    const planetIdsWithRadius = new Set((radiusComments ?? []).map((c) => c.classification_id));

    const validPlanets = (planetClassifications ?? [])
      .filter((c) => planetIdsWithRadius.has(c.id))
      .map((c) => ({
        id: c.id,
        name: c.anomaly?.content ?? `Planet #${c.id}`,
      }));

    setPlanetTargets(validPlanets);
  };

  const fetchData = async () => {
    if (!session?.user?.id) return;

    const userId = session.user.id;

    // Fetch profile data
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, username, full_name, classificationPoints")
      .eq("id", userId)
      .maybeSingle();
    setProfile(profileData);

    // Fetch user's classifications
    const { data: myClassifications } = await supabase
      .from("classifications")
      .select(`
        id,
        classificationtype,
        content,
        created_at,
        anomaly,
        anomaly:anomaly(content),
        classificationConfiguration
      `)
      .eq("author", userId)
      .order("created_at", { ascending: false })
      .limit(10);
    
    // Transform the data to match our interface
    const transformedClassifications = (myClassifications ?? []).map(c => ({
      ...c,
      anomaly: Array.isArray(c.anomaly) ? c.anomaly[0] : c.anomaly
    }));
    setClassifications(transformedClassifications);

    // Get all anomaly IDs that have been classified by this user
    const { data: userClassifications } = await supabase
      .from("classifications")
      .select("anomaly")
      .eq("author", userId);

    const classifiedAnomalyIds = new Set(
      (userClassifications ?? [])
        .map(c => c.anomaly)
        .filter((id): id is number => !!id)
    );

    // Fetch all linked anomalies for the user
    // Note: The unlocked column may not exist in all environments, so we handle it gracefully
    const { data: rawLinked, error: linkedError } = await supabase
      .from("linked_anomalies")
      .select(`
        id,
        anomaly_id,
        date,
        automaton,
        unlocked,
        anomaly:anomaly_id(
          id,
          content,
          anomalytype,
          anomalySet
        )
      `)
      .eq("author", userId)
      .order("date", { ascending: false });

    // Handle case where unlocked column doesn't exist (graceful degradation)
    if (linkedError && linkedError.message?.includes('unlocked')) {
      console.warn('Database missing unlocked column, falling back to query without it');
      
      const { data: fallbackLinked, error: fallbackError } = await supabase
        .from("linked_anomalies")
        .select(`
          id,
          anomaly_id,
          date,
          automaton,
          anomaly:anomaly_id(
            id,
            content,
            anomalytype,
            anomalySet
          )
        `)
        .eq("author", userId)
        .order("date", { ascending: false });

      if (fallbackError) {
        console.error("Error fetching linked anomalies (fallback):", fallbackError);
        return {
          activityFeed: [],
          linkedAnomalies: [],
          classifications: [],
          incompletePlanet: null,
          otherClassifications: [],
          profile: null,
        };
      }

      // Add unlocked: undefined to fallback data
      const linkedWithDefaults = (fallbackLinked ?? []).map(item => ({
        ...item,
        unlocked: undefined,
        anomaly: Array.isArray(item.anomaly) ? item.anomaly[0] : item.anomaly,
      })) as unknown as LinkedAnomaly[];

      return {
        activityFeed: [],
        linkedAnomalies: linkedWithDefaults,
        classifications: [],
        incompletePlanet: null,
        otherClassifications: [],
        profile: null,
      };
    }

    if (linkedError) {
      console.error("Error fetching linked anomalies:", linkedError);
      return {
        activityFeed: [],
        linkedAnomalies: [],
        classifications: [],
        incompletePlanet: null,
        otherClassifications: [],
        profile: null,
      };
    }

    // Fetch all cloud anomalies that have already been classified by the user
    const { data: classifiedClouds } = await supabase
      .from("classifications")
      .select("anomaly, anomaly:anomaly(content, anomalytype)")
      .eq("author", userId)
      .eq("classificationtype", "cloud");

    const classifiedCloudAnomalyIds = new Set(
      (classifiedClouds ?? [])
        .filter((c) => c.anomaly && c.anomaly.anomalytype === "cloud")
        .map((c) => c.anomaly)
    );

    // Filter linked anomalies: keep those not classified by user,
    // plus those of type 'cloud' that HAVE been classified by user
    const linked = (rawLinked ?? []) as unknown as LinkedAnomaly[];
    const filteredLinked = linked.filter((a) => {
      const isCloud = a.anomaly?.anomalytype === "cloud";
      if (!classifiedAnomalyIds.has(a.anomaly_id)) return true;
      if (isCloud && classifiedCloudAnomalyIds.has(a.anomaly_id)) return true;
      return false;
    });
    setLinkedAnomalies(filteredLinked);

    const oneWeekAgo = subDays(new Date(), 7).toISOString();

    // Fetch comments and votes for activity feed
    const { data: comments } = await supabase
      .from("comments")
      .select("created_at, content, classification_id, category")
      .in("classification_id", myClassifications?.map((c) => c.id) ?? [])
      .gte("created_at", oneWeekAgo);

    const { data: votes } = await supabase
      .from("votes")
      .select("created_at, vote_type, classification_id")
      .in("classification_id", myClassifications?.map((c) => c.id) ?? [])
      .gte("created_at", oneWeekAgo);

    const allActivity: CommentVote[] = [];
    if (comments) allActivity.push(...comments.map((c) => ({ type: "comment" as const, ...c })));
    if (votes) allActivity.push(...votes.map((v) => ({ type: "vote" as const, ...v })));

    setActivityFeed(
      allActivity.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    );

    // Fetch other users' classifications
    const { data: others } = await supabase
      .from("classifications")
      .select("id, classificationtype, content, author, created_at")
      .neq("author", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    setOtherClassifications(others ?? []);

    // Find the most recent planet classification without a Radius comment
    const planetClassifications = transformedClassifications.filter((c) => c.classificationtype === 'planet');
    const classifiedIdsWithRadius = new Set(
      (comments ?? [])
        .filter((c) => c.category === 'Radius')
        .map((c) => c.classification_id)
    );

    const mostRecentUnfinishedPlanet = planetClassifications.find(
      (c) => !classifiedIdsWithRadius.has(c.id)
    );

    setIncompletePlanet(mostRecentUnfinishedPlanet ?? null);

    // Update structure visibility based on user progress
    setVisibleStructures({
      telescope: true, // Always visible
      satellites: transformedClassifications.length > 0, // Show if user has any classifications
      rovers: transformedClassifications.filter(c => c.classificationtype === 'planet').length >= 5, // Show after 5 planet classifications
      balloons: transformedClassifications.length >= 10 // Show after 10 total classifications
    });

    setLoading(false);
  };

  useEffect(() => {
    if (!session) return;

    fetchPlanets();
    fetchData();
  }, [session, supabase]);

  return {
    // Data
    linkedAnomalies,
    activityFeed,
    profile,
    classifications,
    otherClassifications,
    incompletePlanet,
    planetTargets,
    visibleStructures,
    loading,
    
    // Functions
    refetchData: fetchData,
    refetchPlanets: fetchPlanets,
  };
}
