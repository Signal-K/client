import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

interface Props {
    author: string;
};

export const AvatarGenerator: React.FC<Props> = ({ author }) => {
    const [avatarUrl, setAvatarUrl] = useState("");
  
    useEffect(() => {
      const generateAvatar = () => {
        const apiUrl = `https://api.dicebear.com/6.x/bottts/svg?seed=${encodeURIComponent(author)}`;
        setAvatarUrl(apiUrl);
      };
  
      generateAvatar();
    }, [author]);
  
    return (
      <div>
        {avatarUrl && (
          <div className="mt-6">
            <img src={avatarUrl} alt="Generated Avatar" className="w-16 h-16 rounded-md shadow-md" />
          </div>
        )}
      </div>
    );
};

export function Avatar() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function fetchAvatar() {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", session.user.id)
        .single();

      if (!ignore) {
        if (error) {
          console.warn("Error fetching avatar: ", error.message);
        } else if (data) {
          setAvatarUrl(data.avatar_url || null);
        };

        setLoading(false);
      };
    };

    fetchAvatar();

    return () => {
      ignore = true;
    };
  }, [session, supabase]);

  if (loading) {
    return (
      <div className="w-16 h-16 rounded-full bg-gray-300 animate-pulse" />
    );
  };

  return (
    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300 border-2 border-gray-400 shadow-md">
      {avatarUrl ? (
        <Image
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarUrl}`}
          alt="User Avatar"
          layout="fill"
          objectFit="cover"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

interface PostAvatarProps {
  author: string;
};

export function PostAvatar({ author }: PostAvatarProps) {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchAvatar() {
      if (!session) {
        return;
      };

      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", session.user.id)
        .single();

      if (!ignore) {
        if (error) {
          console.warn("Error fetching avatar: ", error.message);
        } else if (data) {
          setAvatarUrl(data.avatar_url || null);
        };

        setLoading(false);
      };
    };

    fetchAvatar();
    
    return () => {
      ignore = true;
    };
  }, [session]);

  if (loading) {
    return (
      <div className="w-16 h-16 rounded-full bg-gray-300 animate-pulse" />
    );
  };

  return (
    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300 border-2 border-gray-400 shadow-md">
      {avatarUrl && (
        <Image
          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarUrl}`}
          alt="User avatar for post"
          layout="fill"
          objectFit="cover"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};