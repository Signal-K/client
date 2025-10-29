"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Image from "next/image";
import { Info } from "lucide-react";

interface SourceClassificationCalloutProps {
  classificationConfiguration: any;
}

export function SourceClassificationCallout({ classificationConfiguration }: SourceClassificationCalloutProps) {
  const supabase = useSupabaseClient();
  const [sourceClassification, setSourceClassification] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSourceClassification() {
      const sourceId = classificationConfiguration?.source_classification_id;
      
      if (!sourceId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("classifications")
          .select("id, content, author, media, created_at, classificationtype")
          .eq("id", sourceId)
          .single();

        if (error) {
          console.error("Error fetching source classification:", error);
        } else {
          setSourceClassification(data);
        }
      } catch (err) {
        console.error("Exception fetching source classification:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSourceClassification();
  }, [classificationConfiguration, supabase]);

  if (loading || !sourceClassification) return null;

  // Extract first image from media array
  const getFirstImage = (media: any) => {
    if (!media) return null;
    
    if (Array.isArray(media)) {
      for (const item of media) {
        if (Array.isArray(item) && typeof item[0] === "string" && item[0].startsWith("http")) {
          return item[0];
        } else if (typeof item === "string" && item.startsWith("http")) {
          return item;
        }
      }
    }
    return null;
  };

  const sourceImage = getFirstImage(sourceClassification.media);

  return (
    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            🔗 Based on Light Curve Data
          </h4>
          <p className="text-xs text-blue-800 dark:text-blue-200">
            This planet classification was derived from light curve analysis (Classification #{sourceClassification.id})
            {sourceClassification.content && `: "${sourceClassification.content}"`}
          </p>
          
          {sourceImage && (
            <div className="mt-2 rounded-md overflow-hidden border border-blue-300 dark:border-blue-700">
              <img
                src={sourceImage}
                alt="Source light curve data"
                className="w-full h-40 object-contain bg-black"
              />
              <div className="bg-blue-100 dark:bg-blue-900/40 px-3 py-1.5 text-xs text-blue-700 dark:text-blue-300">
                Original light curve observation
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
