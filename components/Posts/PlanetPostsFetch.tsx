import Card, { ProfileCard } from "../Card";
import ReactTimeAgo from "react-time-ago";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import AccountAvatar, { PostCardAvatar } from "../AccountAvatar";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { UserContext } from "../../context/UserContext";

interface PlanetPostCardProps {
    id: number;
    content: string;
    created_at: string;
    media: string[];
    profiles: {
        id: string;
        avatar_url: string;
        username: string;
    };
    planets2: number;
}

export default function PlanetPostCard ( { id, content, created_at, media, profiles:authorProfile, planets2 } ) {
    const [loading, setLoading] = useState(false);
    //const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>();
    const [profiles, setProfiles] = useState();
    const supabase = useSupabaseClient();
    const session = useSession();

    const [upvotes, setUpvotes] = useState(0);
    const [downvotes, setDownvotes] = useState(0);
    const [voted, setVoted] = useState(false);

    const handleVote = async ( type: 'upvote' | 'downvote' ) => {
        if (voted) { return; };
        try {
            const { data, error } = await supabase
                .from('post_votes')
                .insert({ post_id: id, vote_type: type });
            if (error) {
                throw new Error(error.message);
            }
            if (type === 'upvote' ) {
                setUpvotes(upvotes + 1);
            } else {
                setDownvotes(downvotes + 1);
            }
            setVoted(true);
        } catch (error) {
            console.log("Error voting: ", error);
        }
    };
  
    const [dropdownOpen,setDropdownOpen] = useState(false);
  
    function openDropdown(e) {
      e.stopPropagation();
      setDropdownOpen(true);
    }
  
    function handleClickOutsideDropdown(e) {
      e.stopPropagation();
      setDropdownOpen(false);
    }
  
    return (
      <Card noPadding={false}>
        <div className="flex gap-3">
          <div>
            <Link href={'/posts/profile/'+authorProfile?.id}>
              <span className="cursor-pointer">
                <PostCardAvatar url={authorProfile?.avatar_url}
                  size={50} />
              </span>
            </Link>
          </div>
          <div className="grow">
            <p>
              <Link href={'/posts/profile/'+authorProfile?.id}>
                <span className="mr-1 font-semibold cursor-pointer hover:underline">
                  {authorProfile?.username}
                </span>
              </Link>
              shared a <Link legacyBehavior href='/posts/'><a className="text-socialBlue">post</a></Link> {/* Add link to ORCHID publication ID/Lens ID */}
            </p>
            <p className="text-gray-500 text-sm"><ReactTimeAgo date={ ( new Date(created_at)).getTime() } /></p>{/* <ReactTimeAgo date={ ( created_at instanceof Date ? created_at.getTime() : created_at ) } /> */}
          </div>
          <div className="relative">
            <button className="text-gray-400" onClick={openDropdown}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="bg-red w-5 h-5 absolute top-0"></div>
            )} 
          </div>
        </div>
        <div className="flex items-center gap-2 mtp-4">
            <button className="text-green-500" onClick={() => handleVote('upvote')}>Updoot</button><span>{upvotes}</span>
            <button className="text-green-500" onClick={() => handleVote('downvote')}>Downdoot</button><span>{downvotes}</span>
        </div>
        <div>
          <p className="my-3 text-sm">{content}</p>
          {media?.length > 0 && (
            <div className="flex gap-4">
              {media?.length > 0 && media.map(media => (
                <div key={media} className="rounded-md overflow-hidden"><img src={media} /></div>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  }