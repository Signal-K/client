import { useEffect, useState } from "react";
import { DiscoveryCard } from "@/components/Projects/Consensus/PostCard";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

type Discovery = {
  id: string;
  project: string;
  classification: string;
  classificationConfiguration: any; 
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  media: any[];
  votes: number;
  comments: number;
};

const classificationTypes = [
    "planet",
    "lidar-jovianVortexHunter",
    "satellite-planetFour",
    "telescope-minorPlanet",
    "lidar-earthCloudRead",
    "automaton-aiForMars",
    "zoodex-planktonPortal",
    "zoodex-penguinWatch",
    "sunspot",
    "zoodex-burrowingOwl",
    "roverImg",
    "marsCloud",
    "lightcurve",
    "DiskDetective",
    "zoodex-iguanasFromAbove",
];

type DiscoveriesPageProps = {
    defaultClassificationType?: string;
};

type ClassificationAuthor = {
    id: string;
    full_name: string | null;
    avatar_url: string | null; 
};
  
type Classification = {
    votes: any;
    id: number;
    content: string | null;
    classificationtype: string | null;
    classificationConfiguration: any;
    media: any[] | null;
    author: ClassificationAuthor | null;
};

export default function DiscoveriesPage({ defaultClassificationType }: DiscoveriesPageProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(
    defaultClassificationType || null
  );

  useEffect(() => {
    const fetchClassifications = async () => {
      const query = supabase
        .from("classifications")
        .select(`
          id,
          created_at,
          content,
          classificationtype,
          classificationConfiguration,
          media,
          author!inner (
            id,
            full_name,
            avatar_url
          ),
          votes!inner (
            user_id
          )
        `, { count: "exact" })
        .eq("author", session?.user.id); // This is optional
  
      if (selectedType) {
        query.eq("classificationtype", selectedType);
      };
  
      const { data, error } = await query;
  
      if (error) {
        console.error("Error fetching classifications:", error);
        return;
      };
  
      const formattedData: Discovery[] = (data as unknown as Classification[]).map((item) => ({
        id: item.id.toString(),
        project: "Unknown Project",
        classification: item.classificationtype || "N/A",
        classificationConfiguration: item.classificationConfiguration || {},
        content: item.content || "No content available",
        author: {
          name: item.author?.full_name || "Anonymous",
          avatar: item.author?.avatar_url || "/default-avatar.png",
        },
        media: (item.media || []).filter(
          (url) => typeof url === "string" && url.startsWith("http")
        ), 
        votes: item.votes ? item.votes.length : 0,
        comments: 0,
      }));
  
      setDiscoveries(formattedData);
    };
  
    fetchClassifications();
  }, [selectedType]);  

  return (
    <div className="min-h-screen bg-gray-50/50 p-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-center text-[#2C4F64]">
          Recent Discoveries
        </h1>
        {!defaultClassificationType && (
          <div className="flex justify-center mb-4">
            <select
              className="p-2 border border-gray-300 rounded"
              value={selectedType || ""}
              onChange={(e) => setSelectedType(e.target.value || null)}
            >
              <option value="">All Types</option>
              {classificationTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        )}
        {discoveries.length > 0 ? (
          discoveries.map((discovery) => (
            <DiscoveryCard key={discovery.id} discovery={discovery} />
          ))
        ) : (
          <p className="text-center text-gray-500">No discoveries yet!</p>
        )}
      </div>
    </div>
  );
};