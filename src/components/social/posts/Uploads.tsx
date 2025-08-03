"use client";

import React, { useEffect, useState } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

interface Upload {
  id: number;
  created_at: string;
  author: string | null;
  file_url: string; 
  content: string | null;  
  structure_type: string | null;
};

interface Comment {
  uploads: number;
  id: number;
  created_at: string;
  content: string;
  author: string;
};

export default function Uploads() {
  const supabase = useSupabaseClient();
  const session = useSession();

  const [uploads, setUploads] = useState<Upload[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [voteCounts, setVoteCounts] = useState<{ [uploadId: number]: number }>({});

  // Function to fetch uploads
  const fetchUploads = () => {
    if (!session?.user) {
      setError("User session not found.");
      setLoading(false);
      return;
    }
 
    setLoading(true);
    setError(null);
    
    supabase
      .from("uploads")
      .select("*")
      .eq("author", session.user.id)
      .order("created_at", { ascending: false })
      .then((result) => {
        if (result.error) {
          setError("Failed to load uploads.");
          console.error("Error fetching uploads:", result.error);
        } else {
          setUploads(result.data);
        }
        setLoading(false);
      });
  };

  const fetchVotesCount = (uploadId: number) => {
    return supabase
      .from("votes")
      .select("*")
      .eq("upload", uploadId)
      .then((result) => {
        if (result.error) {
          console.error("Error fetching vote count:", result.error);
          return 0; // Return 0 if there's an error
        } else {
          return result.data.length; // Return the count
        }
      });
  };

  // Function to handle vote submission
  const handleVote = (uploadId: number) => {
    if (!session?.user) return;

    supabase
      .from("votes")
      .insert([
        {
          upload: uploadId,
          user_id: session.user.id,
        },
      ])
      .then((result) => {
        if (result.error) {
          console.error("Error submitting vote:", result.error);
        } else {
          alert("Vote submitted!");
          // You can also refresh the vote count here after voting
        }
      });
  };

  // Function to fetch comments for a specific upload
  const fetchComments = (uploadId: number) => {
    supabase
      .from("comments")
      .select("*")
      .eq("uploads", uploadId)
      .order("created_at", { ascending: true })
      .then((result) => {
        if (result.error) {
          console.error("Error fetching comments:", result.error);
          setComments([]);
        } else {
          setComments(result.data);
        }
      });
  };

  // Function to handle comment submission
  const handleCommentSubmit = (uploadId: number) => {
    if (!newComment.trim()) return;  // Do not submit empty comment

    supabase
      .from("comments")
      .insert([
        {
          content: newComment,
          author: session?.user.id,
          uploads: uploadId,
        },
      ])
      .then((result) => {
        if (result.error) {
          console.error("Error submitting comment:", result.error);
          alert("There was an issue with submitting the comment.");
        } else {
          setNewComment(""); // Clear the comment input after successful submission
          alert("Comment submitted!");
          fetchComments(uploadId); // Refresh comments for the upload
        }
      });
  };

  useEffect(() => {
    fetchUploads();
  }, [session]);

  useEffect(() => {
    // Fetch votes count for each upload when uploads are fetched
    uploads.forEach((upload) => {
      fetchVotesCount(upload.id).then((count) => {
        setVoteCounts((prevVoteCounts) => ({
          ...prevVoteCounts,
          [upload.id]: count, // Store the vote count for each upload
        }));
      });
    });
  }, [uploads]);

  return (
    <div className="space-y-8">
      {loading ? (
        <p>Loading uploads...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        uploads.map((upload) => {
          return (
            <div key={upload.id} className="p-4 border rounded-lg bg-white">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{upload.structure_type}</h3>
                  <p className="text-gray-500 text-sm">{upload.created_at}</p>
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {upload.author ? `By: ${upload.author}` : "Anonymous"}
                </div>
              </div>

              <div className="mt-4">
                {/* Display media file (image from file_url) */}
                {upload.file_url && (
                  <img
                    src={upload.file_url}
                    alt="Uploaded file"
                    className="w-full h-auto object-contain"
                  />
                )}

                {/* Display content (post) */}
                {upload.content && <p className="mt-4 text-gray-700">{upload.content}</p>}
              </div>

              {/* Display number of votes */}
              <div className="mt-2 text-gray-600">
                <p>Votes: {voteCounts[upload.id] || 0}</p>
              </div>

              {/* Vote Button */}
              <button
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg"
                onClick={() => handleVote(upload.id)}
              >
                Vote
              </button>

              {/* Comment input */}
              <div className="mt-4">
                <textarea
                  className="w-full p-2 border rounded-lg"
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                />
                <button
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
                  onClick={() => handleCommentSubmit(upload.id)}
                >
                  Submit Comment
                </button>
              </div>

              {/* Display comments */}
              <div className="mt-4">
                {comments
                  .filter((comment) => comment.uploads === upload.id)
                  .map((comment) => (
                    <div key={comment.id} className="border-t mt-2 pt-2">
                      <p className="text-gray-700">{comment.content}</p>
                      <small className="text-gray-500">By: {comment.author}</small>
                    </div>
                  ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};