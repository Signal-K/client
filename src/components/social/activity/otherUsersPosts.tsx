"use client"

import { useEffect, useState } from "react"
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"
import { AvatarGenerator } from "@/src/components/profile/setup/Avatar"
import { Star, TrendingUp } from "lucide-react"
import Link from "next/link"

interface Classification {
    id: number
    author: string
    content: string | null
    classificationtype: string | null
    created_at: string
    user?: {
        username?: string | null
    } | null
    votes_count?: number
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

    useEffect(() => {
        fetchPosts()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session])

    const fetchPosts = async () => {
        setLoading(true)

        try {
            const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

            const { data, error } = await supabase
                .from("classifications")
                .select(
                    `
                        id,
                        author,
                        content,
                        classificationtype,
                        created_at,
                        classificationConfiguration:classificationConfiguration,
                        user:author(username)
                    `,
                )
                .neq("author", session?.user?.id)
                .gte("created_at", twoWeeksAgo)
                .order("created_at", { ascending: false })
                .limit(10)

            if (error) throw error

            // For each classification, count votes
            const postsWithVotes = await Promise.all(
                (data ?? []).map(async (post: any) => {
                    const { count } = await supabase
                        .from("votes")
                        .select("*", { count: "exact", head: true })
                        .eq("classification_id", post.id)

                    return {
                        id: Number(post.id),
                        author: post.author,
                        content: post.content,
                        classificationtype: post.classificationtype,
                        created_at: post.created_at,
                        user: post.user,
                        votes_count: count ?? 0,
                        classificationConfiguration: post.classificationConfiguration ?? post.classificationconfiguration ?? null,
                    }
                }),
            )

            // Sort by votes and take top 5
            const sortedPosts = postsWithVotes.sort((a, b) => (b.votes_count ?? 0) - (a.votes_count ?? 0)).slice(0, 5)

            setPosts(sortedPosts)
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
        <div className="space-y-2">
            {posts.map((post) => (
                <Link
                    key={post.id}
                    href={`/classifications/${post.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors"
                >
                    <div className="flex-shrink-0 mt-0.5">
                        <AvatarGenerator author={post.user?.username ?? post.author} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-foreground">
                                <span className="font-semibold">{post.user?.username ?? "Explorer"}</span> classified a{' '}
                                <span className="font-medium">{post.classificationtype ?? "discovery"}</span>
                            </p>
                            {post.votes_count && post.votes_count > 0 && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <TrendingUp className="w-3 h-3 text-primary" />
                                    <span className="text-xs font-medium text-primary">{post.votes_count}</span>
                                </div>
                            )}
                        </div>
                        {post.content && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.content}</p>}

                        {/* Show annotation options from classificationConfiguration if present */}
                        {post.classificationConfiguration?.annotationOptions && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {post.classificationConfiguration.annotationOptions.slice(0, 3).map((opt: string, idx: number) => (
                                    <span key={idx} className="text-[11px] px-2 py-0.5 rounded-full bg-muted/20 text-muted-foreground">
                                        {opt}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">{getRelativeTime(post.created_at)}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">Classifications</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}