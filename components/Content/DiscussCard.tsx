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
}) => {
  return (
    <>
      <Link href={`/profile/${profiles?.username}`}>
        <CardTitle className={`p-4 pb-0 group ${!profiles && "cursor-pointer"}`}>
          <div className="flex items-start gap-4">
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