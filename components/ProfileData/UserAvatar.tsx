import React, { useState, useEffect } from "react";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";

export default function ProfileAvatar() {
  // Supabase client setup
  const supabase = useSupabaseClient();
  const session = useSession();

  // User actions state management
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (session) downloadImage(session.user.id);
  }, [session]);

  const downloadImage = async (userId) => {
    try {
      const path = `${userId}.jpg`; // You can customize the extension
      const { data, error } = await supabase.storage.from("avatars").download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      console.log("Error downloading user avatar image: ", error);
    }
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const userId = session.user.id;
      let filePath = `${userId}.${fileExt}`;

      // Check if the file already exists, if so, generate a unique filename
      const { data: existingFiles, error: listError } = await supabase
        .storage.from("avatars")
        .list("avatars");
      if (listError) {
        throw listError;
      }

      const existingFileNames = existingFiles.map((file) => file.name);
      while (existingFileNames.includes(filePath)) {
        filePath = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      }

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      if (uploadError) {
        throw uploadError;
      }

      setAvatarUrl(URL.createObjectURL(file));
    } catch (error) {
      alert("Error uploading avatar, check console");
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <img src={avatarUrl} alt="User Avatar" />
      <input type="file" accept="image/*" onChange={uploadAvatar} />
    </div>
  );
}