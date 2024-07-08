import React, { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import CardForum, { Profile, TProps } from "./ClassificationCard";

interface Classification {
  classificationConfiguration: any;
  id: number;
  content: string;
  author: string;
  media: string[];
  anomaly: number;
  created_at: string;
  classificationtype: any;
  profiles: Profile;
  anomalies: {
    avatar_url: string;
    anomalytype: string;
  };
  classificationCount: number;
};

const ClassificationsFeed: React.FC = () => {
  const supabase = useSupabaseClient();
  const [posts, setPosts] = useState<Classification[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch classifications with profiles and anomalies data
        const { data, error } = await supabase
          .from('classifications')
          .select(`
            id,
            created_at,
            content,
            author,
            anomaly,
            media,
            classificationtype,
            classificationConfiguration,
            profiles (
              id,
              avatar_url,
              username
            ),
            anomalies (
              avatar_url,
              anomalytype
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        // Process the fetched data
        const processedData = await Promise.all(
          (data || []).map(async (classification: any) => {
            // Get the count of classifications for this anomaly
            const { data: anomalyData, error: anomalyError } = await supabase
              .from('anomalies')
              .select('avatar_url')
              .eq('id', classification.anomaly)
              .single();

            if (anomalyError) {
              throw new Error(anomalyError.message);
            }

            const classificationCount = data.filter((c: any) => c.anomaly === classification.anomaly).length;

            return {
              ...classification,
              anomalies: {
                avatar_url: anomalyData?.avatar_url || '/default-anomaly-avatar.png',
                anomalytype: classification.anomalies.anomalytype
              },
              classificationCount
            };
          })
        );

        setPosts(processedData);

      } catch (error) {
        console.error('Error loading classifications:', error instanceof Error ? error.message : 'Unknown error');
      }
    };

    fetchData();
  }, [supabase]);

  return (
    <div className="flex flex-col items-center gap-4 py-5 space-y-4" style={{ maxWidth: "100%", margin: "auto" }}>
      {posts.map((post) => (
        <CardForum
          id={post.id}
          content={post.content}
          created_at={post.created_at}
          profiles={post.profiles}
          media={post.media}
          anomaly={post.anomaly}
          classificationtype={post.classificationtype}
          anomalies={post.anomalies}
          classificationCount={post.classificationCount}
          classificationConfiguration={post.classificationConfiguration} 
        />      
      ))}
    </div>
  );
};

export default ClassificationsFeed;