'use client';

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

interface Comment {
  id: number;
  content: string;
  author: string;
  configuration?: Record<string, any>;
  surveyor: boolean;
};

interface Classification {
  id: number;
  content: string | null;
  author: string | null;
  classificationConfiguration?: Record<string, any>;
  anomaly: Anomaly | null;
  media: (string | { uploadUrl?: string })[] | null;
  classificationtype: string | null;
  created_at: string;
  title?: string;
  votes?: number;
  category?: string;
  tags?: string[];
  images?: string[];
  relatedClassifications?: Classification[];
};

type Anomaly = {
    id: number;
    content: string | null;
    anomalytype: string | null;
    mass: number | null;
    radius: number | null;
    density: number | null;
    gravity: number | null;
    temperature: number | null;
    orbital_period: number | null;
    avatar_url: string | null;
    created_at: string;
};

interface ClassificationCommentsProps {
  classification: Classification;
};

export default function ClassificationComments({ classification }: ClassificationCommentsProps) {
  const supabase = useSupabaseClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [showOnlyAuthor, setShowOnlyAuthor] = useState(false);

  useEffect(() => {
    async function fetchComments() {
      const { data, error } = await supabase
        .from("comments")
        .select("id, content, author, configuration, surveyor")
        .eq("classification_id", classification.id)
        .eq("surveyor", "TRUE");

      if (!error && data) {
        setComments(data);
      };
    };

    fetchComments();
  }, [classification.id, supabase]);

  const filteredComments = showOnlyAuthor
    ? comments.filter((comment) => comment.author === classification.author)
    : comments;

  return (
    <div className="p-4 border border-gray-200 rounded-md bg-gray-800 text-white">
      <h3 className="text-lg font-bold">Comments</h3>
      <label className="flex items-center mt-2">
        <input
          type="checkbox"
          checked={showOnlyAuthor}
          onChange={() => setShowOnlyAuthor(!showOnlyAuthor)}
          className="mr-2"
        />
        Show only classification author's comments
      </label>
      <div className="mt-2">
        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => (
            <div key={comment.id} className="p-2 border border-gray-600 rounded-md mt-2">
              <p className="text-sm">{comment.content}</p>
              {comment.configuration && (
                <pre className="text-xs bg-gray-700 p-2 rounded mt-1">{JSON.stringify(comment.configuration, null, 2)}</pre>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm">No comments available.</p>
        )}
      </div>
      {classification.classificationConfiguration && (
        <div className="mt-4 p-2 border border-gray-600 rounded-md">
          <h4 className="text-md font-semibold">Classification Configuration</h4>
          <pre className="text-xs bg-gray-700 p-2 rounded">{JSON.stringify(classification.classificationConfiguration, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};