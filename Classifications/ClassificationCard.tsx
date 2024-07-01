import React, { ReactNode} from "react";
import Link from "next/link";
import { getMetaData } from "@/lib/helper/str.helper";

export type Profile = {
  id: string;
  avatar_url: string;
  username: string;
};

export type TProps = {
  anomaly: ReactNode;
  id: number;
  content: string;
  created_at: string;
  profiles: Profile;
  media: string[];
  planets2?: string;
};

const CardForum: React.FC<TProps> = ({
  id,
  content,
  created_at,
  profiles,
  planets2,
  media,
}) => {
  return (
    <>
      <Link href={`/profile/${profiles?.username}`}>
        <div className="p-4 pb-0 group cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="flex items-center space-x-2">
              <div className="rounded-md overflow-hidden">
                <img
                  src={
                    "https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/avatars/" +
                    profiles?.avatar_url ?? ""
                  }
                  alt={profiles?.username}
                  className="rounded-md w-10 h-10 object-cover"
                />
                {!profiles?.avatar_url && (
                  <div className="rounded-md w-10 h-10 flex items-center justify-center bg-gray-200">
                    {profiles?.username}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <h2 className="group-hover:underline">
                  {profiles?.username}
                </h2>
              </div>
            </div>
            <div className="flex-grow"></div>
            <small className="text-foreground/60 text-sm">
              {getMetaData(created_at)}
            </small>
          </div>
        </div>
      </Link>
      <div className="p-4 pt-2">
        <p className="mt-1 break-all max-w-full">{content}</p>
        <div>
          {media?.length > 0 && (
            <div className="flex gap-4">
              {media.map((media) => (
                <div key={media} className="rounded-md overflow-hidden">
                  <img src={media} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="p-0 flex-col items-start pb-2">
        <div className="mb-2 border-t border-gray-200"></div>
      </div>
    </>
  );
};

export default CardForum;

export type RoverContentCardProps = {
  id: number;
  content: string;
  created_at: string;
  profiles: Profile;
  media: string[];
};