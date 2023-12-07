import { AvatarFallback, Avatar, AvatarImage } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Card, CardContent, CardFooter, CardTitle } from "./PostCard";
import { Separator } from "@radix-ui/react-separator";
import { useToast } from "../ui/use-toast";
import { getMetaData } from "../../lib/helper/str.helper";
import { Megaphone, MessagesSquare, Share2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";

type TProps = {
  id: number;
  content: string;
  created_at: string;
  profiles: {
    id: number;
    avatar_url: string;
    username: string;
  };
  media: string[];
  planets2?: string;
  comments?: Comment[];
  backgroundColor: string;
  _count: {
    comments: number;
  };
};

interface Comment {
  id: number;
  content: string;
  created_at: string;
  profiles: {
    id: number;
    avatar_url: string;
    username: string;
  };
}

export const CommentItem: React.FC<Comment> = ({ id, content, created_at, profiles }) => {
  return (
    <div className="ml-2 my-3">
      <div className="flex items-center mb-2">
        <Avatar className="rounded-full">
          <AvatarImage src={"https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/avatars/" + profiles?.avatar_url ?? ""} />
          <AvatarFallback>Test</AvatarFallback>
        </Avatar>
        <div className="flex flex-wrap items-center ml-2">
          <div className="font-bold">{profiles?.username}</div>
        </div>
      </div>
      <div className="my-3 text-sm">{content}</div>
    </div>
  );
};

const CardForum: React.FC<TProps> = ({
  id,
  content,
  created_at,
  profiles,
  planets2,
  comments,
  media,
  _count,
  backgroundColor,
}) => {
  return (
    <>
      <Link href={`/profile/${profiles?.username}`}>
        <CardTitle className={`p-4 pb-0 group ${!profiles && "cursor-pointer"}`}>
          <div className={`flex items-start gap-4 ${backgroundColor}`}>
            <div className="flex items-center space-x-2">
              <Avatar className="rounded-md">
                <AvatarImage src={"https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/avatars/" + profiles?.avatar_url ?? ""} />
                <AvatarFallback className="rounded-md">
                  {profiles?.username}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className={`${!profiles && "group-hover:underline"}`}>
                  {profiles?.username}
                </h2>
              </div>
            </div>
            <div className="flex-grow"></div>
            <small className="text-foreground/60 text-sm">
              {getMetaData(created_at)}
            </small>
          </div>
        </CardTitle>
      </Link>
      <CardContent className="p-4 pt-2">
        <p className="mt-1 break-all max-w-full">
          {content}
        </p>
        <div>
          {media?.length > 0 && (
            <div className="flex gap-4">
              {media?.length > 0 && media.map(media => (
                <div key={media} className="rounded-md overflow-hidden"><img src={media} /></div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-0 flex-col items-start pb-2">
        <Separator className="mb-2" />
        {/* <div className="space-x-2 px-4 py-2">
          {comments && (
            <Button onClick={toggleComments} variant="outline" size="default" className="space-x-2">
              <MessagesSquare className="w-5 aspect-square" />
            </Button>
          )}
          <Button variant="outline" size="icon">
            <Share2 className="w-5 aspect-square" />
          </Button>
          <Button
            onClick={toggleComments}
            variant="destructive"
            size="icon"
          >
            <Megaphone className="w-5 aspect-square" />
          </Button>
        </div>
        {showComments && comments && comments.length > 0 && (
          <CardContent className="p-4 pt-2">
            <h3 className="text-lg font-semibold mb-2">Comments</h3>
            {comments.map((comment) => (
              <CommentItem key={comment.id} {...comment} />
            ))}
          </CardContent>
        )} */}
      </CardFooter>
    </>
  );
};

export default CardForum;

export function RoverContentCard({
  id, content, created_at, profiles, media
}) {
  console.log(media);

  return (
    <div className="bg-gray-100 h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src={"https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/avatars/" + profiles?.avatar_url ?? ""} />
              <AvatarFallback className="rounded-md">{profiles?.username}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-gray-800 font-semibold">{profiles.username}</p>
              <p className="text-gray-500 text-sm">{getMetaData(created_at)}</p>
            </div>
          </div>
          <div className="text-gray-500 cursor-pointer">
            <button className="hover:bg-gray-50 rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="7" r="1" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="17" r="1" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-gray-800">{content}</p>
        </div>
        {media?.length > 0 && (
          <div className="mb-4">
            <div key={media}><img src={media} className="w-full h-48 object-cover rounded-md" /></div>
          </div>
        )} {/* Comment/action section */}
      </div>
    </div>
  )
}