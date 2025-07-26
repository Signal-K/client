'use client';

import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface Comment {
  id: number;
  content: string;
  created_at: string;
  author: string;
  classification_id: number;
};

interface Classification {
  id: number;
  content: string;
  created_at: string;
  classificationConfiguration: {
    parentPlanetLocation?: number;
    [key: string]: any;
  };
  anomaly: number | null;
  media?: any;
};

interface RelatedClassificationsProps {
  parentId: number;
};

export default function RelatedClassifications({ parentId }: RelatedClassificationsProps) {
  const supabase = useSupabaseClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedClassifications, setRelatedClassifications] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Step 1: Get the classification with parentId to find its anomaly
      const { data: baseClassification, error: baseError } = await supabase
        .from("classifications")
        .select('id, anomaly, classificationConfiguration')
        .eq('id', parentId)
        .single();

      if (baseError || !baseClassification) {
        setError('Failed to fetch base classification.');
        setLoading(false);
        return;
      }

      const { anomaly } = baseClassification;
      if (!anomaly) {
        setError('No anomaly found in base classification.');
        setLoading(false);
        return;
      }

      // Step 2: Get all classifications with matching parentPlanetLocation = anomaly
      const { data: matchingClassifications, error: matchError } = await supabase
        .from("classifications")
        .select('*')
        .filter('classificationConfiguration->>parentPlanetLocation', 'eq', anomaly.toString());

      if (matchError) {
        setError('Failed to fetch related classifications.');
        setLoading(false);
        return;
      }

      setRelatedClassifications(matchingClassifications || []);

      // Step 3: Get all comments where classification_id = parentId
      const { data: classificationComments, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('classification_id', parentId);

      if (commentsError) {
        setError('Failed to fetch comments.');
        setLoading(false);
        return;
      }

      setComments(classificationComments || []);
      setLoading(false);
    };

    fetchData();
  }, [parentId, supabase]);

  if (loading) return <div className="text-white">Loading related classifications and comments...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6 text-white">
      <div>
        <h2 className="text-xl font-bold mb-2">Comments on This Classification</h2>
        {comments.length === 0 ? (
          <p className="text-gray-400">No comments found.</p>
        ) : (
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-black/30 p-3 rounded-lg">
                <p className="text-sm">{comment.content}</p>
                <p className="text-xs text-gray-400">Posted on {new Date(comment.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">Classifications with Same Anomaly Location</h2>
        {relatedClassifications.length === 0 ? (
          <p className="text-gray-400">No related classifications found.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-auto pr-2">
            {relatedClassifications.map((rc) => (
              <div key={rc.id} className="bg-black/30 p-4 rounded-xl">
                <pre className="whitespace-pre-wrap break-words text-sm">
                  {JSON.stringify(rc, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};