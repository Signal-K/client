"use client"

import { useEffect, useState } from "react"
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react"
import { AvatarGenerator } from "@/src/components/profile/setup/Avatar"
import { ThumbsUp, MessageCircle } from "lucide-react"

interface Vote {
    id: number
    user_id: string
    classification_id: number | null
    anomaly_id: number | null
    created_at: string
    upload: number | null
    vote_type: string | null
    classification?: {
        content?: string | null
        classificationtype?: string | null
    } | null
    user?: {
        username?: string | null
    } | null
}

interface Comment {
    id: number
    content: string
    author: string
    classification_id: number | null
    parent_comment_id?: number | null
    created_at: string
    user?: {
        username?: string | null
    } | null
}

export default function VotesList() {
    const supabase = useSupabaseClient()
    const session = useSession()

    const [votes, setVotes] = useState<Vote[]>([])
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        fetchVotes()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session])

    const fetchVotes = async () => {
        if (!session?.user) {
            setVotes([])
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            const userId = session.user.id

            const { data: classifications, error: classErr } = await supabase
                .from("classifications")
                .select("id")
                .eq("author", userId)

            if (classErr) throw classErr

            const classificationIds = (classifications ?? [])
                .map((c: any) => (c.id !== null && c.id !== undefined ? Number(c.id) : null))
                .filter(Boolean) as number[]

            if (classificationIds.length === 0) {
                setVotes([])
                setLoading(false)
                return
            }

            const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

            const { data: votesData, error: votesErr } = await supabase
                .from("votes")
                .select("*, classification:classification_id(content, classificationtype), user: user_id(username)")
                .in("classification_id", classificationIds)
                .gte("created_at", twoWeeksAgo)
                .order("created_at", { ascending: false })

            if (votesErr) throw votesErr

            const mapped = (votesData ?? []).map((v: any) => ({
                id: Number(v.id),
                user_id: v.user_id,
                classification_id: v.classification_id != null ? Number(v.classification_id) : null,
                anomaly_id: v.anomaly_id != null ? Number(v.anomaly_id) : null,
                created_at: v.created_at,
                upload: v.upload != null ? Number(v.upload) : null,
                vote_type: v.vote_type ?? null,
                classification: v.classification ?? null,
                user: v.user ?? null,
            })) as Vote[]

            setVotes(mapped)

            try {
                const { data: commentsData, error: commentsErr } = await supabase
                    .from("comments")
                    .select("*, user:author(username)")
                    .in("classification_id", classificationIds)
                    .neq("author", userId)
                    .gte("created_at", twoWeeksAgo)
                    .order("created_at", { ascending: false })

                if (commentsErr) throw commentsErr

                const mappedComments = (commentsData ?? []).map((c: any) => ({
                    id: Number(c.id),
                    content: c.content ?? "",
                    author: c.author,
                    classification_id: c.classification_id != null ? Number(c.classification_id) : null,
                    parent_comment_id: c.parent_comment_id != null ? Number(c.parent_comment_id) : null,
                    created_at: c.created_at,
                    user: c.user ?? null,
                })) as Comment[]

                setComments(mappedComments)
            } catch (err) {
                console.error("fetchComments error:", err)
                setComments([])
            }
        } catch (err) {
            console.error("fetchVotes error:", err)
            setVotes([])
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

    const allActivity = [
        ...votes.map((v) => ({ type: "vote" as const, data: v, created_at: v.created_at })),
        ...comments.map((c) => ({ type: "comment" as const, data: c, created_at: c.created_at })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading activity...</div>
            </div>
        )
    }

    if (allActivity.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 px-4 bg-muted/30 rounded-lg border border-dashed border-border">
                <ThumbsUp className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">No recent activity on your posts</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            {allActivity.slice(0, 5).map((activity, idx) => {
                if (activity.type === "vote") {
                    const vote = activity.data as Vote
                    return (
                        <div
                            key={`vote-${vote.id}`}
                            className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex-shrink-0 mt-0.5">
                                <AvatarGenerator author={vote.user?.username ?? vote.user_id} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm text-foreground">
                                        <span className="font-semibold">{vote.user?.username ?? "Someone"}</span> voted on your{' '}
                                        <span className="font-medium">{vote.classification?.classificationtype ?? "post"}</span>
                                    </p>
                                    <ThumbsUp className="w-4 h-4 text-primary flex-shrink-0" />
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground">{getRelativeTime(vote.created_at)}</span>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs text-muted-foreground">Classifications</span>
                                </div>
                            </div>
                        </div>
                    )
                } else {
                    const comment = activity.data as Comment
                    return (
                        <div
                            key={`comment-${comment.id}`}
                            className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex-shrink-0 mt-0.5">
                                <AvatarGenerator author={comment.user?.username ?? comment.author} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm text-foreground">
                                        <span className="font-semibold">{comment.user?.username ?? "Someone"}</span> commented on your post
                                    </p>
                                    <MessageCircle className="w-4 h-4 text-primary flex-shrink-0" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{comment.content}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-muted-foreground">{getRelativeTime(comment.created_at)}</span>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <span className="text-xs text-muted-foreground">Comments</span>
                                </div>
                            </div>
                        </div>
                    )
                }
            })}
        </div>
    )
}