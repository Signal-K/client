"use client";

import React, { useState, useEffect, use } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useActivePlanet } from "@/context/ActivePlanet";
import { useProfileContext } from "@/context/UserProfile";

interface RoverClassificationFromItem32Props {
    roverId: number;
  }
  
export const RoverClassificationFromItem32: React.FC<RoverClassificationFromItem32Props> = ({ roverId }) => {
    const supabase = useSupabaseClient();
    const session = useSession();
    const { activePlanet } = useActivePlanet();
  
    const [content, setContent] = useState<string>("");
    const [uploads, setUploads] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState<boolean>(false);
  
    const newAnomalyData = {
      user_id: session?.user.id,
      anomaly_id: roverId,
    };
  
    const createPost = async () => {
      if (!activePlanet?.id || !session) {
        return;
      }
  
      try {
        const { data: classification, error } = await supabase
          .from("classifications")
          .insert({
            author: session.user.id,
            anomaly: roverId,
            media: uploads,
            content: content,
          })
          .single();

          const missionData = {
            user: session?.user?.id,
            time_of_completion: new Date().toISOString(),
            mission: 18,
        };
      
        const { error: missionError } = await supabase
          .from('missions')
          .insert([missionData]);
          
          if (missionError) {
            throw missionError;
          };
  
        if (error) {
          throw error;
        }
  
        await supabase.from("user_anomalies").insert([newAnomalyData]);
        alert('Post created successfully!');
        setContent("");
      } catch (error: any) {
        console.error("Error creating classification: ", error.message);
      }
    };
  
    // const addMedia = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //   const files = e.target.files;
    //   if (files && files.length > 0 && session) {
    //     setIsUploading(true);
    //     for (const file of files) {
    //       const fileName = Date.now() + session.user.id + file.name;
    //       const result = await supabase.storage.from("media").upload(fileName, file);
    //       if (result.data) {
    //         const url = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/media' + result.data.path;
    //         setUploads((prevUploads) => [...prevUploads, url]);
    //       } else {
    //         console.error(result);
    //       }
    //     }
    //     setIsUploading(false);
    //   }
    // };
  
    return (
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="grow p-3 h-24 rounded-xl"
          placeholder={"What do you think about this anomaly/planet"}
        />
        {isUploading && (
          <div className="text-center">
            <p>Uploading...</p>
          </div>
        )}
        {uploads.length > 0 && (
          <div className="flex gap-2 mt-4">
            {uploads.map((upload, index) => (
              <div key={index}>
                <img src={upload} className="w-auto h-48 rounded-md" alt={`Upload ${index}`} />
              </div>
            ))}
          </div>
        )}
        <button onClick={createPost} className="text-black px-2 py-1 rounded-md bg-blue-500 hover:bg-blue-600">
          Share
        </button>
      </div>
    );
  };