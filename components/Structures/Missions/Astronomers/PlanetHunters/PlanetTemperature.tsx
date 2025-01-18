import React, { useEffect, useState } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { SimplePostSingle } from "@/content/Posts/SimplePostSingle";
import { SciFiPanel } from "@/components/ui/styles/sci-fi/panel";

interface ClassificationConfiguration {
  classificationOptions: { [key: string]: any };
  temperature?: string;
  votes?: number;
}

interface Classification {
  author: string;
  id: number;
  content: string;
  title: string;
  classificationtype: string;
  anomaly: number;
  media: (string | { uploadUrl?: string })[] | null;
  classificationConfiguration?: ClassificationConfiguration;
  image_url?: string;
  images?: string[];
  votes?: number;
}

const PlanetTemperatureForm: React.FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [loading, setLoading] = useState(true);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [currentClassification, setCurrentClassification] = useState<Classification | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ comment: string; temperature: string }>({ comment: "", temperature: "" });

  useEffect(() => {
    const fetchClassifications = async () => {
      try {
        const { data, error } = await supabase
          .from("classifications")
          .select("*")
          .eq("classificationtype", "planet");

        if (error) {
          throw new Error(`Error fetching classifications: ${error.message}`);
        }

        const processedData = data?.map((classification) => {
          const media = classification.media;
          let images: string[] = [];

          if (Array.isArray(media)) {
            media.forEach((item) => {
              if (typeof item === "string" && item.startsWith("http")) {
                images.push(item);
              } else if (Array.isArray(item)) {
                item.forEach((nested) => {
                  if (typeof nested === "string" && nested.startsWith("http")) {
                    images.push(nested);
                  }
                });
              } else if (typeof item === "object" && item.uploadUrl) {
                images.push(item.uploadUrl);
              }
            });
          }

          const votes = classification.classificationConfiguration?.votes || 0;

          return { ...classification, images, votes };
        });

        setClassifications(processedData || []);
        setCurrentClassification(processedData?.[0] || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClassifications();
  }, [supabase]);

  const fetchRandomClassification = () => {
    if (classifications.length === 0) return;
    const randomIndex = Math.floor(Math.random() * classifications.length);
    setCurrentClassification(classifications[randomIndex]);
    setCommentInputs({ comment: "", temperature: "" });
  };

  const handleProposeTempComment = async () => {
    if (!currentClassification) return;
    const { comment, temperature } = commentInputs;
    if (!comment || !temperature) {
      console.error("Both comment and temperature are required!");
      return;
    }

    try {
      const { error } = await supabase
        .from("comments")
        .insert([
          {
            content: comment,
            classification_id: currentClassification.id,
            author: session?.user?.id,
            configuration: { temperature },
          },
        ]);

      if (error) {
        throw error;
      }

      setCommentInputs({ comment: "", temperature: "" });
      console.log("Comment inserted successfully with temperature value");
    } catch (err) {
      console.error("Error inserting comment: ", err);
    }
  };

  const handleInputChange = (field: "comment" | "temperature", value: string) => {
    setCommentInputs((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <>Loading...</>;
  }

  return (
    <div className="flex flex-col justify-center items-center">
      {currentClassification ? (
        <div className="w-full max-w-3xl p-4">
          <SciFiPanel>
            <SimplePostSingle
              id={currentClassification.id.toString()}
              title={`Planet discovery #${currentClassification.id}`}
              author={currentClassification.author || "Unknown"}
              content={currentClassification.content || ""}
              category={currentClassification.classificationtype || "Planet"}
              images={currentClassification.images || []}
            //   votes={currentClassification.votes || 0}
            />
          </SciFiPanel>
          <SciFiPanel>
            <div className="flex flex-col items-center mt-4 gap-4">
              <textarea
                value={commentInputs.comment}
                onChange={(e) => handleInputChange("comment", e.target.value)}
                placeholder="Enter your comment"
                className="w-full p-2 border text-gray-500 border-gray-300 rounded"
              />
              <input
                type="number"
                value={commentInputs.temperature}
                onChange={(e) => handleInputChange("temperature", e.target.value)}
                placeholder="Temp (°C)"
                className="w-full p-2 border text-gray-500 border-gray-300 rounded"
              />
              <button
                onClick={handleProposeTempComment}
                className="px-4 py-2 text-white bg-blue-500 rounded"
              >
                Submit
              </button>
              <button
                onClick={fetchRandomClassification}
                className="px-4 py-2 text-white bg-gray-500 rounded mt-2"
              >
                Show Random Post
              </button>
            </div>
          </SciFiPanel>
        </div>
      ) : (
        <div>No classifications found.</div>
      )}
    </div>
  );
};

export default PlanetTemperatureForm;