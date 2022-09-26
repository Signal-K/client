import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { ConnectWallet, useStorageUpload, MediaRenderer } from "@thirdweb-dev/react";
import { NextPage } from "next";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQuery } from "react-query";

const IPFS_GATEWAY = "https://d4b4e2e663a6efce5f7f8310426ba24a.ipfscdn.io/ipfs/";

interface FileUploadProps {
  projectId: number; // Pass project ID as prop
}

const UploadFileToRepo: NextPage<FileUploadProps> = ({ projectId }) => {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [uris, setUris] = useState<string[]>([]);

  const { mutateAsync: upload } = useStorageUpload();

  const uploadAndAddToSupabase = useCallback(async (files: File[]) => {
    try {
      const uris = await upload({ data: files });

      // Add URIs to Supabase table
      const { error, data } = await supabase.from('comments').insert(
        uris.map(uri => ({
          content: uri,
          author: session?.user?.id,
          parent: projectId, // Associate with project ID
        }))
      );

      if (error) {
        console.error("Error inserting data into Supabase:", error.message);
        return;
      };

      console.log("Data inserted successfully:", data);

      setUris(uris);
    } catch (error) {
      console.error("Error uploading files and adding to Supabase:", error);
    }
  }, [upload, supabase, session?.user?.id, projectId]);

  const fetchAndRenderFromSupabase = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("content")
        .gte("id", 23)
        .lt("id", 29)
        .eq("author", session?.user?.id)
        .eq("parent", projectId); // Fetch files associated with project ID

      if (error) {
        console.error("Error fetching files from Supabase:", error.message);
        return;
      }
      
      if (data) {
        const urisFromSupabase = data.map((row: any) => row.content);
        setUris(urisFromSupabase);
      }
    } catch (error: any) {
      console.error("Error fetching files from Supabase:", error.message);
    }
  }, [session?.user?.id, supabase, projectId]);

  useEffect(() => {
    fetchAndRenderFromSupabase();
  }, [fetchAndRenderFromSupabase]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    await uploadAndAddToSupabase(acceptedFiles);
  }, [uploadAndAddToSupabase]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

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

export default UploadFileToRepo;