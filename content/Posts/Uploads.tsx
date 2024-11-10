"use client";

import React, { useEffect, useState } from "react";
import { UploadCard } from "./UploadCard";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

interface Upload {
  id: number;
  created_at: string;
  author: string | null;
  media: any | null; 
  structure_type: string | null; 
};

export default function Uploads() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUploads = async () => {
    if (!session?.user) {
      setError("User session not found.");
      setLoading(false);
      return;
    }
  
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .eq('author', session.user.id)
        .order('created_at', { ascending: false }) as { data: Upload[]; error: any };
  
      if (error) throw error;

      setUploads(data);
    } catch (error) {
      console.error("Error fetching uploads:", error);
      setError("Failed to load uploads.");
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    fetchUploads();
  }, [session]);

  return (
      <div className="space-y-8">
        {loading ? (
          <p>Loading uploads...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          uploads.map((upload) => (
            <UploadCard
              key={upload.id}
              uploadId={upload.id}
              author={upload.author}
              media={upload.media}
              structureType={upload.structure_type}
              createdAt={upload.created_at}
            />
          ))
        )}
      </div>
  );
};
