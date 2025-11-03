"use client"

import { useEffect, useState } from "react"
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"
import { AvatarGenerator } from "@/src/components/profile/setup/Avatar"
import { Star, TrendingUp, MessageCircle, ThumbsUp, Sparkles, ArrowRight } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import Link from "next/link"

interface Classification {
    id: number
    author: string
    content: string | null
    classificationtype: string | null
    created_at: string
    media?: any
    user?: {
        username?: string | null
    } | null
    votes_count?: number
    comments_count?: number
    author_engagement_score?: number
    classificationConfiguration?: {
        annotationOptions?: string[]
        [key: string]: any
    } | null
}

export default function InterestingPostsForYou() {
    const supabase = useSupabaseClient()
    const session = useSession()

    const [posts, setPosts] = useState<Classification[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [userEngagementScore, setUserEngagementScore] = useState<number>(0)

    useEffect(() => {
        fetchPosts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session])

    const fetchPosts = async () => {
        setLoading(true)

        try {
            const { data, error } = await supabase
                .from("classifications")
                .select(
                    `
                        id,
                        author,
                        content,
                        classificationtype,
                        created_at,
                        media,
                        classificationConfiguration:classificationConfiguration,
                        user:author(username)
                    `,
                )
                .neq("author", session?.user?.id) // Fetch posts from other users
                .order("created_at", { ascending: false }) // Order by recency initially
                .limit(30) // Fetch a larger set of posts for sorting

            if (error) throw error

            // Fetch current user's engagement score
            const { count: userVotesCount } = await supabase
                .from("votes")
                .select("*", { count: "exact", head: true })
                .eq("user_id", session?.user?.id)

            const { count: userCommentsCount } = await supabase
                .from("comments")
                .select("*", { count: "exact", head: true })
                .eq("author", session?.user?.id)

            const userEngagementScore = (userVotesCount ?? 0) + (userCommentsCount ?? 0)

            // For each classification, count votes on the post AND author's total engagement
            const postsWithEngagement = await Promise.all(
                (data ?? []).map(async (post: any) => {
                    // Count votes on this specific post
                    const { count: postVotesCount } = await supabase
                        .from("votes")
                        .select("*", { count: "exact", head: true })
                        .eq("classification_id", post.id)

                    // Count comments on this specific post
                    const { count: postCommentsCount } = await supabase
                        .from("comments")
                        .select("*", { count: "exact", head: true })
                        .eq("classification_id", post.id)

                    // Count total votes made BY this author (their engagement)
                    const { count: authorVotesCount } = await supabase
                        .from("votes")
                        .select("*", { count: "exact", head: true })
                        .eq("user_id", post.author)

                    // Count total comments made BY this author (their engagement)
                    const { count: authorCommentsCount } = await supabase
                        .from("comments")
                        .select("*", { count: "exact", head: true })
                        .eq("author", post.author)

                    // Calculate author's total engagement score
                    const authorEngagementScore = (authorVotesCount ?? 0) + (authorCommentsCount ?? 0)

                    return {
                        id: Number(post.id),
                        author: post.author,
                        content: post.content,
                        classificationtype: post.classificationtype,
                        created_at: post.created_at,
                        media: post.media,
                        user: post.user,
                        votes_count: postVotesCount ?? 0,
                        comments_count: postCommentsCount ?? 0,
                        author_engagement_score: authorEngagementScore,
                        classificationConfiguration: post.classificationConfiguration ?? post.classificationconfiguration ?? null,
                    }
                }),
            )

            // Sort by author engagement score (votes + comments they've made), then by post recency
            const sortedPosts = postsWithEngagement
                .sort((a, b) => {
                    const scoreDiff = (b.author_engagement_score ?? 0) - (a.author_engagement_score ?? 0)
                    if (scoreDiff !== 0) return scoreDiff
                    // If engagement scores are equal, sort by recency
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                })
                .slice(0, 8)

            setPosts(sortedPosts)
            setUserEngagementScore(userEngagementScore)
        } catch (err) {
            console.error("fetchPosts error:", err)
            setPosts([])
        } finally {
            setLoading(false)
        }
    }

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "Now"
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        return `${diffDays}d ago`
    }

    const getMediaUrl = (media: any) => {
        if (!media) return null
        
        // Media format: [["url", "filename"], ["id", "id"]]
        if (Array.isArray(media) && media.length > 0) {
            const firstItem = media[0]
            if (Array.isArray(firstItem) && firstItem.length > 0) {
                // Check if it's a URL (should start with http or be a path)
                const url = firstItem[0]
                if (typeof url === "string" && (url.startsWith("http") || url.startsWith("/"))) {
                    return url
                }
            }
        }
        
        return null
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading posts...</div>
            </div>
        )
    }

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-muted/30 rounded-lg border border-dashed border-border">
                <Star className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">No trending posts right now</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {/* Current User's Engagement Score */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/30">
                <div className="flex-shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground mb-1">
                        Your Engagement Score
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Your current engagement score is <strong>{userEngagementScore}</strong>. Keep voting and commenting to increase your visibility and rewards!
                    </p>
                </div>
            </div>

            {/* Engagement Incentive Message */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
                <div className="flex-shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground mb-1">
                        Want Your Discoveries Reviewed Faster?
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Vote and comment on these posts to boost your visibility! Active community members get priority review 
                        on their own discoveries—plus bonus rewards for contributing to research.
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <ThumbsUp className="w-3.5 h-3.5 text-primary" />
                            <span>Vote on posts</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MessageCircle className="w-3.5 h-3.5 text-primary" />
                            <span>Leave comments</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Posts from engaged authors */}
            {posts.map((post) => {
                const mediaUrl = getMediaUrl(post.media)
                
                return (
                    <div
                        key={post.id}
                        className="flex flex-col gap-3 p-3 rounded-lg bg-card border border-border hover:bg-muted/30 transition-colors"
                    >
                        {/* Post Header */}
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className="flex-shrink-0 mt-0.5">
                                    <AvatarGenerator author={post.user?.username ?? post.author} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground">
                                        <span className="font-semibold">{post.user?.username ?? "Explorer"}</span> classified a{' '}
                                        <span className="font-medium">{post.classificationtype ?? "discovery"}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                {post.votes_count && post.votes_count > 0 && (
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3 text-primary" />
                                        <span className="text-xs font-medium text-primary">{post.votes_count}</span>
                                    </div>
                                )}
                                {post.comments_count && post.comments_count > 0 && (
                                    <div className="flex items-center gap-1">
                                        <MessageCircle className="w-3 h-3 text-accent" />
                                        <span className="text-xs font-medium text-accent">{post.comments_count}</span>
                                    </div>
                                )}
                                {post.author_engagement_score && post.author_engagement_score > 0 && (
                                    <div 
                                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/30"
                                        title={`Active contributor: ${post.author_engagement_score} votes & comments`}
                                    >
                                        <Sparkles className="w-3 h-3 text-primary" />
                                        <span className="text-xs font-medium text-primary">{post.author_engagement_score}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Media */}
                        {mediaUrl && (
                            <div className="flex-1 min-h-[150px] max-h-[200px] rounded-lg overflow-hidden bg-muted/50">
                                <img
                                    src={mediaUrl}
                                    alt={`Classification ${post.id}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Content */}
                        {post.content && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{post.content}</p>
                        )}

                        {/* Annotation Options */}
                        {post.classificationConfiguration?.annotationOptions && (
                            <div className="flex flex-wrap gap-2">
                                {post.classificationConfiguration.annotationOptions.slice(0, 3).map((opt: string, idx: number) => (
                                    <span key={idx} className="text-[11px] px-2 py-0.5 rounded-full bg-muted/20 text-muted-foreground">
                                        {opt}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{getRelativeTime(post.created_at)}</span>
                                <span>•</span>
                                <span>Classifications</span>
                            </div>
                            <Link href={`/posts/${post.id}`}>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-1 h-7 text-xs"
                                >
                                    Review
                                    <ArrowRight className="w-3 h-3" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}