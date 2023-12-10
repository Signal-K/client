import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { ConnectWallet, useStorageUpload, MediaRenderer } from "@thirdweb-dev/react";
import { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQuery } from "react-query";

const IPFS_GATEWAY = "https://d4b4e2e663a6efce5f7f8310426ba24a.ipfscdn.io/ipfs/";

export default function FileUpload() {
  const supabase = useSupabaseClient();
  const [uris, setUris] = useState<string[]>([]);

  const { mutateAsync: upload } = useStorageUpload();

  const uploadAndAddToSupabase = useCallback(async (files: File[]) => {
    try {
      const uris = await upload({ data: files });

      // Add URIs to Supabase table
      const { error, data } = await supabase.from('comments').insert(uris.map(uri => ({ content: uri })));

      if (error) {
        console.error("Error inserting data into Supabase:", error.message);
        return;
      }

      console.log("Data inserted successfully:", data);

      setUris(uris);
    } catch (error) {
      console.error("Error uploading files and adding to Supabase:", error);
    }
  }, [upload, supabase]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    await uploadAndAddToSupabase(acceptedFiles);
  }, [uploadAndAddToSupabase]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  /*
    function createPost() {
    supabase
      .from('posts_duplicates')
      .insert({
        author: session?.user?.id,
        content,
        media: uploads,
        planets2: planetId2,
      })
      .then(async response => {
        if (!response.error) {
          // Increment the user's experience locally
          setUserExperience(userExperience + 1);
  
          // Update the user's experience in the database
          await supabase.from('profiles').update({
            experience: userExperience + 1,
          }).eq('id', session?.user?.id);
  
          // Add a copy of the planet to the user's inventory
          await supabase.from('inventoryPLANETS').insert([
            {
              planet_id: planetId2,
              owner_id: session?.user?.id,
            },
          ]);
  
          alert(`Post ${content} created`);
          setContent('');
          setUploads([]);
          if (onPost) {
            onPost();
          }
        }
      });
  }  
  */

  const fetchAndRenderFromSupabase = async () => {
    try {
      const { data, error } = await supabase.from("files").select("file_url");
      if (error) {
        console.error("Error fetching files from Supabase:", error.message);
        return;
      }
      if (data) {
        const urisFromSupabase = data.map((row: any) => row.file_url);
        setUris(urisFromSupabase);
      }
    } catch (error: any) {
      console.error("Error fetching files from Supabase:", error.message);
    }
  };

  useEffect(() => {
    fetchAndRenderFromSupabase();
  }, []);

  return (
    <div>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <button>Drop files to upload them to IPFS</button>
      </div>
      <div>
        {uris.map((uri) => (
          <MediaRenderer key={uri} src={uri} alt="image" />
        ))}
      </div>
    </div>
  );
};