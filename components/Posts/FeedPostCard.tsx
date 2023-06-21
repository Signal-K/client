import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { PostCardAvatar } from "../AccountAvatar";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";

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
}

export default function PostModal({ content, created_at, profiles: authorProfile, media, planets2 }: Post) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxOpen(true);
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxIndex(0);
  };

  return (
    <div className="bg-white rounded shadow-sm p-4 my-4">
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
      {media?.length > 0 && (
        <div className="flex gap-4">
          {media.map((image, index) => (
            <div
              key={image}
              className="rounded-md overflow-hidden cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <img src={image} alt="Post media" />
            </div>
          ))}
        </div>
      )}
      {lightboxOpen && (
        <Lightbox
          mainSrc={media[lightboxIndex]}
          nextSrc={media[(lightboxIndex + 1) % media.length]}
          prevSrc={media[(lightboxIndex + media.length - 1) % media.length]}
          onCloseRequest={closeLightbox}
          onMovePrevRequest={() => setLightboxIndex((lightboxIndex + media.length - 1) % media.length)}
          onMoveNextRequest={() => setLightboxIndex((lightboxIndex + 1) % media.length)}
        />
      )}
    </div>
  );
}