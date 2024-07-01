"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient, SupabaseClient } from "@supabase/auth-helpers-react";
import CardForum, { Profile, TProps } from "./ClassificationCard";
import ReactHtmlParser from 'react-html-parser';

interface Classification { 
  id: number;
  content: string;
  author: string; 
  media: string[];
  anomaly: number;
};

const ClassificationsFeed: React.FC = () => {
  const supabase = useSupabaseClient();
  const [posts, setPosts] = useState<Classification[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
       .from('classifications')
       .select('*');
      
      if (error) {
        console.error('Error loading classifications:', error.message);
      } else {
        setPosts(data || []);
      }
    };

    fetchData();
  }, [supabase]);

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id} className="card">
          <h3>{post.author}</h3>
          <p>{post.anomaly}</p>
          {Array.isArray(post.media) && post.media.map((url, index) => (
            <img key={index} src={url} alt="" />
          ))}
          {ReactHtmlParser(post.content)} {/* Directly render the parsed HTML */}
        </div>
      ))}
    </div>
  );
};

export default ClassificationsFeed;

type ClassificationFeedForIndividualPlanetProps = {
  planetId: { planetId: { id: number } };
};

export function ClassificationFeedForIndividualPlanet({
  planetId,
}: ClassificationFeedForIndividualPlanetProps) {
  const supabase: SupabaseClient = useSupabaseClient();
  const session = useSession();

  const [posts, setPosts] = useState<TProps[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const postsResponse = await supabase
        .from("classifications")
        .select("id, created_at, content, anomaly, media, profiles(id, avatar_url, full_name, username)")
        .eq("anomaly", planetId.planetId.id)
        .order("created_at", { ascending: false });

      if (postsResponse.error || !postsResponse.data) {
        console.error("Error fetching posts:", postsResponse.error);
        return;
      }

      // Adjust the data format to match TProps type
      const formattedPosts = postsResponse.data.map((post: any) => ({
        id: post.id,
        created_at: post.created_at,
        content: post.content,
        anomaly: post.anomaly,
        media: post.media,
        profiles: post.profiles[0], // Assuming profiles is an array and we need the first item
      }));

      setPosts(formattedPosts);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching posts:", error.message);
      } else {
        console.error("Unknown error fetching posts");
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 py-5" style={{ maxWidth: "100%", margin: "auto" }}>
      {posts.map((post) => (
        <React.Fragment key={post.id}>
          <CardForum {...post} />
          <p>{post.anomaly}</p>
        </React.Fragment>
      ))}
    </div>
  );
}

export default ClassificationFeedForIndividualPlanet;
