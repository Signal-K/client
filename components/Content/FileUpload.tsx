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
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const _uris = await upload({ data: acceptedFiles });
      setUris(_uris);
    },
    [upload],
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const uploadAndAddToSupabase = async (files: File[]) => {
    try {
      const uris = await upload({ data: files });
      setUris(uris);

      // Add URIs to Supabase table
      for (const uri of uris) {
        supabase.from('files')
          .insert({
            filename: uri
          });
      }
    } catch (error) {
      console.error("Error uploading files and adding to Supabase:", error);
    }
  };

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