import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";

type Profile = {
  username: string;
  // Add other profile properties as needed
};

type Session = {
  user: {
    id: string;
  };
  // Add other session properties as needed
};

export default function IndexAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const supabase = useSupabaseClient();

  async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    }
  }

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user authenticated");
      let { data, error, status } = await supabase
        .from("profiles")
        .select("username, website, avatar_url, address, address2")
        .eq("id", session?.user?.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      console.error("Error loading your user data:", error);
    } finally {
      setLoading(false);
    }
  }

  function fetchUser() {
    supabase
      .from("profiles")
      .select()
      .eq("id", session?.user?.id)
      .then((result) => {
        if (result.error) {
          console.error("Error fetching user data:", result.error);
        }
        if (result.data) {
          setProfile(result.data[0]);
        }
      });
  }

  async function saveProfile() {
    try {
      const result = await supabase
        .from("profiles")
        .update({
          username,
          avatar_url,
        })
        .eq("id", session?.user?.id);
  
      if (!result.error) {
        setProfile(profile);
      }
      setEditMode(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  }  

  async function updateProfile({
    username,
    avatar_url,
  }: {
    username: string;
    avatar_url: string;
  }) {
    try {
      setEditMode(true);
      if (!session?.user) throw new Error("No user authenticated");
      const updates = {
        id: session?.user?.id,
        username,
        avatar_url,
        updated_at: new Date().toISOString(),
      };
      let { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;
      alert("Profile updated");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setEditMode(false);
    }
  }

  const uploadAvatar: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    try {
      setIsUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${session?.user?.id}.${fileExt}`;
      const filePath = `${fileName}`;
      let { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      if (uploadError) {
        throw uploadError;
      }
    } catch (error) {
      alert("Error uploading avatar, check console");
      console.error("Error uploading avatar:", error);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchUser();
    }
  }, [session?.user?.id]);

  return (
    <>
      <center>
        <h1>Your profile</h1>
        <div className="align-content: center">
          {editMode ? (
            <div>
              <input
                id="username"
                type="text"
                className="border py-2 px-3 rounded-md mt-1"
                placeholder={profile?.username || ""}
                onChange={(e) => setUsername(e.target.value)}
                value={username || ""}
              />
              <button
                onClick={saveProfile}
                className="inline-flex mx-1 gap-1 bg-white rounded-md shadow-sm shadow-gray-500 py-1 px-2"
              >
                Save profile
              </button>
            </div>
          ) : (
            <div>
              <p>Username: {profile?.username || "N/A"}</p>
              <button onClick={() => setEditMode(true)}>Edit Profile</button>
            </div>
          )}
        </div>
      </center>
    </>
  );
}