import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { PostCardAvatar } from "../AccountAvatar";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import { planetsImagesCdnAddress } from "../../constants/cdn";
import { Database } from "../../utils/database.types";
import Link from "next/link";
// import CommentItem from "./Comments/CommentsList";
 
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
 
interface Post {
  id: number;
  content: string;
  created_at: string;
  profiles: {
    id: number;
    avatar_url: string;
    username: string;
  };
  media?: string[];
  planets2?: string;
  comments?: Comment[];
}
 
interface PostModalProps extends Post {
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
  lightboxOpen: boolean;
  lightboxIndex: number;
}
 
const CommentItem: React.FC<Comment> = ({ id, content, created_at, profiles }) => {
  return (
    <div className="ml-8 my-3">
      <div className="flex items-center mb-2">
        <PostCardAvatar url={profiles?.avatar_url} size={25} />
        <div className="flex flex-wrap items-center ml-2">
          <div className="font-bold">{profiles?.username}</div>
          <div className="text-xs text-gray-500 ml-2">{new Date(created_at).toLocaleString()}</div>
        </div>
      </div>
      <div className="my-3 text-sm">{content}</div>
    </div>
  );
};
 
export const PostModal: React.FC<PostModalProps> = ({ content, created_at, profiles: authorProfile, media, planets2, comments }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showComments, setShowComments] = useState(true);
 
  const toggleComments = () => {
    setShowComments(!showComments);
  };
 
  const openLightbox = (index: number) => {
    setLightboxOpen(true);
    setLightboxIndex(index);
  };
 
  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxIndex(0);
  };
 
  return (
    <div className="bg-white rounded shadow-xs p-4 my-2">
      <div className="flex items-center mb-2">
        <PostCardAvatar url={authorProfile?.avatar_url} size={45} />
        <div className="flex flex-wrap items-center ml-2">
          <div className="font-bold">{authorProfile?.username}</div>
          {planets2 && (
            <div className="bg-green-200 py-1 px-2 text-xs rounded-sm text-green-800 ml-2">
              Planet: <Link legacyBehavior href ="/tests/planets/{planets2}">{planets2}</Link>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 ml-2">
          {new Date(created_at).toLocaleString()}
        </div>
      </div>
      <div className="my-3 text-sm">{content}</div>
      {comments && comments.length > 0 && (
        <div className="my-3 text-sm">
          <button className="text-blue-500" onClick={toggleComments}>
            {showComments ? "Hide Comments" : "Show Comments"}
          </button>
          {showComments &&
            comments.map((comment) => (
              <>
              <div
            className="absolute top-2 -left-3 h-10 border-l-2 border-gray-300"
            style={{
              transform: "rotate(30deg)",
              zIndex: -1,
            }}
          ></div>
              <CommentItem key={comment.id} {...comment} />
              </>
            ))}
        </div>
      )}
      {/* <center><div className="flex gap-4"><div className="rounded-md overflow-hidden"><img src={planets2?.cover} height='5%' width='5%' /></div></div></center> */}
      {/*<center><div className="flex gap-4"><div className="rounded-md overflow-hidden"><img src={planetsImagesCdnAddress + planets2 + '/' + 'download.png'} height='5%' width='5%' /></div></div></center>
                        {media?.length > 0 && (
                          <div className="flex gap-4">
                            {media?.length > 0 && media.map(media => (
                              <div key={media} className="rounded-md overflow-hidden"><img src={media} width='25%' height='25%' /></div>
                            ))}
                          </div>
                        )} */}
      {/* {lightboxOpen && (
        <Lightbox
          mainSrc={media[lightboxIndex]}
          nextSrc={media[(lightboxIndex + 1) % media.length]}
          prevSrc={media[(lightboxIndex + media.length - 1) % media.length]}
          onCloseRequest={closeLightbox}
          onMovePrevRequest={() => setLightboxIndex((lightboxIndex + media.length - 1) % media.length)}
          onMoveNextRequest={() => setLightboxIndex((lightboxIndex + 1) % media.length)}
        />
      )} */}
    </div>
  );
}

export default PostModal;

export const PostModalForUserList: React.FC<PostModalProps> = ({ content, created_at, profiles: authorProfile, media, planets2, comments }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showComments, setShowComments] = useState(true);

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const openLightbox = (index: number) => {
    setLightboxOpen(true);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxIndex(0);
  };

  return (
    <div className="bg-white rounded shadow-xs p-4 my-2">
      <div className="flex items-center mb-2">
        <PostCardAvatar url={authorProfile?.avatar_url} size={45} />
        <div className="flex flex-wrap items-center ml-2">
          <div className="font-bold">{authorProfile?.username}</div>
          {planets2 && (
            <div className="bg-green-200 py-1 px-2 text-xs rounded-sm text-green-800 ml-2">
              Planet: {planets2}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 ml-2">
          {new Date(created_at).toLocaleString()}
        </div>
      </div>
      <div className="my-3 text-sm">{content}</div>
      {showComments && comments && comments.map((comment) => (
        <CommentItem key={comment.id} {...comment} />
      ))}
      {/* <center><div className="flex gap-4"><div className="rounded-md overflow-hidden"><img src={planets2?.cover} height='5%' width='5%' /></div></div></center> */}
      {/*<center><div className="flex gap-4"><div className="rounded-md overflow-hidden"><img src={planetsImagesCdnAddress + planets2 + '/' + 'download.png'} height='5%' width='5%' /></div></div></center>
                        {media?.length > 0 && (
                          <div className="flex gap-4">
                            {media?.length > 0 && media.map(media => (
                              <div key={media} className="rounded-md overflow-hidden"><img src={media} width='25%' height='25%' /></div>
                            ))}
                          </div>
                        )} */}
      {/* {lightboxOpen && (
        <Lightbox
          mainSrc={media[lightboxIndex]}
          nextSrc={media[(lightboxIndex + 1) % media.length]}
          prevSrc={media[(lightboxIndex + media.length - 1) % media.length]}
          onCloseRequest={closeLightbox}
          onMovePrevRequest={() => setLightboxIndex((lightboxIndex + media.length - 1) % media.length)}
          onMoveNextRequest={() => setLightboxIndex((lightboxIndex + 1) % media.length)}
        />
      )} */}
    </div>
  );
}