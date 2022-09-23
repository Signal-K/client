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
    voteCount: number;
    userVote: string;
    onVote: ( postId: number, voteType: string) => void;
}

export default function PlanetPostCard ( { id, content, created_at, media, profiles:authorProfile, planets2, voteCount, userVote, onVote }: PlanetPostCardProps ) {
    //const [avatar_url, setAvatarUrl] = useState<Profiles['avatar_url']>();
    const [profiles, setProfiles] = useState();
    const supabase = useSupabaseClient();
    const session = useSession();

    const [loading, setLoading] = useState(false);
    const [dropdownOpen,setDropdownOpen] = useState(false);

    const [votes, setVotes] = useState({});
    const voteType = votes[id];
    const [votingError, setVotingError] = useState<string | null>(null);
    const [upvotesCount, setUpvotesCount] = useState<number>(0);
    const [downvotesCount, setDownvotesCount] = useState<number>(0);
    
  useEffect(() => {
    // Fetch votes for the current post if the user is logged in
    if (session) {
      fetchVotesForPost(id);
    }
  }, [id, session]);

  useEffect(() => {
    let upvotes = 0;
    let downvotes = 0;

    Object.values(votes).forEach((voteType) => {
        if (voteType === 'up') {
            upvotes++;
        } else if (voteType === 'down') {
            downvotes++;
        }
    });

    setUpvotesCount(upvotes);
    setDownvotesCount(downvotes);
  }, [votes]);

  const rating = upvotesCount - downvotesCount;
  const formattedRating = rating >= 0 ? `+${rating}` : `${rating}`

  const fetchVotesForPost = async (postId: number) => {
    try {
      const { data, error } = await supabase
        .from("votes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", session?.user?.id);

      if (error) {
        throw new Error(error.message);
      }

      const voteData = data && data.length > 0 ? data[0] : null;
      setVotes((prevVotes) => ({
        ...prevVotes,
        [postId]: voteData?.vote_type || null,
      }));
    } catch (error) {
      setVotingError(error.message);
    }
  };

  const handleVote = async (postId: number, voteType: "up" | "down") => {
    try {
      setLoading(true);

      // Check if the user has already voted on this post
      if (votes[postId]) {
        if (votes[postId] === voteType) {
          // If the user has voted the same as the current vote type, remove the vote
          await supabase
            .from("votes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", session?.user?.id);

          setVotes((prevVotes) => ({
            ...prevVotes,
            [postId]: null,
          }));
        } else {
          // If the user has voted differently, update the vote
          const { data, error } = await supabase
            .from("votes")
            .update({ vote_type: voteType })
            .eq("post_id", postId)
            .eq("user_id", session?.user?.id);

          if (error) {
            throw new Error(error.message);
          }

          setVotes((prevVotes) => ({
            ...prevVotes,
            [postId]: data ? voteType : null,
          }));
        }
      } else {
        // If the user hasn't voted on this post yet, insert a new vote
        const { data, error } = await supabase.from("votes").insert([
          {
            post_id: postId,
            user_id: session?.user?.id,
            vote_type: voteType,
          },
        ]);

        if (error) {
          throw new Error(error.message);
        }

        setVotes((prevVotes) => ({
          ...prevVotes,
          [postId]: data ? voteType : null,
        }));
      }

      setLoading(false);
      setVotingError(null);
    } catch (error) {
      setLoading(false);
      setVotingError(error.message);
    }
  };
  
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
        {/* Vote buttons */}
        <div>
          
          {session && (
        <div className="flex gap-3 mt-3">
          <button
            className={`text-xl ${
              voteType === "up" ? "text-blue-500" : "text-gray-500"
            }`}
            onClick={() => handleVote(id, "up")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
          <button
            className={`text-xl ${
              voteType === "down" ? "text-red-500" : "text-gray-500"
            }`}
            onClick={() => handleVote(id, "down")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <p className="text-lg font-bold my-2">{formattedRating}</p>
        </div>
      )}
      {votingError && <p className="text-red-500 mt-2">{votingError}</p>}
        </div>
      </Card>
    );
  }