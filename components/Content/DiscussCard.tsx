import { AvatarFallback, Avatar, AvatarImage } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { Card, CardContent, CardFooter, CardTitle } from "./PostCard";
import { Separator } from "@radix-ui/react-separator";
import { useToast } from "../ui/use-toast";
import { getMetaData } from "../../lib/helper/str.helper";
import { Megaphone, MessagesSquare, Share2 } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type TProps = {
  id: number;
  content: string;
  created_at: string;
  profiles: {
    id: number;
    avatar_url: string;
    username: string;
  };
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

const CommentItem: React.FC<Comment> = ({ id, content, created_at, profiles }) => {
  return (
    <div className="ml-2 my-3">
      <div className="flex items-center mb-2">
        <Avatar className="rounded-full">
        <AvatarImage src={"https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/avatars/" + profiles?.avatar_url ?? ""} />
          <AvatarFallback>Test</AvatarFallback> {/* {profiles?.username[0].toUpperCase()} */}
        </Avatar>
        <div className="flex flex-wrap items-center ml-2">
          <div className="font-bold">{profiles?.username}</div>
          {/* <div className="text-xs text-gray-500 ml-2">{new Date(created_at).toLocaleString()}</div> */}
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
  _count,
}) => {
  const [reason, setReason] = useState("");
  const [openReason, setOpenReason] = useState(false);
  const [response, setResponse] = useState({
    message: "",
  });

  const [showComments, setShowComments] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (!!response.message) {
      toast({
        title: "Notification",
        description: response.message,
      });

      setResponse({
        message: "",
      });
    }
  }, [response]);

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <><div style={{ width: '80%', margin: 'auto' }}>
      <div
        className={`fixed inset-0 bg-white/80 backdrop-blur-md z-20 items-center justify-center ${openReason ? "flex" : "hidden"
          }`}
      >
        <Card>
          <CardTitle className="font-bold p-4">What's your reason?</CardTitle>
          <CardContent className="p-4 pt-0">
          </CardContent>
          <CardFooter className="p-4 pt-0 flex gap-2 justify-between">
            <Button
              onClick={() => setOpenReason(false)}
              className="w-1/2"
              variant="outline"
            >
              Cancel
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Card>
        <Link href={`/profile/${profiles?.username}`}>
          <CardTitle
            className={`p-4 pb-0 group ${!profiles && "cursor-pointer"}`}
          >
            <div className="flex items-start gap-4">
              <Avatar className="rounded-md">
                <AvatarImage src={"https://qwbufbmxkjfaikoloudl.supabase.co/storage/v1/object/public/avatars/" + profiles?.avatar_url ?? ""} />
                <AvatarFallback className="rounded-md">
                  Test {/* {profiles?.username[0].toUpperCase() ?? "A"} */}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className={`${!profiles && "group-hover:underline"}`}>
                  {/* {profiles ? profiles.username : "Anonymous"} */}
                </h2>
                <p
                  className={`text-foreground/60 ${!profiles && "group-hover:underline"
                    }`}
                >
                    <div className="font-bold mt-3">{profiles?.username}</div> 
                </p>
              </div>
            </div>
          </CardTitle>
        </Link>
        <CardContent className="p-4 pt-2">
          <div>
            <small className="text-foreground/60 text-sm">
              Posted {getMetaData(created_at)}
            </small>
          </div>
          <p className="mt-1 break-all max-w-full">
            {content}
          </p>
        </CardContent>
        <CardFooter className="p-0 flex-col items-start pb-2">
          <Separator className="mb-2" />
          <div className="space-x-2 px-4 py-2">
            {comments && (
              <Button onClick={toggleComments} variant="outline" size="default" className="space-x-2">
                <MessagesSquare className="w-5 aspect-square" />
                {/* <span>{_count?.comments || 0}</span> */}
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
          )}
        </CardFooter>
      </Card></div>
    </>
  );
};

export default CardForum;