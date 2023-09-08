import React, { useEffect, useState } from "react"
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react"
import PostModal from "./FeedPostCard"

export default function SocialGraphHomeModal() {
  const supabase = useSupabaseClient()
  const session = useSession()
  const [posts, setPosts] = useState([])
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const postsResponse = await supabase
        .from("posts_duplicates")
        .select(
          "id, content, created_at, planets2, planetsss(id, temperature), profiles(id, avatar_url, full_name, username)"
        )
        .limit(10)
        .order("created_at", { ascending: false })

      const postIds = postsResponse.data?.map(post => post.id) || []
      const commentsResponse = await supabase
        .from("comments")
        .select(
          "id, content, created_at, profiles(id, avatar_url, username), post_id"
        )
        .in("post_id", postIds)
        .order("created_at", { ascending: true })

      const commentsData = commentsResponse.data || []

      const commentsByPostId = commentsData.reduce((acc, comment) => {
        const postId = comment.post_id
        if (!acc[postId]) {
          acc[postId] = []
        }
        acc[postId].push(comment)
        return acc
      }, {})

      const defaultPostModalProps = {
        openLightbox: () => {}, // Provide an empty function or implement the logic if needed
        closeLightbox: () => {}, // Provide an empty function or implement the logic if needed
        lightboxOpen: false, // Set to false if it's not used
        lightboxIndex: 0 // Set to the appropriate default value if it's not used
      }

      const postsWithComments = postsResponse.data?.map(post => ({
        ...post,
        comments: commentsByPostId[post.id] || [],
        ...defaultPostModalProps
      }))

      setPosts(postsWithComments || [])
    } catch (error) {
      console.error("Error fetching posts & comments: ", error.message)
    }
  }
  const defaultPostModalProps = {
    openLightbox: () => {}, // Provide an empty function or implement the logic if needed
    closeLightbox: () => {}, // Provide an empty function or implement the logic if needed
    lightboxOpen: false, // Set to false if it's not used
    lightboxIndex: 0 // Set to the appropriate default value if it's not used
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex-grow flex flex-col overflow-hidden">
      {posts?.map((post) => (
  <PostModal
    key={post.id}
    {...post}
    {...defaultPostModalProps}
    profiles={Array.isArray(post.profiles) ? 
      post.profiles.map(({ id, avatar_url, username }) => ({
        id,
        avatar_url,
        username
      })) : []}
  />
))}
      </div>
    </div>
  )
}
