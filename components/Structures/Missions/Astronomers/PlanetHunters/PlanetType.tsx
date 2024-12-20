import { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { PostCardSingle } from "@/content/Posts/PostSingle";

interface Classification {
  author: string;
  id: number;
  content: string;
  title: string;
  votes: number;
  category: string;
  images: string[];
  anomaly: number;
  classificationtype: string;
  media: any;
  classificationConfiguration: {
    votes: number;
    classificationOptions: { [key: string]: any };
  };
  image_url?: string;
}

const PlanetTypeCommentForm = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [loading, setLoading] = useState(true);
  const [classifications, setClassifications] = useState<Classification[]>([]);

  useEffect(() => {
    const fetchClassifications = async () => {
      try {
        const { data, error } = await supabase
          .from("classifications")
          .select("*")
          .eq("classificationtype", "planet");

        if (error) throw new Error("Error fetching classifications: " + error.message);

        const processedData = data?.map((classification) => {
          const media = classification.media;
          let images: string[] = [];

          if (Array.isArray(media) && media.length === 2 && typeof media[1] === "string") {
            images.push(media[1]);
          } else if (media && media.uploadUrl) {
            images.push(media.uploadUrl);
          }

          const votes = classification.classificationConfiguration?.votes || 0;

          return { ...classification, images, votes };
        });

        setClassifications(processedData || []);
      } catch (err) {
        console.error(err);
      }
    };

    setLoading(true);
    fetchClassifications().finally(() => setLoading(false));
  }, [supabase]);

  const handleVote = async (classificationId: number, currentConfig: any) => {
    try {
      const currentVotes = currentConfig?.votes || 0;

      const updatedConfig = {
        ...currentConfig,
        votes: currentVotes + 1,
      };

      const { error } = await supabase
        .from("classifications")
        .update({ classificationConfiguration: updatedConfig })
        .eq("id", classificationId);

      if (error) {
        console.error("Error updating classificationConfiguration:", error);
      } else {
        setClassifications((prevClassifications) =>
          prevClassifications.map((classification) =>
            classification.id === classificationId
              ? { ...classification, votes: updatedConfig.votes }
              : classification
          )
        );
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 w-screen bg-card max-w-lg mx-auto rounded-lg shadow-sm">
      {classifications.length > 0 ? (
        <div className="space-y-8">
          {classifications.map((classification) => (
            <div key={classification.id}>
              <PostCardSingle
                key={classification.id}
                classificationId={classification.id}
                title={classification.title}
                author={classification.author}
                content={classification.content}
                votes={classification.votes}
                category={classification.category}
                images={classification.images}
                anomalyId={classification.anomaly.toString()}
                classificationConfig={classification.classificationConfiguration}
                classificationType={classification.classificationtype}
                onVote={() => handleVote(classification.id, classification.classificationConfiguration)}
                enableNewCommentingMethod
              />
              {classification.image_url && (
                <img
                  src={classification.image_url}
                  alt={`Classification ${classification.id}`}
                  className="w-full h-auto rounded-md shadow-sm"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No classifications found.</p>
      )}
    </div>
  );
};

export default PlanetTypeCommentForm;